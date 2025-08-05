import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard, 
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { useFinancialStore } from "@/store/financial-store"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  currency: string
  language: string
  timezone: string
}

interface NotificationSettings {
  budgetAlerts: boolean
  goalReminders: boolean
  transactionNotifications: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  marketingEmails: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  biometricLogin: boolean
  sessionTimeout: string
}

export function ProfileView() {
  const { transactions, budgets, goals } = useFinancialStore()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1 (555) 123-4567",
    currency: "KES",
    language: "en",
    timezone: "America/New_York"
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    budgetAlerts: true,
    goalReminders: true,
    transactionNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    marketingEmails: false
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricLogin: true,
    sessionTimeout: "30"
  })

  const [activeSection, setActiveSection] = useState<string>("profile")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleProfileUpdate = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    })
  }

  const handleNotificationUpdate = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
    toast({
      title: "Notification settings updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}.`
    })
  }

  const handleSecurityUpdate = (key: keyof SecuritySettings, value: boolean | string) => {
    setSecurity(prev => ({ ...prev, [key]: value }))
    toast({
      title: "Security settings updated",
      description: "Your security preferences have been saved."
    })
  }

  const handleExportData = () => {
    const data = {
      profile,
      transactions,
      budgets,
      goals,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smartspend-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your financial data has been downloaded successfully."
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "This feature would normally contact support for account deletion.",
      variant: "destructive"
    })
    setShowDeleteConfirm(false)
  }

  const accountStats = {
    totalTransactions: transactions.length,
    totalBudgets: budgets.length,
    totalGoals: goals.length,
    accountAge: "3 months",
    lastLogin: "Today"
  }

  const menuItems = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "data", label: "Data & Privacy", icon: Download },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-20 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Premium User</Badge>
                  <Badge variant="outline">Verified</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{accountStats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{accountStats.totalBudgets}</div>
                <p className="text-xs text-muted-foreground">Active Budgets</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{accountStats.totalGoals}</div>
                <p className="text-xs text-muted-foreground">Savings Goals</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{accountStats.accountAge}</div>
                <p className="text-xs text-muted-foreground">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card>
          <CardContent className="pt-6">
            {activeSection === "profile" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <Button onClick={handleProfileUpdate} className="w-full">
                  Save Changes
                </Button>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </h3>
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'budgetAlerts' && 'Get notified when you exceed budget limits'}
                        {key === 'goalReminders' && 'Reminders about your savings goals progress'}
                        {key === 'transactionNotifications' && 'Alerts for every transaction'}
                        {key === 'weeklyReports' && 'Weekly summary of your finances'}
                        {key === 'monthlyReports' && 'Monthly financial reports'}
                        {key === 'marketingEmails' && 'Product updates and tips'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationUpdate(key as keyof NotificationSettings, checked)}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => handleSecurityUpdate('twoFactorEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Biometric Login</p>
                      <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                    </div>
                    <Switch
                      checked={security.biometricLogin}
                      onCheckedChange={(checked) => handleSecurityUpdate('biometricLogin', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select 
                      value={security.sessionTimeout} 
                      onValueChange={(value) => handleSecurityUpdate('sessionTimeout', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "preferences" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  App Preferences
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <div className="p-2 border rounded-md bg-muted/50">
                      <span className="text-sm">KES (Ksh.)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={profile.language} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={profile.timezone} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                        <SelectItem value="Europe/Paris">CET</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "data" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data & Privacy
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Export Your Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download a copy of all your financial data including transactions, budgets, and goals.
                    </p>
                    <Button onClick={handleExportData} variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Import Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Import financial data from other apps or previous exports.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </div>

                  <Separator />

                  <div className="p-4 border border-destructive rounded-lg">
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-destructive">
                          Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={handleDeleteAccount}
                          >
                            Yes, Delete
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}