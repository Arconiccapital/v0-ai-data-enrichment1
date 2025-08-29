"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Link,
  Copy,
  Mail,
  Shield,
  Clock,
  Eye,
  Edit,
  Trash,
  Users,
  Globe,
  Lock,
  Code,
  Check,
  AlertCircle,
  X
} from "lucide-react"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dashboardId: string
  dashboardName: string
}

interface ShareLink {
  id: string
  token: string
  url: string
  permissions: string[]
  expiresAt?: string
  password?: string
  views: number
  createdAt: string
}

interface SharedUser {
  id: string
  email: string
  name?: string
  role: "viewer" | "editor" | "admin"
  addedAt: string
}

export function ShareDialog({
  open,
  onOpenChange,
  dashboardId,
  dashboardName,
}: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState("link")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Link sharing state
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [linkExpiry, setLinkExpiry] = useState("7d")
  const [requirePassword, setRequirePassword] = useState(false)
  const [linkPassword, setLinkPassword] = useState("")
  const [linkPermissions, setLinkPermissions] = useState<"view" | "edit">("view")
  
  // Email sharing state
  const [emailInput, setEmailInput] = useState("")
  const [emailRole, setEmailRole] = useState<"viewer" | "editor">("viewer")
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    // Mock data for demo
    {
      id: "1",
      email: "john@example.com",
      name: "John Doe",
      role: "editor",
      addedAt: "2024-01-15"
    },
    {
      id: "2",
      email: "jane@example.com",
      name: "Jane Smith",
      role: "viewer",
      addedAt: "2024-01-20"
    }
  ])
  
  // Embed state
  const [embedWidth, setEmbedWidth] = useState("100%")
  const [embedHeight, setEmbedHeight] = useState("600px")
  const [embedTheme, setEmbedTheme] = useState("light")

  const generateShareLink = async () => {
    setIsGenerating(true)
    
    try {
      // Mock API call - in production, this would call /api/share/create
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const token = Math.random().toString(36).substring(7)
      const newShareLink: ShareLink = {
        id: "share_" + Date.now(),
        token,
        url: `${window.location.origin}/share/${token}`,
        permissions: linkPermissions === "edit" ? ["view", "edit"] : ["view"],
        expiresAt: linkExpiry !== "never" ? new Date(Date.now() + getExpiryMs(linkExpiry)).toISOString() : undefined,
        password: requirePassword ? linkPassword : undefined,
        views: 0,
        createdAt: new Date().toISOString()
      }
      
      setShareLink(newShareLink)
      toast.success("Share link generated successfully")
    } catch (error) {
      toast.error("Failed to generate share link")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copied to clipboard")
  }

  const inviteByEmail = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    // Mock API call
    const newUser: SharedUser = {
      id: Date.now().toString(),
      email: emailInput,
      role: emailRole,
      addedAt: new Date().toISOString().split("T")[0]
    }
    
    setSharedUsers([...sharedUsers, newUser])
    setEmailInput("")
    toast.success(`Invitation sent to ${emailInput}`)
  }

  const removeUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter(u => u.id !== userId))
    toast.success("User access revoked")
  }

  const getExpiryMs = (expiry: string): number => {
    const map: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }
    return map[expiry] || 7 * 24 * 60 * 60 * 1000
  }

  const generateEmbedCode = () => {
    const baseUrl = `${window.location.origin}/embed/${dashboardId}`
    const params = new URLSearchParams({
      theme: embedTheme,
      width: embedWidth,
      height: embedHeight,
    })
    
    return `<iframe
  src="${baseUrl}?${params}"
  width="${embedWidth}"
  height="${embedHeight}"
  frameborder="0"
  allow="clipboard-write"
  title="${dashboardName}"
></iframe>`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Share Dashboard
          </DialogTitle>
          <DialogDescription>
            Share "{dashboardName}" with others via link, email, or embed
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            {!shareLink ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Access Level</Label>
                    <Select value={linkPermissions} onValueChange={(v: any) => setLinkPermissions(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Only
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Can Edit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Link Expiry</Label>
                    <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password Protection</Label>
                      <p className="text-sm text-gray-500">Require password to access</p>
                    </div>
                    <Switch
                      checked={requirePassword}
                      onCheckedChange={setRequirePassword}
                    />
                  </div>

                  {requirePassword && (
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                    />
                  )}
                </div>

                <Button
                  onClick={generateShareLink}
                  disabled={isGenerating || (requirePassword && !linkPassword)}
                  className="w-full"
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Generate Share Link
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Share link active</span>
                    </div>
                    <Badge variant="secondary">
                      {shareLink.permissions.includes("edit") ? "Can Edit" : "View Only"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={shareLink.url}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shareLink.url)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {shareLink.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires {new Date(shareLink.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    {shareLink.password && (
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Password protected
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {shareLink.views} views
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShareLink(null)
                    toast.success("Share link revoked")
                  }}
                  className="w-full"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Revoke Link
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="people" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1"
                />
                <Select value={emailRole} onValueChange={(v: any) => setEmailRole(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={inviteByEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Shared with</Label>
                <div className="space-y-2">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {user.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeUser(user.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    placeholder="100% or 800px"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    placeholder="600px"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={embedTheme} onValueChange={setEmbedTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Embed Code</Label>
                <div className="relative">
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateEmbedCode())}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Public Access</p>
                  <p className="text-blue-700">
                    Embedded dashboards are publicly accessible. Sensitive data will be hidden.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}