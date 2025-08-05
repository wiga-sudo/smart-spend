import { FinancialOverview } from "./financial-overview"
import { SpendingChart } from "./spending-chart"
import { RecentTransactions } from "./recent-transactions"
import { QuickActions } from "./quick-actions"
import { BudgetAlerts } from "./budget-alerts"
import { SavingsInsights } from "./savings-insights"
import { FinancialTrends } from "./financial-trends"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DashboardView() {
  return (
    <ScrollArea className="h-full">
      <div className="pb-20"> {/* Bottom padding for mobile nav */}
        <FinancialOverview />
        
        <div className="p-4 space-y-4">
          <QuickActions />
          
          <div className="grid gap-4 md:grid-cols-2">
            <BudgetAlerts />
            <SavingsInsights />
          </div>
          
          <FinancialTrends />
          
          <div className="space-y-4">
            <SpendingChart variant="pie" />
            <SpendingChart variant="bar" />
          </div>
        </div>

        <RecentTransactions />
      </div>
    </ScrollArea>
  )
}