"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, PoundSterlingIcon as Pound } from "lucide-react"
import GlassButton from "@/components/glass-button"
import FloatingElements from "@/components/floating-elements"
import type { Database } from "@/lib/supabase/types"

type Competition = Database["public"]["Tables"]["competitions"]["Row"]

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCompetitions(data || [])
    } catch (error) {
      console.error("Error fetching competitions:", error)
    } finally {
      setIsLoading(false)
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
        <FloatingElements />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-luxury-white">Loading competitions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-black relative overflow-hidden">
      <FloatingElements />

      {/* Enhanced background with more consistent coverage */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-black via-luxury-grey/30 to-luxury-black" />

      {/* Additional background elements for better glass effect visibility */}
      <div className="absolute inset-0 opacity-15">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 25%, rgba(255, 215, 0, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 25% 75%, rgba(255, 215, 0, 0.3) 0%, transparent 35%),
              radial-gradient(circle at 75% 85%, rgba(139, 92, 246, 0.3) 0%, transparent 35%),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 25%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-luxury-white mb-4">Active Competitions</h1>
            <p className="text-xl text-gray-300">Enter now for your chance to win luxury prizes</p>
          </div>

          {competitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400 mb-4">No active competitions at the moment</p>
              <p className="text-gray-500">Check back soon for new competitions!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {competitions.map((competition, index) => (
                <div key={competition.id} className="relative">
                  {/* Individual card background enhancement */}
                  <div
                    className="absolute inset-0 opacity-20 rounded-2xl"
                    style={{
                      background:
                        index % 3 === 0
                          ? "radial-gradient(circle at 30% 70%, rgba(255, 215, 0, 0.3) 0%, transparent 60%)"
                          : index % 3 === 1
                            ? "radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 60%)"
                            : "radial-gradient(circle at 50% 80%, rgba(255, 215, 0, 0.25) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 70%)",
                    }}
                  />

                  <Card className="relative bg-luxury-grey/30 backdrop-blur-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10 group">
                    <CardHeader>
                      {competition.prize_image_url && (
                        <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                          <img
                            src={competition.prize_image_url || "/placeholder.svg"}
                            alt={competition.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <CardTitle className="text-luxury-white group-hover:text-yellow-400 transition-colors duration-300">
                        {competition.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm line-clamp-3">{competition.description}</p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gold-500">
                          <Pound className="h-4 w-4 mr-1" />
                          <span>£{competition.entry_price}</span>
                        </div>

                        <div className="flex items-center text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{competition.current_entries} entries</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTimeLeft(competition.end_date)}</span>
                      </div>

                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-violet-500/20 to-violet-600/20 text-violet-300 border border-violet-400/30 backdrop-blur-xl shadow-lg shadow-violet-500/10"
                      >
                        {competition.status}
                      </Badge>
                    </CardContent>

                    <CardFooter className="pt-4">
                      <Link href={`/competitions/${competition.id}`} className="w-full block" onClick={scrollToTop}>
                        <GlassButton className="w-full" size="md">
                          Enter Now
                        </GlassButton>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
