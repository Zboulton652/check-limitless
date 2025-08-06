"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, DollarSign, Gift, Star, Zap, Crown, Sparkles } from "lucide-react"
import ScrollReveal from "@/components/scroll-reveal"
import FloatingElements from "@/components/floating-elements"
import FeaturedCompetition from "@/components/featured-competition"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    setIsSubmitted(true)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-luxury-black overflow-hidden">
      <FloatingElements />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-black via-luxury-grey/30 to-luxury-black" />

        {/* Subtle animated background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #8b5cf6 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #ffd700 0%, transparent 50%)`,
            transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.02}px)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Logo Animation */}
          <ScrollReveal delay={200}>
            <div className="mb-8 flex justify-center">
              <div className="relative w-40 h-40 animate-pulse">
                <Image
                  src="/images/limitless-x-logo.png"
                  alt="Limitless X"
                  fill
                  className="object-contain filter drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Main Headline */}
          <ScrollReveal delay={400}>
            <div className="mb-8">
              <h1 className="text-4xl md:text-7xl font-bold text-luxury-white font-luxury leading-tight">
                <span className="block mb-2">Limitless X is set to</span>
                <span className="block bg-gradient-to-r from-violet-400 via-yellow-400 to-violet-600 bg-clip-text text-transparent mb-2">
                  disrupt and redefine
                </span>
                <span className="block mb-4">the competition industry</span>
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent text-5xl md:text-8xl font-black block">
                  forever.
                </span>
              </h1>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <p className="text-xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join the most generous, community-powered prize platform in the UK.
              <span className="block mt-2 bg-gradient-to-r from-violet-400 to-yellow-400 bg-clip-text text-transparent font-semibold">
                Where winners are made, not born.
              </span>
            </p>
          </ScrollReveal>

          {/* Email Capture */}
          <ScrollReveal delay={800}>
            <div className="max-w-lg mx-auto mb-12">
              {!isSubmitted ? (
                <form onSubmit={handleEmailSubmit} className="relative">
                  <div className="flex gap-3 p-2 bg-luxury-grey/50 backdrop-blur-xl rounded-2xl border border-yellow-400/20 shadow-2xl">
                    <Input
                      type="email"
                      placeholder="Enter your email for early access"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none text-luxury-white placeholder-gray-400 text-lg focus:ring-0"
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-luxury-black font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Join Elite List
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 backdrop-blur-xl p-6 rounded-2xl border border-yellow-400/30 shadow-2xl">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-8 h-8 text-yellow-400 mr-3" />
                    <p className="text-yellow-400 font-bold text-xl">Welcome to the Elite!</p>
                  </div>
                  <p className="text-gray-300">You're now on the exclusive early access list.</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={1000}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/register" onClick={scrollToTop}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-luxury-white font-bold px-12 py-4 text-xl rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/25 hover:scale-105 group"
                >
                  <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                  Start Winning Now
                </Button>
              </Link>
              <Link href="/competitions" onClick={scrollToTop}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-luxury-black font-bold px-12 py-4 text-xl rounded-xl bg-transparent backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/25 hover:scale-105"
                >
                  View Competitions
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Competition Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-grey/10 to-luxury-black" />
        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-luxury-white mb-6">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Featured
                </span>{" "}
                <span className="text-luxury-white">Competition</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Don't miss out on our hottest competition. Enter now for your chance to win big!
              </p>
            </div>
          </ScrollReveal>

          <FeaturedCompetition />
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-grey/20 to-luxury-black/30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Revolutionary
                </span>{" "}
                <span className="text-luxury-white">by Design</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                We're not just another competition platform. We're rewriting the rules of how prize platforms should
                work.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                title: "Luxury Prizes",
                description: "Curated premium items worth thousands",
                color: "from-yellow-400 to-yellow-500",
                delay: 200,
              },
              {
                icon: DollarSign,
                title: "50% Profit Share",
                description: "Unprecedented community profit distribution",
                color: "from-green-400 to-green-600",
                delay: 400,
              },
              {
                icon: Users,
                title: "Referral Empire",
                description: "Build your network, multiply your earnings",
                color: "from-violet-400 to-violet-600",
                delay: 600,
              },
              {
                icon: Gift,
                title: "Provably Fair",
                description: "Transparent, auditable, unbreakable trust",
                color: "from-purple-400 to-purple-600",
                delay: 800,
              },
            ].map((feature, index) => (
              <ScrollReveal key={index} delay={feature.delay}>
                <Card className="bg-luxury-grey/30 backdrop-blur-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10 group">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-luxury-white mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-luxury-black via-luxury-grey/20 to-luxury-black">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-luxury-white mb-6">The Numbers Don't Lie</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Our track record speaks for itself. Join thousands of winners who've already benefited.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { number: "£2.5M+", label: "Prizes Distributed", icon: Trophy, color: "from-yellow-400 to-yellow-500" },
              { number: "50,000+", label: "Happy Winners", icon: Users, color: "from-violet-500 to-violet-600" },
              {
                number: "£500K+",
                label: "Community Dividends",
                icon: DollarSign,
                color: "from-green-500 to-green-600",
              },
            ].map((stat, index) => (
              <ScrollReveal key={index} delay={index * 200}>
                <div className="text-center group">
                  <div
                    className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-500/25`}
                  >
                    <stat.icon className="h-12 w-12 text-luxury-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xl text-gray-300">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-luxury-black to-violet-900/10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="mb-8">
              <Star className="w-16 h-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-bold text-luxury-white mb-6">
                Ready to{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  Redefine
                </span>{" "}
                Your Future?
              </h2>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                Join the revolution. Win luxury prizes. Earn dividends. Build your empire.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/register" onClick={scrollToTop}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-luxury-black font-bold px-16 py-6 text-2xl rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 group"
                >
                  <Crown className="w-8 h-8 mr-4 group-hover:animate-pulse" />
                  Claim Your Throne
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
