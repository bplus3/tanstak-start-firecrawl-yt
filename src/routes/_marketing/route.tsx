import Header from '@/components/Header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
         <Header />
         <div>
            <Outlet />
         </div>
    </main>
)
}
