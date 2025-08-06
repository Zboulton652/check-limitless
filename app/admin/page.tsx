"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, Users, Trophy, CreditCard, TrendingUp, Search, Filter, RefreshCw, UserPlus, Plus, Edit, Trash2, CheckCircle, AlertTriangle, BarChart3, Calendar, Upload, X } from 'lucide-react'
import type { Database } from "@/lib/supabase/types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Competition = Database["public"]["Tables"]["competitions"]["Row"]
type Dividend = Database["public"]["Tables"]["dividends"]["Row"] & {
  user_email: string
}

interface PlatformMetrics {
  totalUsers: number
  totalSiteCredit: number
  totalEntries: number
  totalBankPayouts: number
  totalPaidDividends: number
  totalPendingDividends: number
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Generate Dividends State
  const [profitPool, setProfitPool] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Dividends Table State
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [dividendsLoading, setDividendsLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [emailSearch, setEmailSearch] = useState("")

  // Promote User State
  const [promoteEmail, setPromoteEmail] = useState("")
  const [isPromoting, setIsPromoting] = useState(false)

  // Competitions State
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionsLoading, setCompetitionsLoading] = useState(false)

  // Edit Competition State
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    prize_image_url: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdatingCompetition, setIsUpdatingCompetition] = useState(false)

  // New Competition State
  const [newCompetition, setNewCompetition] = useState({
    title: "",
    description: "",
    entry_price: "",
    end_date: "",
    status: "draft" as "active" | "ended" | "draft",
  })
  const [isCreatingCompetition, setIsCreatingCompetition] = useState(false)

  // Platform Metrics State
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    totalSiteCredit: 0,
    totalEntries: 0,
    totalBankPayouts: 0,
    totalPaidDividends: 0,
    totalPendingDividends: 0,
  })
  const [metricsLoading, setMetricsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (!profile || profile.role !== "admin") {
        setError("You do not have access to this page")
        setIsLoading(false)
        return
      }

      setUser(profile)
      await Promise.all([fetchDividends(), fetchCompetitions(), fetchMetrics()])
    } catch (error) {
      console.error("Error checking admin access:", error)
      setError("You do not have access to this page")
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg)
      setMessage("")
    } else {
      setMessage(msg)
      setError("")
    }
    setTimeout(() => {
      setMessage("")
      setError("")
    }, 5000)
  }

  // Generate Dividends
  const handleGenerateDividends = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profitPool || Number.parseFloat(profitPool) <= 0) {
      showMessage("Please enter a valid profit pool amount", true)
      return
    }

    setIsGenerating(true)
    try {
      // Since RPC doesn't exist yet, show a placeholder message
      showMessage("Dividend generation RPC function needs to be implemented", true)
      setProfitPool("")
    } catch (error: any) {
      showMessage(error.message || "Failed to generate dividends", true)
    } finally {
      setIsGenerating(false)
    }
  }

  // Fetch Dividends
  const fetchDividends = async () => {
    setDividendsLoading(true)
    try {
      const { data, error } = await supabase
        .from("dividends")
        .select(
          `
          *,
          users!inner(email)
        `
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedDividends = data.map((dividend: any) => ({
        ...dividend,
        user_email: dividend.users.email,
      }))

      setDividends(formattedDividends)
    } catch (error) {
      console.error("Error fetching dividends:", error)
    } finally {
      setDividendsLoading(false)
    }
  }

  // Mark Dividend as Paid
  const markDividendAsPaid = async (dividendId: string) => {
    try {
      const { error } = await supabase
        .from("dividends")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", dividendId)

      if (error) throw error

      showMessage("Dividend marked as paid!")
      fetchDividends()
      fetchMetrics()
    } catch (error: any) {
      showMessage(error.message || "Failed to mark dividend as paid", true)
    }
  }

  // Promote User to Admin
  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoteEmail.trim()) {
      showMessage("Please enter a user email", true)
      return
    }

    setIsPromoting(true)
    try {
      const { error } = await supabase.from("users").update({ role: "admin" }).eq("email", promoteEmail.trim())

      if (error) throw error

      showMessage(`User ${promoteEmail} promoted to admin successfully!`)
      setPromoteEmail("")
    } catch (error: any) {
      showMessage(error.message || "Failed to promote user", true)
    } finally {
      setIsPromoting(false)
    }
  }

  // Fetch Competitions
  const fetchCompetitions = async () => {
    setCompetitionsLoading(true)
    try {
      const { data, error } = await supabase.from("competitions").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCompetitions(data || [])
    } catch (error) {
      console.error("Error fetching competitions:", error)
    } finally {
      setCompetitionsLoading(false)
    }
  }

  // Close Competition Draw
  const closeCompetitionDraw = async (competitionId: string) => {
    try {
      const { error } = await supabase.from("competitions").update({ status: "ended" }).eq("id", competitionId)

      if (error) throw error

      showMessage("Competition draw closed successfully!")
      fetchCompetitions()
    } catch (error: any) {
      showMessage(error.message || "Failed to close competition draw", true)
    }
  }

  // Delete Competition
  const deleteCompetition = async (competitionId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase.from("competitions").delete().eq("id", competitionId)

      if (error) throw error

      showMessage("Competition deleted successfully!")
      fetchCompetitions()
    } catch (error: any) {
      showMessage(error.message || "Failed to delete competition", true)
    }
  }

  // Open Edit Dialog
  const openEditDialog = (competition: Competition) => {
    setEditingCompetition(competition)
    setEditForm({
      title: competition.title,
      description: competition.description,
      prize_image_url: competition.prize_image_url || "",
    })
    setIsEditDialogOpen(true)
  }

  // Close Edit Dialog
  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingCompetition(null)
    setEditForm({
      title: "",
      description: "",
      prize_image_url: "",
    })
  }

  // Update Competition
  const handleUpdateCompetition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompetition) return

    if (!editForm.title.trim() || !editForm.description.trim()) {
      showMessage("Please fill in all required fields", true)
      return
    }

    setIsUpdatingCompetition(true)
    try {
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        prize_image_url: editForm.prize_image_url.trim() || 
          "/placeholder.svg?height=400&width=600&text=" + encodeURIComponent(editForm.title.trim()),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("competitions")
        .update(updateData)
        .eq("id", editingCompetition.id)

      if (error) throw error

      showMessage("Competition updated successfully!")
      closeEditDialog()
      fetchCompetitions()
    } catch (error: any) {
      showMessage(error.message || "Failed to update competition", true)
    } finally {
      setIsUpdatingCompetition(false)
    }
  }

  // Create New Competition
  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompetition.title || !newCompetition.description || !newCompetition.entry_price) {
      showMessage("Please fill in all required fields", true)
      return
    }

    setIsCreatingCompetition(true)
    try {
      const competitionData = {
        title: newCompetition.title,
        description: newCompetition.description,
        entry_price: Number.parseFloat(newCompetition.entry_price),
        end_date: newCompetition.end_date ? new Date(newCompetition.end_date).toISOString() : null,
        status: newCompetition.status,
        prize_image_url: "/placeholder.svg?height=400&width=600&text=" + encodeURIComponent(newCompetition.title),
      }

      const { error } = await supabase.from("competitions").insert(competitionData)

      if (error) throw error

      showMessage("Competition created successfully!")
      setNewCompetition({
        title: "",
        description: "",
        entry_price: "",
        end_date: "",
        status: "draft",
      })
      fetchCompetitions()
    } catch (error: any) {
      showMessage(error.message || "Failed to create competition", true)
    } finally {
      setIsCreatingCompetition(false)
    }
  }

  // Fetch Platform Metrics
  const fetchMetrics = async () => {
    setMetricsLoading(true)
    try {
      // Get total users
      const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Get total site credit
      const { data: siteCreditData } = await supabase.from("users").select("site_credit")
      const totalSiteCredit = siteCreditData?.reduce((sum, user) => sum + (user.site_credit || 0), 0) || 0

      // Get total entries
      const { count: totalEntries } = await supabase.from("entries").select("*", { count: "exact", head: true })

      // Get dividend metrics
      const { data: paidDividends } = await supabase
        .from("dividends")
        .select("amount")
        .eq("status", "paid")
        .eq("payout_method", "bank_transfer")

      const { data: allPaidDividends } = await supabase.from("dividends").select("amount").eq("status", "paid")

      const { data: pendingDividends } = await supabase.from("dividends").select("amount").eq("status", "pending")

      const totalBankPayouts = paidDividends?.reduce((sum, div) => sum + div.amount, 0) || 0
      const totalPaidDividends = allPaidDividends?.reduce((sum, div) => sum + div.amount, 0) || 0
      const totalPendingDividends = pendingDividends?.reduce((sum, div) => sum + div.amount, 0) || 0

      setMetrics({
        totalUsers: totalUsers || 0,
        totalSiteCredit,
        totalEntries: totalEntries || 0,
        totalBankPayouts,
        totalPaidDividends,
        totalPendingDividends,
      })
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setMetricsLoading(false)
    }
  }

  // Filter dividends
  const filteredDividends = dividends.filter((dividend) => {
    const matchesType = typeFilter === "all" || dividend.type === typeFilter
    const matchesStatus = statusFilter === "all" || dividend.status === statusFilter
    const matchesEmail = dividend.user_email.toLowerCase().includes(emailSearch.toLowerCase())
    return matchesType && matchesStatus && matchesEmail
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-luxury-white">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-luxury-white mb-2">Access Denied</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Comprehensive platform management dashboard</p>
        </div>

        {message && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-400">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="bg-luxury-grey border-luxury-grey">
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger
              value="dividends-generate"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Generate Dividends
            </TabsTrigger>
            <TabsTrigger
              value="dividends-view"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Dividends
            </TabsTrigger>
            <TabsTrigger
              value="promote-user"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Promote User
            </TabsTrigger>
            <TabsTrigger
              value="competitions"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Competitions
            </TabsTrigger>
            <TabsTrigger
              value="create-competition"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Competition
            </TabsTrigger>
          </TabsList>

          {/* Platform Metrics */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-luxury-grey border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {metricsLoading ? "..." : metrics.totalUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-luxury-grey border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Site Credit</p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {metricsLoading ? "..." : `£${metrics.totalSiteCredit.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-luxury-grey border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Entries</p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {metricsLoading ? "..." : metrics.totalEntries.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-luxury-grey border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Bank Payouts</p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {metricsLoading ? "..." : `£${metrics.totalBankPayouts.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-luxury-grey border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Paid Dividends</p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {metricsLoading ? "..." : `£${metrics.totalPaidDividends.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-luxury-grey border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Pending Dividends</p>
                      <p className="text-2xl font-bold text-luxury-white">
                        {metricsLoading ? "..." : `£${metrics.totalPendingDividends.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={fetchMetrics}
                disabled={metricsLoading}
                className="bg-gold-500 hover:bg-gold-600 text-luxury-black"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? "animate-spin" : ""}`} />
                Refresh Metrics
              </Button>
            </div>
          </TabsContent>

          {/* Generate Dividends */}
          <TabsContent value="dividends-generate">
            <Card className="bg-luxury-grey border-gray-700">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-gold-500" />
                  Generate Dividends
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Generate dividend payouts for all users based on their spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateDividends} className="space-y-4">
                  <div>
                    <Label htmlFor="profit-pool" className="text-luxury-white">
                      Total Profit Pool (£)
                    </Label>
                    <Input
                      id="profit-pool"
                      type="number"
                      step="0.01"
                      min="0"
                      value={profitPool}
                      onChange={(e) => setProfitPool(e.target.value)}
                      required
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="10000.00"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      This will be distributed among users based on their total spending
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                  >
                    {isGenerating ? "Generating..." : "Generate Dividends"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* View & Filter Dividends */}
          <TabsContent value="dividends-view">
            <Card className="bg-luxury-grey border-gray-700">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-gold-500" />
                  View & Filter Dividends
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage dividend payouts and mark them as paid
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by email..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="bg-luxury-black border-gray-600 text-luxury-white"
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-luxury-black border-gray-600 text-luxury-white">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-luxury-black border-gray-600">
                      <SelectItem value="all" className="text-luxury-white">
                        All Types
                      </SelectItem>
                      <SelectItem value="immediate" className="text-luxury-white">
                        Immediate
                      </SelectItem>
                      <SelectItem value="deferred" className="text-luxury-white">
                        Deferred
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-luxury-black border-gray-600 text-luxury-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-luxury-black border-gray-600">
                      <SelectItem value="all" className="text-luxury-white">
                        All Status
                      </SelectItem>
                      <SelectItem value="pending" className="text-luxury-white">
                        Pending
                      </SelectItem>
                      <SelectItem value="paid" className="text-luxury-white">
                        Paid
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={fetchDividends}
                    disabled={dividendsLoading}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-black"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${dividendsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                {/* Dividends Table */}
                {dividendsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading dividends...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">User Email</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Payout Method</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Created At</TableHead>
                        <TableHead className="text-gray-300">Paid At</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDividends.map((dividend) => (
                        <TableRow key={dividend.id}>
                          <TableCell className="text-luxury-white font-medium">{dividend.user_email}</TableCell>
                          <TableCell className="text-luxury-white">£{dividend.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                dividend.type === "immediate"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500"
                              }
                            >
                              {dividend.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-luxury-white">{dividend.payout_method}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                dividend.status === "paid"
                                  ? "bg-green-500/20 text-green-400 border-green-500"
                                  : "bg-orange-500/20 text-orange-400 border-orange-500"
                              }
                            >
                              {dividend.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(dividend.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {dividend.paid_at ? new Date(dividend.paid_at).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            {dividend.status === "pending" && (
                              <Button
                                onClick={() => markDividendAsPaid(dividend.id)}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark as Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {filteredDividends.length === 0 && !dividendsLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No dividends found matching your filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promote User to Admin */}
          <TabsContent value="promote-user">
            <Card className="bg-luxury-grey border-gray-700">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-gold-500" />
                  Promote User to Admin
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Grant admin privileges to existing users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePromoteUser} className="space-y-4">
                  <div>
                    <Label htmlFor="promote-email" className="text-luxury-white">
                      User Email
                    </Label>
                    <Input
                      id="promote-email"
                      type="email"
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      required
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="user@example.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPromoting}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                  >
                    {isPromoting ? "Promoting..." : "Make Admin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Competitions */}
          <TabsContent value="competitions">
            <Card className="bg-luxury-grey border-gray-700">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-gold-500" />
                  Manage Competitions
                </CardTitle>
                <CardDescription className="text-gray-400">View, edit, and manage all competitions</CardDescription>
              </CardHeader>
              <CardContent>
                {competitionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading competitions...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Title</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">End Date</TableHead>
                        <TableHead className="text-gray-300">Total Entries</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitions.map((competition) => (
                        <TableRow key={competition.id}>
                          <TableCell className="text-luxury-white font-medium">{competition.title}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                competition.status === "active"
                                  ? "bg-green-500/20 text-green-400 border-green-500"
                                  : competition.status === "ended"
                                    ? "bg-red-500/20 text-red-400 border-red-500"
                                    : "bg-gold-500/20 text-gold-500 border-gold-500"
                              }
                            >
                              {competition.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {competition.end_date ? new Date(competition.end_date).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-luxury-white">{competition.current_entries}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => openEditDialog(competition)}
                                size="sm"
                                variant="outline"
                                className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              {competition.status === "active" && (
                                <Button
                                  onClick={() => closeCompetitionDraw(competition.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                                >
                                  Close Draw
                                </Button>
                              )}
                              <Button
                                onClick={() => deleteCompetition(competition.id, competition.title)}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {competitions.length === 0 && !competitionsLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No competitions found.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={fetchCompetitions}
                    disabled={competitionsLoading}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-black"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${competitionsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit Competition Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-luxury-grey border-gray-700 text-luxury-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Edit className="h-5 w-5 mr-2 text-gold-500" />
                    Edit Competition
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Update the competition details below
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdateCompetition} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title" className="text-luxury-white">
                      Competition Title *
                    </Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="e.g., Win a Luxury Watch"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description" className="text-luxury-white">
                      Description *
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      required
                      rows={4}
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="Describe the prize and competition details..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-image-url" className="text-luxury-white">
                      Prize Image URL (Optional)
                    </Label>
                    <Input
                      id="edit-image-url"
                      type="url"
                      value={editForm.prize_image_url}
                      onChange={(e) => setEditForm({ ...editForm, prize_image_url: e.target.value })}
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Leave empty to use auto-generated placeholder image
                    </p>
                  </div>

                  <DialogFooter className="flex items-center space-x-2">
                    <Button
                      type="button"
                      onClick={closeEditDialog}
                      variant="outline"
                      className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdatingCompetition}
                      className="bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                    >
                      {isUpdatingCompetition ? "Updating..." : "Update Competition"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Create New Competition */}
          <TabsContent value="create-competition">
            <Card className="bg-luxury-grey border-gray-700">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-gold-500" />
                  Create New Competition
                </CardTitle>
                <CardDescription className="text-gray-400">Add a new competition to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCompetition} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="comp-title" className="text-luxury-white">
                        Competition Title *
                      </Label>
                      <Input
                        id="comp-title"
                        value={newCompetition.title}
                        onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                        required
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                        placeholder="e.g., Win a Luxury Watch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="comp-price" className="text-luxury-white">
                        Entry Price (£) *
                      </Label>
                      <Input
                        id="comp-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newCompetition.entry_price}
                        onChange={(e) => setNewCompetition({ ...newCompetition, entry_price: e.target.value })}
                        required
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                        placeholder="5.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comp-description" className="text-luxury-white">
                      Description *
                    </Label>
                    <Textarea
                      id="comp-description"
                      value={newCompetition.description}
                      onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                      required
                      rows={4}
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="Describe the prize and competition details..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="comp-end-date" className="text-luxury-white">
                        End Date (Optional)
                      </Label>
                      <Input
                        id="comp-end-date"
                        type="date"
                        value={newCompetition.end_date}
                        onChange={(e) => setNewCompetition({ ...newCompetition, end_date: e.target.value })}
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="comp-status" className="text-luxury-white">
                        Status
                      </Label>
                      <Select
                        value={newCompetition.status}
                        onValueChange={(value: "active" | "ended" | "draft") =>
                          setNewCompetition({ ...newCompetition, status: value })
                        }
                      >
                        <SelectTrigger className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-luxury-grey">
                          <SelectItem value="draft" className="text-luxury-white">
                            Draft
                          </SelectItem>
                          <SelectItem value="active" className="text-luxury-white">
                            Active
                          </SelectItem>
                          <SelectItem value="ended" className="text-luxury-white">
                            Ended
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreatingCompetition}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                  >
                    {isCreatingCompetition ? "Creating..." : "Create Competition"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
