"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Users, PoundSterlingIcon as Pound, Trophy } from "lucide-react"
import GlassButton from "@/components/glass-button"
import type { Database } from "@/lib/supabase/types"

type Competition = Database["public"]["Tables"]["competitions"]["Row"]

export default function CompetitionDetailPage() {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEntering, setIsEntering] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCompetition()
    checkUser()
  }, [params.id])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchCompetition = async () => {
    try {
      const { data, error } = await supabase.from("competitions").select("*").eq("id", params.id).single()

      if (error) throw error
      setCompetition(data)
    } catch (error) {
      console.error("Error fetching competition:", error)
      setError("Competition not found")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterCompetition = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!competition) return

    setIsEntering(true)
    setError("")

    try {
      // Temporary: Create entry without payment (for testing)
      // TODO: Replace with Stripe integration once account is set up
      const { error } = await supabase.from("entries").insert({
        user_id: user.id,
        competition_id: competition.id,
        amount_paid: competition.entry_price,
        stripe_payment_intent_id: null, // Will be null until Stripe is integrated
      })

      if (error) throw error

      setError("")
      alert("Entry successful! (Note: This is a demo entry - no payment processed)")

      // Refresh the competition data to show updated entry count
      fetchCompetition()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsEntering(false)
    }
  }

  const formatTimeLeft = (endDate: string | null) => {
    if (!endDate) return "No end date"

    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-luxury-white">Loading competition...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-luxury-white mb-4">Competition Not Found</h1>
          <p className="text-gray-400 mb-8">The competition you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push("/competitions")}
            className="bg-gold-500 hover:bg-gold-600 text-luxury-black"
          >
            Back to Competitions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-black relative overflow-hidden">
      {/* Subtle background pattern to showcase glass effect */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 30%)
          `,
          }}
        />
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Competition Image */}
            <div className="space-y-6">
              {competition.prize_image_url && (
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={competition.prize_image_url || "/placeholder.svg"}
                    alt={competition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Competition Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-luxury-white mb-4">{competition.title}</h1>

                <div className="flex items-center space-x-4 mb-6">
                  <Badge
                    variant="secondary"
                    className="glass-badge bg-gradient-to-r from-violet-500/20 to-violet-600/20 text-violet-300 border border-violet-400/30 backdrop-blur-xl shadow-lg shadow-violet-500/10"
                  >
                    {competition.status}
                  </Badge>

                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTimeLeft(competition.end_date)}</span>
                  </div>
                </div>
              </div>

              {/* Entry Stats */}
              <Card className="bg-luxury-grey border-luxury-grey">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-gold-500 mb-2">
                        <Pound className="h-5 w-5 mr-1" />
                        <span className="text-2xl font-bold">£{competition.entry_price}</span>
                      </div>
                      <p className="text-sm text-gray-400">Entry Price</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center text-gold-500 mb-2">
                        <Users className="h-5 w-5 mr-1" />
                        <span className="text-2xl font-bold">{competition.current_entries}</span>
                      </div>
                      <p className="text-sm text-gray-400">Total Entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="bg-luxury-grey border-luxury-grey">
                <CardHeader>
                  <CardTitle className="text-luxury-white flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-gold-500" />
                    Prize Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{competition.description}</p>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              {competition.terms_and_conditions && (
                <Card className="bg-luxury-grey border-luxury-grey">
                  <CardHeader>
                    <CardTitle className="text-luxury-white">Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{competition.terms_and_conditions}</p>
                  </CardContent>
                </Card>
              )}

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {/* Enter Button */}
              <GlassButton
                onClick={handleEnterCompetition}
                disabled={isEntering || competition.status !== "active"}
                className="w-full"
                size="lg"
              >
                {isEntering ? "Processing..." : `Demo Entry - £${competition.entry_price} (No Payment)`}
              </GlassButton>

              {!user && (
                <p className="text-center text-sm text-gray-400">
                  <span>Need an account? </span>
                  <Button
                    variant="link"
                    className="text-gold-500 hover:text-gold-400 p-0 h-auto"
                    onClick={() => router.push("/auth/register")}
                  >
                    Sign up here
                  </Button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
