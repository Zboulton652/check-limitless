"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
type Entry = Database["public"]["Tables"]["entries"]["Row"] & {
  competitions: { title: string; status: string; end_date: string } | null
}
type Dividend = Database["public"]["Tables"]["dividends"]["Row"]
type Referral = Database["public"]["Tables"]["referrals"]["Row"] & {
  referee: { email: string } | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [payoutMethod, setPayoutMethod] = useState<"bank_transfer" | "site_credit">("site_credit")
  const [sortCode, setSortCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Fetch user profile
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
        setPayoutMethod(profile.payout_method || "site_credit")
        setSortCode(profile.bank_sort_code || "")
        setAccountNumber(profile.bank_account_number || "")
        setAccountName(profile.bank_account_name || "")
      }

      // Fetch user entries with competition details - using correct table name "entries"
      const { data: userEntries, error: entriesError } = await supabase
        .from("entries")
        .select(`
          *,
          competitions (
            title,
            status,
            end_date
          )
        `)
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (entriesError) {
        console.error("Error fetching entries:", entriesError)
      } else {
        setEntries(userEntries || [])
      }

      // Fetch dividends
      const { data: userDividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (dividendsError) {
        console.error("Error fetching dividends:", dividendsError)
      } else {
        setDividends(userDividends || [])
      }

      // Fetch referrals with referee details
      const { data: userReferrals, error: referralsError } = await supabase
        .from("referrals")
        .select(`
          *,
          referee:referee_id (
            email
          )
        `)
        .eq("referrer_id", authUser.id)
        .order("created_at", { ascending: false })

      if (referralsError) {
        console.error("Error fetching referrals:", referralsError)
      } else {
        setReferrals(userReferrals || [])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (!user) return

    const referralLink = `${window.location.origin}/auth/register?ref=${user.referral_code}`
    navigator.clipboard.writeText(referralLink)
    setMessage("Referral link copied to clipboard!")
    setTimeout(() => setMessage(""), 3000)
  }

  const savePayoutPreferences = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage("")

    try {
      const { error } = await supabase
        .from("users")
        .update({
          payout_method: payoutMethod,
          bank_sort_code: payoutMethod === "bank_transfer" ? sortCode : null,
          bank_account_number: payoutMethod === "bank_transfer" ? accountNumber : null,
          bank_account_name: payoutMethod === "bank_transfer" ? accountName : null,
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage("Payout preferences saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error saving preferences:", error)
      setMessage("Error saving preferences. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-luxury-white">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalReferralEarnings = referrals.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0)
  const activeReferrals = referrals.filter((ref) => ref.status === "active").length
  const pendingDividends = dividends.filter((div) => div.status === "pending").reduce((sum, div) => sum + div.amount, 0)

  return (
    <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury-white mb-2">Welcome back!</h1>
          <p className="text-gray-400">Manage your competitions, earnings, and referrals</p>
        </div>

        {message && (
          <Alert className="mb-6 border-gold-500 bg-gold-500/10">
            <AlertDescription className="text-gold-400">{message}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-luxury-white">£{user.total_spent?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-gray-500">{entries.length} entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Dividends</p>
                  <p className="text-2xl font-bold text-luxury-white">£{user.total_dividends?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-green-400">+£{pendingDividends.toFixed(2)} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Referral Earnings</p>
                  <p className="text-2xl font-bold text-luxury-white">£{totalReferralEarnings.toFixed(2)}</p>
                  <p className="text-xs text-blue-400">{activeReferrals} active referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Site Credit</p>
                  <p className="text-2xl font-bold text-luxury-white">£{user.site_credit?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-gray-500">Available balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="entries" className="space-y-6">
          <TabsList className="bg-luxury-grey border-luxury-grey">
            <TabsTrigger
              value="entries"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              My Entries
            </TabsTrigger>
            <TabsTrigger
              value="dividends"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              Dividends
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              Referrals
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              Payout Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Competition Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No entries yet</p>
                    <p className="text-gray-500 mb-6">Start participating in competitions to see your entries here</p>
                    <Button asChild className="bg-gold-500 hover:bg-gold-600 text-luxury-black">
                      <a href="/competitions">Browse Competitions</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-luxury-white">{entry.competitions?.title || "Competition"}</h3>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500">
                              {entry.competitions?.status || "Active"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Entered {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                            {entry.competitions?.end_date && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Ends {new Date(entry.competitions.end_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gold-500 text-lg">
                            £{entry.amount_paid?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-xs text-gray-400">Entry fee</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dividends">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Dividend History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dividends.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No dividends yet</p>
                    <p className="text-gray-500">Dividends will appear here once competitions are completed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dividends.map((dividend) => (
                      <div
                        key={dividend.id}
                        className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-gold-500" />
                          </div>
                          <div>
                            <p className="font-medium text-luxury-white">{dividend.period || "Dividend Payment"}</p>
                            <p className="text-sm text-gray-400">
                              {dividend.status === "paid"
                                ? `Paid on ${new Date(dividend.created_at).toLocaleDateString()}`
                                : "Payment pending"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-gold-500">£{dividend.amount.toFixed(2)}</p>
                          </div>
                          <Badge
                            className={
                              dividend.status === "paid"
                                ? "bg-green-500/20 text-green-400 border-green-500"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500"
                            }
                          >
                            {dividend.status === "paid" ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-luxury-black rounded-lg">
                  <h3 className="font-semibold text-luxury-white mb-2">Your Referral Link</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?ref=${user.referral_code || ""}`}
                      readOnly
                      className="bg-luxury-grey border-luxury-grey text-luxury-white"
                    />
                    <Button
                      onClick={copyReferralLink}
                      size="sm"
                      className="bg-gold-500 hover:bg-gold-600 text-luxury-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Share this link to earn 10% of your referees' spending</p>
                </div>

                {referrals.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-luxury-white mb-4">Your Referrals</h4>
                    <div className="space-y-3">
                      {referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-luxury-white">{referral.referee?.email || "User"}</p>
                              <p className="text-sm text-gray-400">
                                Joined {new Date(referral.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-gold-500">£{(referral.commission_earned || 0).toFixed(2)}</p>
                              <p className="text-xs text-gray-400">Your earnings</p>
                            </div>
                            <Badge
                              className={
                                referral.status === "active"
                                  ? "bg-green-500/20 text-green-400 border-green-500"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500"
                              }
                            >
                              {referral.status || "active"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No referrals yet</p>
                    <p className="text-gray-500">Share your referral link to start earning commissions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Payout Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="payout-method" className="text-luxury-white">
                    Payout Method
                  </Label>
                  <Select
                    value={payoutMethod}
                    onValueChange={(value: "bank_transfer" | "site_credit") => setPayoutMethod(value)}
                  >
                    <SelectTrigger className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-luxury-black border-luxury-grey">
                      <SelectItem value="site_credit" className="text-luxury-white">
                        Site Credit (Instant)
                      </SelectItem>
                      <SelectItem value="bank_transfer" className="text-luxury-white">
                        Bank Transfer (1-3 business days)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payoutMethod === "bank_transfer" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="account-name" className="text-luxury-white">
                        Account Holder Name
                      </Label>
                      <Input
                        id="account-name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="John Smith"
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sort-code" className="text-luxury-white">
                        Sort Code
                      </Label>
                      <Input
                        id="sort-code"
                        value={sortCode}
                        onChange={(e) => setSortCode(e.target.value)}
                        placeholder="12-34-56"
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number" className="text-luxury-white">
                        Account Number
                      </Label>
                      <Input
                        id="account-number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="12345678"
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={savePayoutPreferences}
                  disabled={isSaving}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
