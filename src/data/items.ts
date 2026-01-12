import { createServerFn } from "@tanstack/react-start";
import { firecrawl } from "@/lib/firecrawl";
import { bulkImportSchema, importSchema, searchSchema } from "@/schemas/import";
import { prisma } from "@/db";
import { extractSchema } from "@/schemas/import";
import z from "zod";
import { authFnMiddleware } from "@/middlewares/auth";
import { notFound } from "@tanstack/react-router";
import { generateText } from "ai";
import { openrouter } from "@/lib/openRouter";
import { SearchResultWeb } from "@mendable/firecrawl-js";

export const scrapeUrlFn = createServerFn({ method: 'GET' })
    .middleware([authFnMiddleware])
    .inputValidator(importSchema)
    .handler( async ({data, context}) => {
        
        const item = await prisma.savedItem.create({
            data: {
                url: data.url,
                userId: context.session.user.id,
                status: 'PROCESSING',
            },
        })

        try {
         
        const result = await firecrawl.scrape(
            data.url,
            {
                formats: ['markdown', {
                    type: 'json',
                    schema: extractSchema,
                }],
                onlyMainContent: true,
            },
        )

        const jsonData = result.json as z.infer<typeof extractSchema>

        let publishedAt = null
        if (jsonData.publishedAt) {
            const parsedDate = new Date(jsonData.publishedAt)
            if (!isNaN(parsedDate.getTime())) {
                publishedAt = parsedDate
            }
        }

        const updatedItem = await prisma.savedItem.update({
            where: {
                id: item.id,
            },
            data: {
                title: result.metadata?.title || null,
                content: result.markdown || null,
                ogImage: result.metadata?.ogImage || null,
                author: jsonData.author || null,
                publishedAt: publishedAt,
                status: 'COMPLETED',
                updatedAt: new Date(),
            },
        })

        return updatedItem   
        } catch (error) {
            const failedItem = await prisma.savedItem.update({
                where: {
                    id: item.id,
                },
                data: {
                    status: 'FAILED',
                    updatedAt: new Date(),
                },
            })
            return failedItem
        }
    })

export const mapUrlFn = createServerFn({ method: 'POST' })
    .middleware([authFnMiddleware])
    .inputValidator(bulkImportSchema)
    .handler( async ({data}) => {
        const result = await firecrawl.map(
            data.url,
            {
                limit: 10,
                search: data.search,
            },
        )
        return result.links
    })

export type BulkScrapeProgress = {
    completed: number
    total: number
    url: string
    status: 'success' | 'failed'
}

export const bulkScrapeUrlsFn = createServerFn({ method: 'POST' })
    .middleware([authFnMiddleware])
    .inputValidator(z.object({ urls: z.array(z.url())}))
    .handler( async function* ({ data, context }) {
        const total = data.urls.length

        let urlResults: Record<string, boolean> = {}

        for (let i = 0; i < data.urls.length; i++) {
            const url = data.urls[i]
            const item = await prisma.savedItem.create({
                data: {
                    url: url,
                    userId: context.session.user.id,
                    status: 'PENDING',
                },
            })

            let status: BulkScrapeProgress['status'] = 'success'

            try {
            
                const result = await firecrawl.scrape(
                    url,
                    {
                        formats: ['markdown', {
                            type: 'json',
                            schema: extractSchema,
                        }],
                        onlyMainContent: true,
                    },
                )

                const jsonData = result.json as z.infer<typeof extractSchema>

                let publishedAt = null
                if (jsonData.publishedAt) {
                    const parsedDate = new Date(jsonData.publishedAt)
                    if (!isNaN(parsedDate.getTime())) {
                        publishedAt = parsedDate
                    }
                }

                await prisma.savedItem.update({
                    where: {
                        id: item.id,
                    },
                    data: {
                        title: result.metadata?.title || null,
                        content: result.markdown || null,
                        ogImage: result.metadata?.ogImage || null,
                        author: jsonData.author || null,
                        publishedAt: publishedAt,
                        status: 'COMPLETED',
                        updatedAt: new Date(),
                    },
                })

                urlResults[url] = true

            } catch (error) {
                status = 'failed'
                await prisma.savedItem.update({
                    where: {
                        id: item.id,
                    },
                    data: {
                        status: 'FAILED',
                        updatedAt: new Date(),
                    },
                })
                urlResults[url] = false
            }

            const progress: BulkScrapeProgress = {
                completed: i + 1,
                total: total,
                url: url,
                status: status
            }

            yield progress
        }
        return urlResults
    })


export const getItemsFn = createServerFn({ method: 'GET' })
    .middleware([authFnMiddleware])
    .handler( async ({ context }) => {
        const items = await prisma.savedItem.findMany({
            where: {
                userId: context.session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return items
    })


export const getItemById = createServerFn({ method: 'GET' })
    .middleware([authFnMiddleware])
    .inputValidator(z.object({ id: z.string() }))
    .handler( async ({ data, context }) => {
        const item = await prisma.savedItem.findUnique({
            where: {
                id: data.id,
                userId: context.session.user.id,
            },
        })

        if (!item) {
            throw notFound()
        }

        return item
    })

    export const saveSummaryAndGenerateTagsFn = createServerFn({ method: 'POST' })
        .middleware([authFnMiddleware])
        .inputValidator(z.object({ 
            id: z.string(),
            summary: z.string(),
        }))
        .handler( async ({ data, context }) => {
            const existing = await prisma.savedItem.findUnique({
                where: {
                    id: data.id,
                    userId: context.session.user.id,
                },
            })

            if (!existing) {
                throw notFound()
            }

            const { text } = await generateText({
                model: openrouter.chat('xiaomi/mimo-v2-flash:free'),
                system: 'You are a helpful assistant that extracts relevant tags from content summaries. Extract 3-5 short, relevant tags that categorize the content. Return ONLY a comma-separated list of tags, nothing else. Example: technology, programmin, web development, javascript',
                prompt: `Extract tags from this summary: \n\n${data.summary}`,
            })

            const tags = text
                .split(',')
                .map((tag) => tag.trim().toLowerCase())
                .filter((tag) => tag.length > 0)
                .slice(0, 5)

            const item = await prisma.savedItem.update({
                where: {
                    userId: context.session.user.id,
                    id: data.id,
                },
                data: {
                    summary: data.summary,
                    tags: tags
                },
            })

            return item
        })

export const searchWebFn = createServerFn({ method: 'GET' })
    .middleware([authFnMiddleware])
    .inputValidator(searchSchema)
    .handler( async ({ data }) => {
        const results = await firecrawl.search(data.query, {
            limit: 10,
            location: 'US',
            tbs: 'qdr:y'
        })
        
        return results.web?.map((item) => ({
            url: (item as SearchResultWeb).url,
            title: (item as SearchResultWeb).title,
            description: (item as SearchResultWeb).description,
        })) as SearchResultWeb[]
    })