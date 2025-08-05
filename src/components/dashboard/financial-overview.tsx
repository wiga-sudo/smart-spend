import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react"
import { FinancialCard } from "@/components/ui/financial-card"

export function FinancialOverview() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <FinancialCard
        title="Total Balance"
        value="$12,450"
        trend="up"
        trendValue="+2.5% from last month"
        icon={<DollarSign className="h-4 w-4" />}
        variant="income"
      />
      <FinancialCard
        title="Monthly Expenses"
        value="$3,240"
        trend="down"
        trendValue="-5.2% from last month"
        icon={<TrendingDown className="h-4 w-4" />}
        variant="expense"
      />
      <FinancialCard
        title="Savings Goal"
        value="$8,500"
        trend="up"
        trendValue="68% completed"
        icon={<Target className="h-4 w-4" />}
        variant="savings"
      />
      <FinancialCard
        title="Budget Left"
        value="$1,260"
        trend="neutral"
        trendValue="38% remaining"
        icon={<TrendingUp className="h-4 w-4" />}
        variant="default"
      />
    </div>
  )
}