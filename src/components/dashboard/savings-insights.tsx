import { Target, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinancialStore } from "@/store/financial-store"
import { differenceInDays, format } from "date-fns"

export function SavingsInsights() {
  const { goals, getTotalIncome, getTotalExpenses } = useFinancialStore()
  
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const monthlySavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0

  // Calculate insights for active goals
  const activeGoals = goals.slice(0, 3) // Show top 3 goals
  
  const goalInsights = activeGoals.map(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const remaining = goal.targetAmount - goal.currentAmount
    const daysUntilDeadline = differenceInDays(new Date(goal.deadline), new Date())
    
    // Calculate required monthly savings to reach goal
    const monthsLeft = Math.max(1, Math.ceil(daysUntilDeadline / 30))
    const requiredMonthlySaving = remaining / monthsLeft

    let status: 'on-track' | 'behind' | 'ahead' | 'completed' = 'on-track'
    if (progress >= 100) status = 'completed'
    else if (monthlySavings >= requiredMonthlySaving) status = 'ahead'
    else if (monthlySavings < requiredMonthlySaving * 0.8) status = 'behind'

    return {
      ...goal,
      progress: Math.min(progress, 100),
      remaining,
      daysUntilDeadline,
      monthsLeft,
      requiredMonthlySaving,
      status
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success'
      case 'ahead': return 'text-success'
      case 'behind': return 'text-destructive'
      default: return 'text-primary'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success'
      case 'ahead': return 'bg-success'
      case 'behind': return 'bg-destructive'
      default: return 'bg-primary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Savings Insights
        </CardTitle>
        <CardDescription>
          Track your progress toward financial goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Savings Rate */}
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="font-medium text-sm">Monthly Savings Rate</span>
            </div>
            <span className={`font-bold KshsavingsRate > 20 ? 'text-success' : savingsRate > 10 ? 'text-warning' : 'text-destructive'}`}>
              {savingsRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(savingsRate, 100)} 
            className="h-2"/>
          <p className="text-xs text-muted-foreground mt-1">
            Saving KshmonthlySavings.toFixed(2)} of KshtotalIncome.toFixed(2)} monthly income
          </p>
        </div>

        {/* Individual Goals */}
        <div className="space-y-3">
          {goalInsights.map((goal) => (
            <div key={goal.id} className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{goal.name}</span>
                <span className={`text-sm font-semibold KshgetStatusColor(goal.status)}`}>
                  {goal.progress.toFixed(0)}%
                </span>
              </div>
              
              <Progress 
                value={goal.progress} 
                className="h-2 mb-2"
              />
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Kshgoal.currentAmount.toFixed(2)} / Kshgoal.targetAmount.toFixed(2)}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {goal.daysUntilDeadline > 0 ? `Kshgoal.daysUntilDeadline} days left` : 'Overdue'}
                  </span>
                </div>
                
                {goal.status !== 'completed' && (
                  <p className={`text-xs KshgetStatusColor(goal.status)}`}>
                    {goal.status === 'ahead' && `Great! You're ahead of schedule`}
                    {goal.status === 'on-track' && `Need $Kshgoal.requiredMonthlySaving.toFixed(2)}/month to reach goal`}
                    {goal.status === 'behind' && `Behind schedule - need $Kshgoal.requiredMonthlySaving.toFixed(2)}/month`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No savings goals yet</p>
            <p className="text-xs">Set goals to track your progress</p>
          </div>
        )}

        {/* Savings Tips */}
        {savingsRate < 20 && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-primary">Savings Tip</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Try to save at least 20% of your income. Consider reviewing your expenses to find areas to cut back.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}