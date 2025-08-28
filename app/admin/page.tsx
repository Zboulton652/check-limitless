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
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Trophy,
  DollarSign,
  Settings,
  Plus,
  Trash2,
  Eye,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Competition = Database["public"]["Tables"]["competitions"]["Row"]
type Entry = Database["public"]["Tables"]["entries"]["Row"] & {
  users: { email: string } | null
  competitions: { title: string } | null
}
type Dividend = Database["public"]["Tables"]["dividends"]["Row"] & {
  users: { email: string } | null
}

interface DividendDetailsUser {
  email: string
  bank_sort_code: string | null
  bank_account_number: string | null
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [selectedDividend, setSelectedDividend] = useState<Dividend | null>(null)
  const [dividendUser, setDividendUser] = useState<DividendDetailsUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  // Form states
  const [newCompetition, setNewCompetition] = useState({
    title: "",
    description: "",
    entry_fee: "",
    max_entries: "",
    end_date: "",
    status: "active" as const,
  })

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

      // Check if user is admin
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setCurrentUser(profile)
      await loadData()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/auth/login")
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) {
        console.error("Error fetching users:", usersError)
      } else {
        setUsers(usersData || [])
      }

      // Load competitions
      const { data: competitionsData, error: competitionsError } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false })

      if (competitionsError) {
        console.error("Error fetching competitions:", competitionsError)
      } else {
        setCompetitions(competitionsData || [])
      }

      // Load entries with user and competition details
      const { data: entriesData, error: entriesError } = await supabase
        .from("entries")
        .select(`
          *,
          users (email),
          competitions (title)
        `)
        .order("created_at", { ascending: false })

      if (entriesError) {
        console.error("Error fetching entries:", entriesError)
      } else {
        setEntries(entriesData || [])
      }

      // Load dividends with user details
      const { data: dividendsData, error: dividendsError } = await supabase
        .from("dividends")
        .select(`
          *,
          users (email)
        `)
        .order("created_at", { ascending: false })

      if (dividendsError) {
        console.error("Error fetching dividends:", dividendsError)
      } else {
        setDividends(dividendsData || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    console.log("Fetching user details for userId:", userId)
    setIsLoadingUser(true)

    try {
      const { data, error } = await supabase
        .from("users")
        .select("email, bank_sort_code, bank_account_number")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        console.error("Error fetching user details:", error)
        return null
      }

      if (!data) {
        console.warn("User not found with ID:", userId)
        return null
      }

      console.log("Successfully fetched user details:", data)
      return data
    } catch (error) {
      console.error("Exception in fetchUserDetails:", error)
      return null
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleViewDividendDetails = async (dividend: Dividend) => {
    setSelectedDividend(dividend)
    setDividendUser(null)

    const userDetails = await fetchUserDetails(dividend.user_id)
    if (userDetails) {
      setDividendUser(userDetails)
    }
  }

  const createCompetition = async () => {
    try {
      const { error } = await supabase.from("competitions").insert([
        {
          title: newCompetition.title,
          description: newCompetition.description,
          entry_fee: Number.parseFloat(newCompetition.entry_fee),
          max_entries: Number.parseInt(newCompetition.max_entries),
          end_date: newCompetition.end_date,
          status: newCompetition.status,
        },
      ])

      if (error) throw error

      setMessage("Competition created successfully!")
      setNewCompetition({
        title: "",
        description: "",
        entry_fee: "",
        max_entries: "",
        end_date: "",
        status: "active",
      })
      await loadData()
    } catch (error) {
      console.error("Error creating competition:", error)
      setMessage("Error creating competition")
    }
  }

  const updateDividendStatus = async (dividendId: string, status: "pending" | "paid") => {
    try {
      const { error } = await supabase.from("dividends").update({ status }).eq("id", dividendId)

      if (error) throw error

      setMessage(`Dividend marked as ${status}!`)
      await loadData()
    } catch (error) {
      console.error("Error updating dividend:", error)
      setMessage("Error updating dividend status")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error

      setMessage("User deleted successfully!")
      await loadData()
    } catch (error) {
      console.error("Error deleting user:", error)
      setMessage("Error deleting user")
    }
  }

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

  if (!currentUser) {
    return null
  }

  const totalUsers = users.length
  const totalCompetitions = competitions.length
  const totalEntries = entries.length
  const totalRevenue = entries.reduce((sum, entry) => sum + (entry.amount_paid || 0), 0)
  const pendingDividends = dividends.filter((d) => d.status === "pending").length

  return (
    <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, competitions, and platform operations</p>
        </div>

        {message && (
          <Alert className="mb-6 border-gold-500 bg-gold-500/10">
            <AlertDescription className="text-gold-400">{message}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-luxury-white">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Competitions</p>
                  <p className="text-2xl font-bold text-luxury-white">{totalCompetitions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Entries</p>
                  <p className="text-2xl font-bold text-luxury-white">{totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-gold-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-luxury-white">£{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-luxury-grey border-luxury-grey">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pending Dividends</p>
                  <p className="text-2xl font-bold text-luxury-white">{pendingDividends}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-luxury-grey border-luxury-grey">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              User Management
            </TabsTrigger>
            <TabsTrigger
              value="competitions"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              Competitions
            </TabsTrigger>
            <TabsTrigger
              value="entries"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              View Entries
            </TabsTrigger>
            <TabsTrigger
              value="dividends"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              View Dividends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-luxury-white">{user.email}</h3>
                          <Badge
                            className={
                              user.role === "admin"
                                ? "bg-red-500/20 text-red-400 border-red-500"
                                : "bg-blue-500/20 text-blue-400 border-blue-500"
                            }
                          >
                            {user.role || "user"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <span>Spent: £{user.total_spent?.toFixed(2) || "0.00"}</span>
                          <span>Dividends: £{user.total_dividends?.toFixed(2) || "0.00"}</span>
                          <span>Credit: £{user.site_credit?.toFixed(2) || "0.00"}</span>
                          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser(user.id)}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitions">
            <div className="space-y-6">
              {/* Create Competition Form */}
              <Card className="bg-luxury-grey border-luxury-grey">
                <CardHeader>
                  <CardTitle className="text-luxury-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Competition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-luxury-white">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newCompetition.title}
                        onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                        className="bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entry_fee" className="text-luxury-white">
                        Entry Fee (£)
                      </Label>
                      <Input
                        id="entry_fee"
                        type="number"
                        step="0.01"
                        value={newCompetition.entry_fee}
                        onChange={(e) => setNewCompetition({ ...newCompetition, entry_fee: e.target.value })}
                        className="bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-luxury-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newCompetition.description}
                      onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                      className="bg-luxury-black border-luxury-grey text-luxury-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="max_entries" className="text-luxury-white">
                        Max Entries
                      </Label>
                      <Input
                        id="max_entries"
                        type="number"
                        value={newCompetition.max_entries}
                        onChange={(e) => setNewCompetition({ ...newCompetition, max_entries: e.target.value })}
                        className="bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date" className="text-luxury-white">
                        End Date
                      </Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={newCompetition.end_date}
                        onChange={(e) => setNewCompetition({ ...newCompetition, end_date: e.target.value })}
                        className="bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-luxury-white">
                        Status
                      </Label>
                      <Select
                        value={newCompetition.status}
                        onValueChange={(value: "active" | "completed" | "cancelled") =>
                          setNewCompetition({ ...newCompetition, status: value })
                        }
                      >
                        <SelectTrigger className="bg-luxury-black border-luxury-grey text-luxury-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-luxury-grey">
                          <SelectItem value="active" className="text-luxury-white">
                            Active
                          </SelectItem>
                          <SelectItem value="completed" className="text-luxury-white">
                            Completed
                          </SelectItem>
                          <SelectItem value="cancelled" className="text-luxury-white">
                            Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={createCompetition}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                  >
                    Create Competition
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Competitions */}
              <Card className="bg-luxury-grey border-luxury-grey">
                <CardHeader>
                  <CardTitle className="text-luxury-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Existing Competitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {competitions.map((competition) => (
                      <div
                        key={competition.id}
                        className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-luxury-white">{competition.title}</h3>
                            <Badge
                              className={
                                competition.status === "active"
                                  ? "bg-green-500/20 text-green-400 border-green-500"
                                  : competition.status === "completed"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500"
                                    : "bg-red-500/20 text-red-400 border-red-500"
                              }
                            >
                              {competition.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{competition.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                            <span>Entry Fee: £{competition.entry_fee?.toFixed(2)}</span>
                            <span>Max Entries: {competition.max_entries}</span>
                            <span>Current Entries: {competition.current_entries || 0}</span>
                            <span>
                              Ends:{" "}
                              {competition.end_date
                                ? new Date(competition.end_date).toLocaleDateString()
                                : "No end date"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="entries">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Competition Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-luxury-white">
                            {entry.competitions?.title || "Unknown Competition"}
                          </h3>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">Entry</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <span>User: {entry.users?.email || "Unknown"}</span>
                          <span>Amount: £{entry.amount_paid?.toFixed(2) || "0.00"}</span>
                          <span>Date: {new Date(entry.created_at).toLocaleDateString()}</span>
                          <span>Time: {new Date(entry.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dividends">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Dividend Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dividends.map((dividend) => (
                    <div
                      key={dividend.id}
                      className="flex items-center justify-between p-4 bg-luxury-black rounded-lg border border-luxury-grey"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-luxury-white">{dividend.period || "Dividend Payment"}</h3>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <span>User: {dividend.users?.email || "Unknown"}</span>
                          <span>Amount: £{dividend.amount.toFixed(2)}</span>
                          <span>Created: {new Date(dividend.created_at).toLocaleDateString()}</span>
                          <span>Period: {dividend.period || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDividendDetails(dividend)}
                          className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {dividend.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateDividendStatus(dividend.id, "paid")}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Mark as Paid
                          </Button>
                        )}
                        {dividend.status === "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDividendStatus(dividend.id, "pending")}
                            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                          >
                            Mark as Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dividend Details Modal */}
        {selectedDividend && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-luxury-grey border border-luxury-grey rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-luxury-white">Dividend Details</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedDividend(null)
                    setDividendUser(null)
                  }}
                  className="text-gray-400 hover:text-luxury-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-luxury-white">Amount</Label>
                  <p className="text-gold-500 font-semibold text-lg">£{selectedDividend.amount.toFixed(2)}</p>
                </div>

                <div>
                  <Label className="text-luxury-white">Status</Label>
                  <Badge
                    className={
                      selectedDividend.status === "paid"
                        ? "bg-green-500/20 text-green-400 border-green-500 ml-2"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500 ml-2"
                    }
                  >
                    {selectedDividend.status}
                  </Badge>
                </div>

                <div>
                  <Label className="text-luxury-white">Period</Label>
                  <p className="text-gray-300">{selectedDividend.period || "N/A"}</p>
                </div>

                <div>
                  <Label className="text-luxury-white">Created Date</Label>
                  <p className="text-gray-300">{new Date(selectedDividend.created_at).toLocaleString()}</p>
                </div>

                {isLoadingUser ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading user details...</p>
                  </div>
                ) : dividendUser ? (
                  <div className="border-t border-luxury-grey pt-4">
                    <h4 className="text-luxury-white font-semibold mb-2">User Information</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-luxury-white">Email</Label>
                        <p className="text-gray-300">{dividendUser.email}</p>
                      </div>
                      <div>
                        <Label className="text-luxury-white">Sort Code</Label>
                        <p className="text-gray-300">{dividendUser.bank_sort_code || "No sort code provided"}</p>
                      </div>
                      <div>
                        <Label className="text-luxury-white">Account Number</Label>
                        <p className="text-gray-300">
                          {dividendUser.bank_account_number || "No account number provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-luxury-grey pt-4">
                    <p className="text-red-400">Failed to load user details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
