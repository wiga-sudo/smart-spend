import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Download, Upload, User, Settings, Bell, Shield, Trash2 } from 'lucide-react';
import { useFinancialStore } from '@/store/financial-store';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function ProfileView() {
  const { user, signOut } = useAuth();
  const { exportData, importData, clearAllData } = useFinancialStore();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleExport = (type: 'transactions' | 'budgets' | 'all') => {
    try {
      exportData(type);
      toast.success(`${type === 'all' ? 'All data' : type} exported successfully`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, type: 'transactions' | 'budgets' | 'all') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importData(file, type);
      toast.success(`${type === 'all' ? 'All data' : type} imported successfully`);
    } catch (error) {
      toast.error(`Failed to import ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      toast.success('All data cleared successfully');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{user?.email || 'Guest User'}</h3>
              <Badge variant="secondary">Free Plan</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="joined">Member Since</Label>
              <Input
                id="joined"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="export-transactions">Export Transactions</Label>
              <Button
                id="export-transactions"
                variant="outline"
                className="w-full mt-2"
                onClick={() => handleExport('transactions')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div>
              <Label htmlFor="export-budgets">Export Budgets</Label>
              <Button
                id="export-budgets"
                variant="outline"
                className="w-full mt-2"
                onClick={() => handleExport('budgets')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div>
              <Label htmlFor="export-all">Export All Data</Label>
              <Button
                id="export-all"
                variant="outline"
                className="w-full mt-2"
                onClick={() => handleExport('all')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="import-transactions">Import Transactions</Label>
              <Input
                id="import-transactions"
                type="file"
                accept=".csv"
                className="mt-2"
                onChange={(e) => handleImport(e, 'transactions')}
              />
              <p className="text-xs text-gray-500 mt-1">CSV format: description, amount, category, date, type</p>
            </div>
            <div>
              <Label htmlFor="import-budgets">Import Budgets</Label>
              <Input
                id="import-budgets"
                type="file"
                accept=".csv"
                className="mt-2"
                onChange={(e) => handleImport(e, 'budgets')}
              />
              <p className="text-xs text-gray-500 mt-1">CSV format: category, budgeted, month</p>
            </div>
            <div>
              <Label htmlFor="import-all">Import All Data</Label>
              <Input
                id="import-all"
                type="file"
                accept=".json"
                className="mt-2"
                onChange={(e) => handleImport(e, 'all')}
              />
              <p className="text-xs text-gray-500 mt-1">JSON backup file</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Clearing data will permanently delete all transactions, budgets, and goals. This action cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}