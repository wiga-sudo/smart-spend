import { FinancialOverview } from "./financial-overview"
import { SpendingChart } from "./spending-chart"
import { RecentTransactions } from "./recent-transactions"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DashboardView() {
  return (
    <ScrollArea className="h-full">
      <div className="pb-20"> {/* Bottom padding for mobile nav */}
        <FinancialOverview />
        
        <div className="p-4 space-y-4">
          <SpendingChart variant="pie" />
          <SpendingChart variant="bar" />
        </div>

        <RecentTransactions />
      </div>
    </ScrollArea>
  )
}