import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Menu } from 'lucide-react';
import { useFinancialStore } from '@/store/financial-store';
import { toast } from 'sonner';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function AppHeader({ title = "SmartSpend", subtitle, onMenuClick }: AppHeaderProps) {
  const { exportData, importData } = useFinancialStore();
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);

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
      setIsImportDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to import ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Data</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="budgets">Budgets</TabsTrigger>
                  <TabsTrigger value="all">All Data</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions" className="space-y-4">
                  <div>
                    <Label htmlFor="transactions-file">Upload CSV file</Label>
                    <Input
                      id="transactions-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleImport(e, 'transactions')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      CSV format: description, amount, category, date, type
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="budgets" className="space-y-4">
                  <div>
                    <Label htmlFor="budgets-file">Upload CSV file</Label>
                    <Input
                      id="budgets-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleImport(e, 'budgets')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      CSV format: category, budgeted, month
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="all" className="space-y-4">
                  <div>
                    <Label htmlFor="all-file">Upload JSON backup file</Label>
                    <Input
                      id="all-file"
                      type="file"
                      accept=".json"
                      onChange={(e) => handleImport(e, 'all')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JSON backup file from previous export
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('all')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}