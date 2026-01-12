import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, Link } from 'lucide-react'
import { importSchema, bulkImportSchema } from '@/schemas/import'
import { toast } from 'sonner'
import { useTransition, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { scrapeUrlFn, mapUrlFn, bulkScrapeUrlsFn } from '@/data/items'
import { type SearchResultWeb } from '@mendable/firecrawl-js'
import { Checkbox } from '@/components/ui/checkbox'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()

  const [discoveredLinks, setDiscoveredLinks] = useState<Array<SearchResultWeb>>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  
  function handleSelectAll() {
    if (selectedUrls.size === discoveredLinks.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)))
    }
  }

  function handleCheckChanged(url: string) {
    const newSelected = new Set(selectedUrls)

    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }

    setSelectedUrls(newSelected)
  }

  function handleBulkImport() {
    if (selectedUrls.size === 0) {
      toast.error('Please select at least one URL to import')
      return
    }

    startBulkTransition(async () => {
      const data = await bulkScrapeUrlsFn({ data: { urls: Array.from(selectedUrls) }})

      if (!data) {
        toast.error('Failed to import URLs')
      } else {
        toast.success(`Successfully imported ${selectedUrls.size} URLS`)
      }
    })
  }

    const form = useForm({
      defaultValues: {
        url: "",
      },
      validators: {
        onSubmit: importSchema,
      },
  
      onSubmit: ({ value }) => {
        startTransition(async () => {
          try {
            const item = await scrapeUrlFn({ data: value })
            toast.success(`Imported ${item.title}`)
            form.reset()
          } catch (error) {
            toast.error("Failed to import!")
          }
        })
      },
    })

    const bulkForm = useForm({
      defaultValues: {
        url: "",
        search: "",
      },
      validators: {
        onSubmit: bulkImportSchema,
      },
  
      onSubmit: ({ value }) => {
        startTransition(async () => {
          const data = await mapUrlFn({ data: value })
          toast.success("Links discovered!")
          setDiscoveredLinks(data)  
        })
      },
    })
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Content</h1>
          <p className="text-muted-foreground">
            Save web pages to your library or later reading.
          </p>
        </div>
        <Tabs defaultValue="single">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="single" className="cursor-pointer">
              <Link className="h-5 w-5" />
              Single Url
            </TabsTrigger>
            <TabsTrigger value="bulk" className="cursor-pointer">
              <Globe className="h-5 w-5" />
              Bulk Import
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import Single Url</CardTitle>
                <CardDescription>
                  Import a single url to your library.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}>
                  <FieldGroup>
                    <form.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Url</FieldLabel>
                            <Input
                              id={field.name}
                              type="url"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <Field>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "Importing..." : "Import"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Import multiple urls to your library.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  bulkForm.handleSubmit()
                }}>
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Url</FieldLabel>
                            <Input
                              id={field.name}
                              type="text"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <bulkForm.Field
                      name="search"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Filter (optional)</FieldLabel>
                            <Input
                              id={field.name}
                              type="text"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="e.g. blog, docs, tutorial"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <Field>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "Searching..." : "Search"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form> 

                {discoveredLinks.length > 0 && (
                  <div className="space-y-4 mt-4">
                    <div className='flex items-center justify-between'>
                      <h2 className="text-sm font-semibold">{discoveredLinks.length} Discovered Links Found</h2>
                      <Button variant="outline" size="sm" onClick={handleSelectAll}>
                        {selectedUrls.size === discoveredLinks.length ?
                          'Deselect All' : 'Select All'
                        }
                      </Button>
                      <div className="max-h-80 space-y-2 overflow-y-auto border p-4">
                        {discoveredLinks.map((link) => (
                        <label key={link.url} className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 p-2">
                          <Checkbox checked={selectedUrls.has(link.url)}
                          onCheckedChange={() => handleCheckChanged(link.url)} className="mt-0.5" />
                          <div className="min-ww-0 flex-1">
                            <p className="truncate text-sm font-medium">{link.title ?? "Title not found"}</p>
                            <p className="text-muted-foreground truncate text-xs">{link.description ?? "Description not found"}</p>
                            <p className="text-muted-foreground truncate text-xs">{link.url}</p>
                          </div>
                        </label>
                        ))}
                      </div>
                      <Button type="button" className="w-full" disabled={isBulkPending} onClick={handleBulkImport}>
                        {isBulkPending ? 'Importing...' : 'Import'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
