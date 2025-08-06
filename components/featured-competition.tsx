"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, PoundSterlingIcon as Pound, Trophy, Sparkles } from "lucide-react"
import ScrollReveal from "@/components/scroll-reveal"
import type { Database } from "@/lib/supabase/types"

type Competition = Database["public"]["Tables"]["competitions"]["Row"]

export default function FeaturedCompetition() {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    fetchFeaturedCompetition()
  }, [])

  const fetchFeaturedCompetition = async () => {
    try {
      // First try to get a manually featured competition
      let { data: featured } = await supabase
        .from("competitions")
        .select("*")
        .eq("is_featured", true)
        .eq("status", "active")
        .single()

      // If no manually featured competition, get the newest active one
      if (!featured) {
        const { data: newest } = await supabase
          .from("competitions")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        featured = newest
      }

      setCompetition(featured)
    } catch (error) {
      console.error("Error fetching featured competition:", error)
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
      <div className="animate-pulse">
        <div className="h-96 bg-luxury-grey/30 rounded-2xl"></div>
      </div>
    )
  }

  if (!competition) {
    return null
  }

  return (
    <ScrollReveal>
      <Card className="bg-gradient-to-br from-luxury-grey/40 to-luxury-black/60 backdrop-blur-xl border border-violet-400/30 hover:border-violet-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20 group overflow-hidden">
        {/* Featured Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-violet-500 to-violet-600 text-white border-none px-3 py-1 text-sm font-bold">
            <Sparkles className="w-4 h-4 mr-1" />
            FEATURED
          </Badge>
        </div>

        <CardHeader className="relative p-0">
          {competition.prize_image_url && (
            <div className="aspect-video overflow-hidden rounded-t-2xl relative">
              <img
                src={competition.prize_image_url || "/placeholder.svg"}
                alt={competition.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent" />
            </div>
          )}
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-luxury-white mb-3 group-hover:text-violet-400 transition-colors duration-300">
              {competition.title}
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed line-clamp-3">{competition.description}</p>
          </div>

          {/* Competition Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-luxury-black/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center text-violet-400 mb-2">
                <Pound className="h-6 w-6 mr-1" />
                <span className="text-2xl font-bold">£{competition.entry_price}</span>
              </div>
              <p className="text-sm text-gray-400">Entry Price</p>
            </div>

            <div className="text-center p-4 bg-luxury-black/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center text-violet-400 mb-2">
                <Users className="h-6 w-6 mr-1" />
                <span className="text-2xl font-bold">{competition.current_entries}</span>
              </div>
              <p className="text-sm text-gray-400">Entries</p>
            </div>

            <div className="text-center p-4 bg-luxury-black/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center text-violet-400 mb-2">
                <Clock className="h-6 w-6 mr-1" />
                <span className="text-lg font-bold">{formatTimeLeft(competition.end_date)}</span>
              </div>
              <p className="text-sm text-gray-400">Time Left</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/competitions/${competition.id}`} className="flex-1" onClick={scrollToTop}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105 group"
              >
                <Trophy className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                Enter Competition
              </Button>
            </Link>
            <Link href="/competitions" onClick={scrollToTop}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black font-bold px-8 py-4 text-lg rounded-xl bg-transparent backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-violet-400/25"
              >
                View All
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}
