"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, User, CreditCard, Key, Users, Bell, Shield, Trash2, Copy, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

const settingsNavigation = [
  { name: "Profile", icon: User, id: "profile" },
  { name: "Billing", icon: CreditCard, id: "billing" },
  { name: "API Keys", icon: Key, id: "api" },
  { name: "Team", icon: Users, id: "team" },
  { name: "Notifications", icon: Bell, id: "notifications" },
  { name: "Privacy", icon: Shield, id: "privacy" },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    bio: "Data analyst passionate about AI-powered insights.",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-2">Profile Settings</h2>
        <p className="text-muted-foreground font-sans">Manage your account information and preferences.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">Personal Information</CardTitle>
          <CardDescription className="font-sans">Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-sans">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="font-sans"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="font-sans">
              Company
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="font-sans"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="font-sans">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="font-sans"
              rows={3}
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 font-sans">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">Change Password</CardTitle>
          <CardDescription className="font-sans">Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="font-sans">
              Current Password
            </Label>
            <Input id="current-password" type="password" className="font-sans" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-sans">
              New Password
            </Label>
            <Input id="new-password" type="password" className="font-sans" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-sans">
              Confirm New Password
            </Label>
            <Input id="confirm-password" type="password" className="font-sans" />
          </div>
          <Button className="bg-primary hover:bg-primary/90 font-sans">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-2">Billing & Subscription</h2>
        <p className="text-muted-foreground font-sans">Manage your subscription and billing information.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">Current Plan</CardTitle>
          <CardDescription className="font-sans">You are currently on the Professional plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans font-semibold text-foreground">Professional Plan</h3>
              <p className="text-muted-foreground font-sans">$29/month • Up to 10,000 rows</p>
            </div>
            <Badge className="bg-primary text-primary-foreground font-sans">Active</Badge>
          </div>
          <div className="flex gap-2">
            <Link href="/pricing">
              <Button variant="outline" className="font-sans bg-transparent">
                Change Plan
              </Button>
            </Link>
            <Button variant="outline" className="font-sans bg-transparent text-destructive border-destructive">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">Payment Method</CardTitle>
          <CardDescription className="font-sans">Manage your payment information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-sans font-bold">VISA</span>
              </div>
              <div>
                <p className="font-sans font-medium text-foreground">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground font-sans">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" className="font-sans bg-transparent">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderApiSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-2">API Keys</h2>
        <p className="text-muted-foreground font-sans">Manage your API keys for integrations.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">API Access</CardTitle>
          <CardDescription className="font-sans">Use these keys to integrate with our API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-sans">Production API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                value={showApiKey ? "sk_live_1234567890abcdef" : "sk_live_••••••••••••••••"}
                readOnly
                className="font-mono"
              />
              <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)} className="bg-transparent">
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-sans">Test API Key</Label>
            <div className="flex items-center gap-2">
              <Input value="sk_test_••••••••••••••••" readOnly className="font-mono" />
              <Button variant="outline" size="sm" className="bg-transparent">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 font-sans">Generate New Key</Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-2">Notifications</h2>
        <p className="text-muted-foreground font-sans">Configure how you receive notifications.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">Email Notifications</CardTitle>
          <CardDescription className="font-sans">Choose which emails you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-medium text-foreground">Enrichment Complete</p>
              <p className="text-sm text-muted-foreground font-sans">Get notified when data enrichment finishes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground font-sans">Receive weekly usage summaries</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-medium text-foreground">Product Updates</p>
              <p className="text-sm text-muted-foreground font-sans">Stay informed about new features</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-2">Privacy & Data</h2>
        <p className="text-muted-foreground font-sans">Control your data and privacy settings.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans">Data Management</CardTitle>
          <CardDescription className="font-sans">Manage your data and account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-medium text-foreground">Data Retention</p>
              <p className="text-sm text-muted-foreground font-sans">Keep data for 90 days after deletion</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <Button variant="outline" className="font-sans bg-transparent">
            Export All Data
          </Button>
          <Separator />
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-sans font-semibold text-destructive mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="outline" className="font-sans text-destructive border-destructive bg-transparent">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection()
      case "billing":
        return renderBillingSection()
      case "api":
        return renderApiSection()
      case "notifications":
        return renderNotificationsSection()
      case "privacy":
        return renderPrivacySection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-sans font-semibold text-foreground">Lighthouse AI</h1>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="font-sans">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="font-sans">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar border-r border-sidebar-border">
          <div className="p-6">
            <h2 className="font-sans text-lg font-semibold text-sidebar-foreground mb-4">Settings</h2>
            <nav className="space-y-1">
              {settingsNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left font-sans transition-colors ${
                    activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">{renderSection()}</div>
      </div>
    </div>
  )
}
