import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export default function Header() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("You have successfully signed out!")
          navigate({ to: "/login" })
        },
        onError: ({error}) => {
          toast.error(error.message)
        }
      }
    })
  }

  return (
    <>
      <header className="p-4 bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">
            <img
              src="/tanstack-word-logo-white.svg"
              alt="TanStack Logo"
              className="h-10"
            />
          </Link>
        </h1>
        <div className="space-x-4">
          {isPending ? null : session ? (
            <>
            <Button variant="secondary" onClick={handleSignOut}>
              Logout
          </Button>
          <Button>
              <Link to="/dashboard">
                Dashboard
              </Link>
          </Button>
          </>
          ): (
            <>
            <Button variant="secondary">
            <Link to="/login">
              Login
            </Link>
          </Button>
          <Button>
            <Link to="/signup">
              Signup
            </Link>
          </Button>
            </>
          )}
        </div>
      </div>
      </header>
    </>
  )
}
