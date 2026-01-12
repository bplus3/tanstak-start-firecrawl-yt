import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getItemsFn } from '@/data/items'
import { ItemStatus } from '@/generated/prisma/enums'
import { copyToClipboard } from '@/lib/clipboard'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Copy, Inbox } from 'lucide-react'
import { Suspense, use, useEffect, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'

const itemsSearchSchema = z.object({
  q: z.string().default(''),
  status: z.union([z.literal('all'), z.enum(ItemStatus)]).default('all'),
})

type ItemsSearch = z.infer<typeof itemsSearchSchema>

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => ({ itemsPromise: getItemsFn() }),
  validateSearch: itemsSearchSchema,
  head: () => ({
    meta: [
      {
        title: 'Saved Items'
      },
      {
        property: 'og:title',
        content: 'Saved Items',
      },
    ],
  }),
})

function ItemsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1,2,3,4].map((i) => (
        <Card key={i} className="overflow-hidden pt-0">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="size-8" />
            </div>
          </CardHeader>

          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-40" />
        </Card>
      ))}
    </div>
  )
}

function ItemsList({
  q,
  status,
  data
}: {
  q: ItemsSearch['q'],
  status: ItemsSearch['status'],
  data: ReturnType<typeof getItemsFn>
}) {
  const items = use(data)
  const filteredItems = items.filter((item) => {
    const matchesQuery = 
      q === '' || 
      item.title?.toLowerCase().includes(q.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))

    const matchesStatus = status === 'all' || item.status === status

    return matchesQuery && matchesStatus
  })

  if (filteredItems.length === 0) {
    const title = items.length === 0 ? 'No items saved yet' : 'No items found'
    const description = items.length === 0 ? 'Import a Url to get started with saving your content' : 'No items match your currect search filter'

    return (
      <Empty className="border h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox className="size-12" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>
              {description}
            </EmptyDescription>
          </EmptyHeader>
          {items.length === 0 && (
            <EmptyContent>
              <Link className={buttonVariants()} to="/dashboard/import">Import URL</Link>
            </EmptyContent>
          )}
      </Empty>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {filteredItems.map((item) => (
        <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg pt-0">
          <Link to='/dashboard/items/$itemId' params={{ itemId: item.id }}>
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img 
                src={item.ogImage ?? ''} 
                alt={item.title ?? 'Article Thumbnail'} 
                className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            </div>

            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={item.status === 'COMPLETED' ? 'default' : 'secondary'}>{item.status.toLowerCase()}</Badge>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={async (e) => {
                    e.preventDefault()
                    await copyToClipboard(item.url)
                    toast.success('URL copied to clipboard')
                  }}>
                  <Copy className="size-4" />
                </Button>
              </div>
              <CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </CardTitle>
              {item.author && <p className="text-xs text-muted-foreground">{item.author}</p>}
              {item.summary && (
                <CardDescription className="line-clamp-3 text-sm">
                 {item.summary}
                </CardDescription>
              )}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData()
  const { q, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    if (searchInput === q) return
    const timeoutId = setTimeout(() => {
      navigate({ search: (prev) => ({...prev, q: searchInput})})
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchInput, navigate, q])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">Your saved articles and content</p>
      </div>

      <div className="flex gap-4">
        <Input placeholder='Search by title or tags' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Select value={status} onValueChange={(value) => navigate({
          search: (prev) => ({
            ...prev,
            status: value as typeof status
          })
        })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.values(ItemStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <Suspense fallback={<ItemsGridSkeleton />}>
        <ItemsList q={q} status={status} data={itemsPromise} />
      </Suspense>
    </div>
  )
}
 