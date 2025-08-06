"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type Competition = Database["public"]["Tables"]["competitions"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [entryPrice, setEntryPrice] = useState("")
  const [maxEntries, setMaxEntries] = useState("")
  const [status, setStatus] = useState<"active" | "ended" | "draft">("draft")
  const [endDate, setEndDate] = useState("")
  const [termsAndConditions, setTermsAndConditions] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFeatured, setIsFeatured] = useState(false)

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
        router.push("/")
        return
      }

      setUser(profile)
      fetchCompetitions()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase.from("competitions").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCompetitions(data || [])
    } catch (error) {
      console.error("Error fetching competitions:", error)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setEntryPrice("")
    setMaxEntries("")
    setStatus("draft")
    setEndDate("")
    setTermsAndConditions("")
    setEditingId(null)
    setIsFeatured(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      const competitionData = {
        title,
        description,
        entry_price: Number.parseFloat(entryPrice),
        max_entries: maxEntries ? Number.parseInt(maxEntries) : null,
        status,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        terms_and_conditions: termsAndConditions || null,
        prize_image_url: "/placeholder.svg?height=400&width=600&text=" + encodeURIComponent(title),
        is_featured: isFeatured,
      }

      if (editingId) {
        const { error } = await supabase.from("competitions").update(competitionData).eq("id", editingId)
        if (error) throw error
        setMessage("Competition updated successfully!")
      } else {
        const { error } = await supabase.from("competitions").insert(competitionData)
        if (error) throw error
        setMessage("Competition created successfully!")
      }

      resetForm()
      fetchCompetitions()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (competition: Competition) => {
    setTitle(competition.title)
    setDescription(competition.description)
    setEntryPrice(competition.entry_price.toString())
    setMaxEntries(competition.max_entries?.toString() || "")
    setStatus(competition.status)
    setEndDate(competition.end_date ? new Date(competition.end_date).toISOString().split("T")[0] : "")
    setTermsAndConditions(competition.terms_and_conditions || "")
    setEditingId(competition.id)
    setIsFeatured(competition.is_featured || false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) return

    try {
      const { error } = await supabase.from("competitions").delete().eq("id", id)
      if (error) throw error
      setMessage("Competition deleted successfully!")
      fetchCompetitions()
    } catch (error: any) {
      setError(error.message)
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

  return (
    <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage competitions and platform settings</p>
        </div>

        {message && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-400">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="competitions" className="space-y-6">
          <TabsList className="bg-luxury-grey border-luxury-grey">
            <TabsTrigger
              value="competitions"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              Competitions
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-luxury-black"
            >
              {editingId ? "Edit Competition" : "Create Competition"}
            </TabsTrigger>
          </TabsList>

          {/* Competitions List */}
          <TabsContent value="competitions">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white">All Competitions</CardTitle>
              </CardHeader>
              <CardContent>
                {competitions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No competitions created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {competitions.map((competition) => (
                      <div key={competition.id} className="p-4 bg-luxury-black rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-luxury-white">{competition.title}</h3>
                              <Badge
                                variant="secondary"
                                className={`${
                                  competition.status === "active"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : competition.status === "ended"
                                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                                      : "bg-gold-500/20 text-gold-500 border-gold-500/30"
                                }`}
                              >
                                {competition.status}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{competition.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>£{competition.entry_price}</span>
                              <span>{competition.current_entries} entries</span>
                              {competition.end_date && (
                                <span>Ends: {new Date(competition.end_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              onClick={() => handleEdit(competition)}
                              size="sm"
                              variant="outline"
                              className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-luxury-black"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(competition.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-luxury-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create/Edit Competition */}
          <TabsContent value="create">
            <Card className="bg-luxury-grey border-luxury-grey">
              <CardHeader>
                <CardTitle className="text-luxury-white flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-gold-500" />
                  {editingId ? "Edit Competition" : "Create New Competition"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title" className="text-luxury-white">
                        Competition Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                        placeholder="e.g., Win a Luxury Watch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="entry-price" className="text-luxury-white">
                        Entry Price (£)
                      </Label>
                      <Input
                        id="entry-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        required
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                        placeholder="5.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-luxury-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="Describe the prize and competition details..."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="max-entries" className="text-luxury-white">
                        Max Entries (Optional)
                      </Label>
                      <Input
                        id="max-entries"
                        type="number"
                        min="1"
                        value={maxEntries}
                        onChange={(e) => setMaxEntries(e.target.value)}
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                        placeholder="1000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-luxury-white">
                        Status
                      </Label>
                      <Select value={status} onValueChange={(value: "active" | "ended" | "draft") => setStatus(value)}>
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

                    <div>
                      <Label htmlFor="is-featured" className="text-luxury-white">
                        Featured Competition
                      </Label>
                      <Select
                        value={isFeatured ? "true" : "false"}
                        onValueChange={(value) => setIsFeatured(value === "true")}
                      >
                        <SelectTrigger className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-luxury-grey">
                          <SelectItem value="false" className="text-luxury-white">
                            Not Featured
                          </SelectItem>
                          <SelectItem value="true" className="text-luxury-white">
                            Featured on Homepage
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-400 mt-1">
                        Only one competition can be featured at a time. This will override the automatic newest
                        competition display.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="end-date" className="text-luxury-white">
                        End Date (Optional)
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="terms" className="text-luxury-white">
                      Terms & Conditions (Optional)
                    </Label>
                    <Textarea
                      id="terms"
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      rows={4}
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="Enter terms and conditions for this competition..."
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold"
                    >
                      {isSubmitting ? "Saving..." : editingId ? "Update Competition" : "Create Competition"}
                    </Button>

                    {editingId && (
                      <Button
                        type="button"
                        onClick={resetForm}
                        variant="outline"
                        className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-luxury-black bg-transparent"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
