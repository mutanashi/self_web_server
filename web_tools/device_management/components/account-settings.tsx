"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, User } from "@/lib/api"
import { CookieManager } from "@/lib/cookies"

export function AccountSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [newUsername, setNewUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiClient.getCurrentUser()
        setUser(userData)
        setNewUsername(userData.username)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        })
      }
    }

    fetchUser()
  }, [toast])

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      })
      return
    }

    setUsernameLoading(true)
    try {
      const updatedUser = await apiClient.updateUsername(newUsername)
      
      // Update cookie with new username
      CookieManager.updateUsernameInCookie(newUsername)
      
      setUser(updatedUser)
      
      toast({
        title: "Success",
        description: "Username updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating username:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      })
    } finally {
      setUsernameLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setPasswordLoading(true)
    try {
      await apiClient.updatePassword(currentPassword, newPassword)
      
      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Account Settings</h1>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Account Settings</h1>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                />
                <Button 
                  onClick={handleUsernameUpdate}
                  disabled={usernameLoading || !newUsername.trim() || newUsername === user?.username}
                >
                  {usernameLoading ? "Saving..." : "Save Username"}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>User ID: {user?.id}</p>
              <p>User Level: {user?.userLevel}</p>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            
            <Button 
              onClick={handlePasswordUpdate}
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
