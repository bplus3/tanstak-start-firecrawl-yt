import { createFileRoute } from '@tanstack/react-router'
import { getSessionFn } from '@/data/session'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  loader: () => getSessionFn()
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <div>Hello { data.user.name }!</div>
}
