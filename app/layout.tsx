import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Chatbot from "@/components/chatbot"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Limitless X Competitions - Premium Prize Platform",
  description:
    "Join the most generous, community-powered prize platform in the UK. Win luxury prizes and earn dividends.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-luxury-black text-luxury-white min-h-screen antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Chatbot />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#ffffff",
              border: "1px solid #374151",
            },
          }}
        />

        {/* Footer */}
        <footer className="bg-luxury-dark-grey border-t border-luxury-grey py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-luxury-white mb-2">
                Contact us:{" "}
                <a href="mailto:supportlimxcomps@outlook.com" className="text-gold-500 hover:text-gold-400">
                  supportlimxcomps@outlook.com
                </a>
              </p>
              <p className="text-gray-400 text-sm">© 2024 Limitless X Competitions. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
