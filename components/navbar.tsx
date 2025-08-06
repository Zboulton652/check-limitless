"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { Menu, X, LogOut } from "lucide-react"
import Image from "next/image"

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-luxury-black/95 bg-gradient-to-r from-luxury-black to-luxury-black/90 border-b border-violet-400/20 shadow-2xl shadow-violet-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Only shows when scrolled */}
          <div
            className={`transition-all duration-700 ${scrolled ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}`}
          >
            <Link href="/" className="flex items-center group">
              <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/limitless-x-logo.png"
                  alt="Limitless X"
                  fill
                  className="object-contain filter drop-shadow-lg"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/competitions"
              className="text-luxury-white hover:text-violet-400 transition-all duration-300 relative group"
              onClick={scrollToTop}
            >
              Competitions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/dividends"
              className="text-luxury-white hover:text-violet-400 transition-all duration-300 relative group"
              onClick={scrollToTop}
            >
              Dividends
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/help"
              className="text-luxury-white hover:text-violet-400 transition-all duration-300 relative group"
              onClick={scrollToTop}
            >
              Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {isLoading ? (
              <div className="h-9 w-20 bg-luxury-grey/50 animate-pulse rounded-md"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-luxury-white hover:text-violet-400 transition-all duration-300 relative group"
                  onClick={scrollToTop}
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black bg-transparent transition-all duration-300 hover:shadow-lg hover:shadow-violet-400/25"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" onClick={scrollToTop}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black bg-transparent transition-all duration-300 hover:shadow-lg hover:shadow-violet-400/25"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={scrollToTop}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105"
                  >
                    Register Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-luxury-white hover:text-violet-400 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-luxury-grey/20 bg-luxury-black/95 bg-gradient-to-r from-luxury-black to-luxury-black/90">
            <div className="flex flex-col space-y-4">
              <Link
                href="/competitions"
                className="text-luxury-white hover:text-violet-400 transition-colors duration-300"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToTop()
                }}
              >
                Competitions
              </Link>
              <Link
                href="/dividends"
                className="text-luxury-white hover:text-violet-400 transition-colors duration-300"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToTop()
                }}
              >
                Dividends
              </Link>
              <Link
                href="/help"
                className="text-luxury-white hover:text-violet-400 transition-colors duration-300"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToTop()
                }}
              >
                Help
              </Link>

              {isLoading ? (
                <div className="h-9 w-20 bg-luxury-grey/50 animate-pulse rounded-md"></div>
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-luxury-white hover:text-violet-400 transition-colors duration-300"
                    onClick={() => {
                      setIsMenuOpen(false)
                      scrollToTop()
                    }}
                  >
                    Dashboard
                  </Link>
                  <Button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    variant="outline"
                    size="sm"
                    className="border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black w-fit bg-transparent"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => {
                      setIsMenuOpen(false)
                      scrollToTop()
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black w-full bg-transparent"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => {
                      setIsMenuOpen(false)
                      scrollToTop()
                    }}
                  >
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-violet-600 text-luxury-white hover:from-violet-600 hover:to-violet-700 w-full"
                    >
                      Register Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
