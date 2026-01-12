import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/web/login-form'

export const Route = createFileRoute('/_auth/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-md md:max-w-4xl">
      <LoginForm />
    </div>
  )
}
