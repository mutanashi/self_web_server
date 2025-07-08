"use client"

import { useEffect, useState } from "react"
import { Check, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function UserAccountSettingsPage() {
  const { toast } = useToast()
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const [username, setUsername] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const cookies = document.cookie.split(";").reduce((acc: any, cookieStr) => {
      const [key, value] = cookieStr.trim().split("=")
      acc[key] = decodeURIComponent(value)
      return acc
    }, {})
    setUsername(cookies.username || "")
  }, [])

  const handleAccountSave = async () => {
    setStatusMsg(null)

    const res = await fetch("/api/account/update-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })

    const data = await res.json()
    if (data.success) {
      toast({ title: "Username updated." })
      setStatusMsg("Success: Username updated.")
    } else {
      setStatusMsg(data.message || "Failed to update username.")
    }
  }

  const handlePasswordSave = async () => {
    setStatusMsg(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMsg("Password confirmation mismatch.")
      return
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 4) {
      setStatusMsg("Password must be at least 4 characters.")
      return
    }

    const res = await fetch("/api/account/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    })

    const data = await res.json()

    if (data.success) {
      toast({ title: "Password updated successfully." })
      setStatusMsg("Success: Password updated.")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } else {
      setStatusMsg(data.message || "Failed to update password.")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">User Account Settings</h1>

      {statusMsg && <div className="text-sm text-red-600 dark:text-red-400 font-medium">{statusMsg}</div>}

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
              <CardDescription>Change your username</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </CardContent>
            <CardFooter>
              <Button onClick={handleAccountSave}>
                <Save className="mr-2 h-4 w-4" /> Save Username
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />

              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />

              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            </CardContent>
            <CardFooter>
              <Button onClick={handlePasswordSave}>
                <Check className="mr-2 h-4 w-4" /> Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
