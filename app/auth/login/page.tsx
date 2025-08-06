"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const confirmSuccess = searchParams.get("confirmed") === "true"
  const resetSuccess = searchParams.get("reset") === "true"

  useEffect(() => {
    setIsClient(true)

    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsAuthenticated(true)
        router.push(redirectTo)
      }
    }

    checkAuth()

    // Set success message if coming from email confirmation
    if (confirmSuccess) {
      setSuccess("Email confirmed successfully! You can now log in.")
    }

    // Set success message if coming from password reset
    if (resetSuccess) {
      setSuccess("Password reset successfully! You can now log in with your new password.")
    }
  }, [confirmSuccess, resetSuccess, redirectTo, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {
        // Use window.location for a full page reload to ensure auth state is refreshed
        window.location.href = redirectTo
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess("Password reset link sent to your email")
    } catch (error: any) {
      console.error("Reset password error:", error)
      setError(error.message || "An error occurred while sending the reset link")
    } finally {
      setLoading(false)
    }
  }

  // If we're checking authentication on the client, show a loading state
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-800 bg-black/50 p-8 shadow-lg backdrop-blur-sm">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        </div>
      </div>
    )
  }

  // If user is authenticated, show a loading state while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-800 bg-black/50 p-8 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-center text-luxury-white">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-black/50 p-8 shadow-lg backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <div className="relative h-20 w-20">
            <Image src="/images/limitless-x-logo.png" alt="Limitless X" fill className="object-contain" priority />
          </div>
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-luxury-white">Log In</h1>

        {error && (
          <Alert variant="destructive" className="mb-4 border-red-500/50 bg-red-950/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500/50 bg-green-950/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-luxury-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-700 bg-gray-800 text-luxury-white focus:border-violet-500"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-luxury-white">
                Password
              </Label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Forgot Password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-700 bg-gray-800 text-luxury-white focus:border-violet-500"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-violet-400 hover:text-violet-300">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
