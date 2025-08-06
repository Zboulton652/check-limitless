"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardClient from "./DashboardClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, DollarSign, Users, Trophy, Settings, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import type { Database } from "@/lib/supabase/types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Entry = Database["public"]["Tables"]["competition_entries"]["Row"] & {
  competitions: { title: string; prize_value: number; end_date: string; status: string }
}
type Dividend = {
  id: string
  amount: number
  period: string
  paid_at: string
  status: "pending" | "paid"
}
type Referral = {
  id: string
  email: string
  created_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    window.location.href = '/auth/login'
    return null
  }

  // Get user data from the users table
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userDataError) {
    console.error('Error fetching user data:', userDataError)
    // If user doesn't exist in users table, redirect to complete registration
    window.location.href = '/auth/register'
    return null
  }

  // Get user's competition entries
  const { data: entries, error: entriesError } = await supabase
    .from('competition_entries')
    .select(`
      *,
      competitions (
        title,
        prize_value,
        end_date,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (entriesError) {
    console.error('Error fetching entries:', entriesError)
  }

  // Get referral data
  const { data: referrals, error: referralsError } = await supabase
    .from('users')
    .select('id, email, created_at')
    .eq('referred_by', user.id)

  if (referralsError) {
    console.error('Error fetching referrals:', referralsError)
  }

  // Calculate total referral earnings (10% of each referral's entries)
  let totalEarnings = 0
  if (referrals && referrals.length > 0) {
    const referralIds = referrals.map(r => r.id)
    const { data: referralEntries } = await supabase
      .from('competition_entries')
      .select('entry_cost')
      .in('user_id', referralIds)

    if (referralEntries) {
      totalEarnings = referralEntries.reduce((sum, entry) => sum + (entry.entry_cost * 0.1), 0)
    }
  }

  return (
    <DashboardClient 
      user={user}
      userData={userData}
      entries={entries || []}
      referrals={referrals || []}
      totalEarnings={totalEarnings}
    />
  )
}
