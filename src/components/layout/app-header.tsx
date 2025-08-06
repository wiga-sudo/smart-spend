import { Bell, Settings,FileUp,FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { 
  importTransactionsFromCSV, 
  importBudgetFromFile,
  exportTransactionsToCSV,
  exportBudgetsToCSV,
  exportAllDataToJSON
} from "@/store/financial-store"

interface AppHeaderProps {
  title: string
  subtitle?: string
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

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
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error:', error)
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
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>, type: 'transactions' | 'budget') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      if (type === 'transactions') {
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
      } else {
        const result = importBudgetFromFile(content);
        if (result.success) {
          toast({
            title: "Import successful",
            description: `Imported ${result.imported} budget items.`
          });
        } else {
          toast({
            title: "Import failed",
            description: result.error,
            variant: "destructive"
          });
        }
      }
    }
    
    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Failed to read the selected file.",
        variant: "destructive"
      });
    }
    
    reader.readAsText(file)
    
    // Clear the input so the same file can be selected again
    event.target.value = ''
    setShowImport(false)
  }

  const handleExport = (type: 'transactions' | 'budgets' | 'all') => {
    let result;
    
    switch (type) {
      case 'transactions':
        result = exportTransactionsToCSV();
        break;
      case 'budgets':
        result = exportBudgetsToCSV();
        break;
      case 'all':
        result = exportAllDataToJSON();
        break;
      default:
        return;
    }

    if (result.success) {
      // Create and download the file
      const blob = new Blob([result.data], { 
        type: type === 'all' ? 'application/json' : 'text/csv' 
      });
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
    } else {
      toast({
        toast({
          title: "Import Started",
        description: result.error,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Dialog open={showImport} onOpenChange={setShowImport}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Import Data">
              <FileUp className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Financial Data</DialogTitle>
              <DialogDescription>
                Import your transactions or budget from CSV or Excel files
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactions-file">Import Transactions (CSV)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  CSV format: description, amount, category, date, type
                </p>
                <Input
                  id="transactions-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileImport(e, 'transactions')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-file">Import Budget (CSV/Excel)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  CSV format: category, budgeted, month
                </p>
                <Input
                  id="budget-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileImport(e, 'budget')}
                />
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Export Options</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleExport('transactions')}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Transactions (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleExport('budgets')}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Budgets (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleExport('all')}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export All Data (JSON)
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                Your recent notifications
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        notification.read ? 'bg-muted/50' : 'bg-background border-primary/20'
                      }`}
                      onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
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
          </DialogContent>
        </Dialog>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Settings</DialogTitle>
              <DialogDescription>
                Access your account settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Go to the Profile tab for detailed settings and preferences.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowSettings(false)}
              >
                Go to Profile Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      
      </div>
    </div>
  )
}