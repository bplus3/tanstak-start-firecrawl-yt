import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '@/components/web/signup-form'

export const Route = createFileRoute('/_auth/signup/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-sm md:max-w-4xl">
      <SignupForm />
    </div>
  )
}
