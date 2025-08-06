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

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref") || ""

  useEffect(() => {
    setIsClient(true)

    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsAuthenticated(true)
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and numbers")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            referral_code: referralCode,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // Check if user needs to confirm their email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please log in instead.")
      } else {
        setSuccess(true)
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "An error occurred during registration")
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

  // If registration was successful, show success message
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-800 bg-black/50 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="mb-4 text-center text-2xl font-bold text-luxury-white">Registration Successful!</h1>

          <p className="mb-6 text-center text-gray-300">
            We've sent a confirmation email to <span className="font-medium text-violet-400">{email}</span>. Please
            check your inbox and click the verification link to complete your registration.
          </p>

          <div className="space-y-4">
            <Link href="/auth/login" className="block w-full">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700">
                Go to Login
              </Button>
            </Link>

            <Link href="/" className="block w-full">
              <Button
                variant="outline"
                className="w-full border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black bg-transparent"
              >
                Return to Homepage
              </Button>
            </Link>
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

        <h1 className="mb-6 text-center text-2xl font-bold text-luxury-white">Create an Account</h1>

        {error && (
          <Alert variant="destructive" className="mb-4 border-red-500/50 bg-red-950/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            <Label htmlFor="password" className="text-luxury-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-700 bg-gray-800 text-luxury-white focus:border-violet-500"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-luxury-white">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-gray-700 bg-gray-800 text-luxury-white focus:border-violet-500"
              placeholder="••••••••"
            />
          </div>

          {referralCode && (
            <div className="rounded-md bg-violet-900/20 p-3">
              <p className="text-sm text-violet-300">
                Signing up with referral code: <span className="font-medium">{referralCode}</span>
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
