import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-black/50 p-8 shadow-lg backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="mb-4 text-center text-2xl font-bold text-luxury-white">Authentication Error</h1>

        <p className="mb-6 text-center text-gray-300">
          There was a problem with your authentication request. This could be due to an expired link or an invalid
          token.
        </p>

        <div className="space-y-4">
          <Link href="/auth/login" className="block w-full">
            <Button className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700">
              Return to Login
            </Button>
          </Link>

          <Link href="/" className="block w-full">
            <Button
              variant="outline"
              className="w-full border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black bg-transparent"
            >
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
