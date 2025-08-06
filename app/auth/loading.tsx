import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="text-lg font-medium text-luxury-white">Loading...</p>
      </div>
    </div>
  )
}
