import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
 FileUp,
 FileDown,
  Trash2,
  Save,
  Loader2,
  LogOut
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { clearFinancialData } from "@/store/financial-store"
import { exportAllDataToJSON, importTransactionsFromCSV } from "@/store/financial-store"

interface UserProfile {
  display_name: string
  email: string
  phone: string
  notifications_enabled: boolean
  push_notifications_enabled: boolean
}

export function ProfileView() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile>({
    display_name: "",
    email: "",
    phone: "",
    notifications_enabled: true,
    push_notifications_enabled: true
  })

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("profile")

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchNotifications()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          notifications_enabled: data.notifications_enabled ?? true,
          push_notifications_enabled: data.push_notifications_enabled ?? true
        })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          phone: profile.phone,
          notifications_enabled: profile.notifications_enabled,
          push_notifications_enabled: profile.push_notifications_enabled
        })
        .eq('user_id', user.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    })
  }

  const menuItems = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Privacy", icon:FileUp },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-20 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                  {profile.display_name ? profile.display_name[0]?.toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{profile.display_name || 'User'}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.display_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={profile.notifications_enabled}
                        onCheckedChange={(checked) => setProfile(prev => ({ ...prev, notifications_enabled: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
                      </div>
                      <Switch
                        checked={profile.push_notifications_enabled}
                        onCheckedChange={(checked) => setProfile(prev => ({ ...prev, push_notifications_enabled: checked }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleProfileUpdate} className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h3>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 border rounded-lg ${notification.read ? 'bg-muted/50' : 'bg-background'}`}
                        onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </h3>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Account Security</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your account is secured with Supabase authentication.
                  </p>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "data" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Data & Privacy
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Data Management</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Manage your financial data and privacy settings.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          const result = exportAllDataToJSON();
                          if (result.success) {
                            const blob = new Blob([result.data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = result.filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            
                            toast({
                              title: "Export successful",
                              description: `Downloaded ${result.filename}`
                            });
                          }
                        }}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.json,.csv';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              try {
                                if (file.name.endsWith('.json')) {
                                  const data = JSON.parse(content);
                                  if (data.transactions) {
                                    // Import JSON backup
                                    clearFinancialData();
                                    data.transactions.forEach((t: any) => {
                                      useFinancialStore.getState().addTransaction({
                                        ...t,
                                        date: new Date(t.date)
                                      });
                                    });
                                    data.budgets?.forEach((b: any) => {
                                      useFinancialStore.getState().addBudget(b);
                                    });
                                    data.goals?.forEach((g: any) => {
                                      useFinancialStore.getState().addGoal({
                                        ...g,
                                        deadline: new Date(g.deadline)
                                      });
                                    });
                                    toast({
                                      title: "Import successful",
                                      description: "Your data has been restored."
                                    });
                                  }
                                } else {
                                  // Import CSV
                                  const result = importTransactionsFromCSV(content);
                                  if (result.success) {
                                    toast({
                                      title: "Import successful",
                                      description: `Imported ${result.imported} transactions.`
                                    });
                                  } else {
                                    toast({
                                      title: "Import failed",
                                      description: result.error,
                                      variant: "destructive"
                                    });
                                  }
                                }
                              } catch (error) {
                                toast({
                                  title: "Import failed",
                                  description: "Invalid file format.",
                                  variant: "destructive"
                                });
                              }
                            };
                            reader.readAsText(file);
                          };
                          input.click();
                        }}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Import Data
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />

                  <div className="p-4 border border-destructive rounded-lg">
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
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