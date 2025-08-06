"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ConfirmPage() {
  const [verificationState, setVerificationState] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [countdown, setCountdown] = useState(5)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const type = searchParams.get("type")

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !type) {
        setVerificationState("error")
        setErrorMessage("Missing verification parameters")
        return
      }

      try {
        if (type === "signup") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          })

          if (error) {
            throw error
          }

          setVerificationState("success")

          // Start countdown for auto-redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                router.push("/auth/login?confirmed=true")
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return () => clearInterval(timer)
        } else {
          setVerificationState("error")
          setErrorMessage("Invalid verification type")
        }
      } catch (error: any) {
        console.error("Verification error:", error)
        setVerificationState("error")
        setErrorMessage(error.message || "Failed to verify email")
      }
    }

    verifyToken()
  }, [token, type, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-black/50 p-8 shadow-lg backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <div className="relative h-20 w-20">
            <Image src="/images/limitless-x-logo.png" alt="Limitless X" fill className="object-contain" priority />
          </div>
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-luxury-white">Email Verification</h1>

        <div className="flex flex-col items-center justify-center space-y-6">
          {verificationState === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-violet-500" />
              <p className="text-center text-lg text-luxury-white">Verifying your email address...</p>
            </>
          )}

          {verificationState === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium text-luxury-white">Email verified successfully!</p>
                <p className="text-gray-400">Redirecting to login in {countdown} seconds...</p>
              </div>
              <Link href="/auth/login?confirmed=true">
                <Button className="bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700">
                  Continue to Login
                </Button>
              </Link>
            </>
          )}

          {verificationState === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium text-luxury-white">Verification Failed</p>
                <p className="text-red-400">{errorMessage || "There was a problem verifying your email"}</p>
                <p className="text-gray-400">
                  The link may have expired or is invalid. Please try again or contact support.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700">
                    Return to Login
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black bg-transparent"
                  >
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
