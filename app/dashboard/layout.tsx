import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Limitless X Competitions",
  description: "Manage your competitions, entries, and dividends",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/dashboard")
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      <div className="pt-20">{children}</div>
    </div>
  )
}
