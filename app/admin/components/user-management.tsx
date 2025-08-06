"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Users, Trash2, Shield, ShieldCheck, AlertTriangle, Search, RefreshCw } from "lucide-react"

interface User {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  is_admin: boolean
  total_spent: number
  total_entries: number
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Fetch users from auth.users and join with public.users for additional data
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) throw authError

      // Get additional user data from public.users
      const { data: publicUsers, error: publicError } = await supabase
        .from("users")
        .select("id, is_admin, total_spent, total_entries")

      if (publicError) throw publicError

      // Combine the data
      const combinedUsers = authUsers.users.map((authUser) => {
        const publicUser = publicUsers?.find((pu) => pu.id === authUser.id)
        return {
          id: authUser.id,
          email: authUser.email || "",
          created_at: authUser.created_at,
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at,
          is_admin: publicUser?.is_admin || false,
          total_spent: publicUser?.total_spent || 0,
          total_entries: publicUser?.total_entries || 0,
        }
      })

      setUsers(combinedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("users").update({ is_admin: !currentStatus }).eq("id", userId)

      if (error) throw error

      setMessage(`User admin status ${!currentStatus ? "granted" : "revoked"} successfully`)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error("Error updating admin status:", error)
      setError("Failed to update admin status")
    }
  }

  const deleteUser = async (userId: string, email: string) => {
    setDeleteLoading(true)
    try {
      // First delete from public.users
      const { error: publicError } = await supabase.from("users").delete().eq("id", userId)

      if (publicError) throw publicError

      // Then delete from auth.users using admin API
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) throw authError

      setMessage(`User ${email} deleted successfully`)
      setSelectedUser(null)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user")
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const confirmedUsers = users.filter((user) => user.email_confirmed_at).length
  const unconfirmedUsers = users.filter((user) => !user.email_confirmed_at).length
  const adminUsers = users.filter((user) => user.is_admin).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-luxury-white">User Management</h2>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <Button onClick={fetchUsers} disabled={loading} className="bg-gold-500 hover:bg-gold-600">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {message && (
        <Alert className="border-green-500 bg-green-500/10">
          <AlertDescription className="text-green-400">{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-luxury-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-luxury-white">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-luxury-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Confirmed</p>
                <p className="text-2xl font-bold text-luxury-white">{confirmedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-luxury-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Unconfirmed</p>
                <p className="text-2xl font-bold text-luxury-white">{unconfirmedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-luxury-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-luxury-white">{adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-luxury-black border-gray-600 text-luxury-white"
        />
      </div>

      {/* Users Table */}
      <Card className="bg-luxury-gray border-gray-700">
        <CardHeader>
          <CardTitle className="text-luxury-white">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-gray-400">Manage user accounts, permissions, and data</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Spent</TableHead>
                  <TableHead className="text-gray-300">Entries</TableHead>
                  <TableHead className="text-gray-300">Joined</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-luxury-white font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.email_confirmed_at
                            ? "bg-green-500/20 text-green-400 border-green-500"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500"
                        }
                      >
                        {user.email_confirmed_at ? "Confirmed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.is_admin
                            ? "bg-purple-500/20 text-purple-400 border-purple-500"
                            : "bg-gray-500/20 text-gray-400 border-gray-500"
                        }
                      >
                        {user.is_admin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-luxury-white">£{user.total_spent.toFixed(2)}</TableCell>
                    <TableCell className="text-luxury-white">{user.total_entries}</TableCell>
                    <TableCell className="text-gray-400">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          size="sm"
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-luxury-black"
                        >
                          {user.is_admin ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Revoke Admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Make Admin
                            </>
                          )}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedUser(user)}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-luxury-black"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-luxury-gray border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-luxury-white">Delete User</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Are you sure you want to delete {selectedUser?.email}? This action cannot be undone and
                                will remove all user data including entries, dividends, and referrals.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedUser(null)}
                                className="border-gray-600 text-gray-400"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => selectedUser && deleteUser(selectedUser.id, selectedUser.email)}
                                disabled={deleteLoading}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                {deleteLoading ? "Deleting..." : "Delete User"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
