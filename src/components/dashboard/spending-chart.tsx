import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from '@/components/ui/chart-container'
import { useFinancialStore } from '@/store/financial-store'

const monthlyData = [
  { month: 'Jan', income: 400000, expenses: 240000 },
  { month: 'Feb', income: 420000, expenses: 280000 },
  { month: 'Mar', income: 410000, expenses: 260000 },
  { month: 'Apr', income: 430000, expenses: 290000 },
  { month: 'May', income: 415000, expenses: 265000 },
  { month: 'Jun', income: 440000, expenses: 310000 },
]

interface SpendingChartProps {
  variant?: 'pie' | 'bar'
}

export function SpendingChart({ variant = 'pie' }: SpendingChartProps) {
  const { getSpendingByCategory } = useFinancialStore()
  
  // Convert spending data to chart format
  const spendingByCategory = getSpendingByCategory()
  const spendingData = Object.entries(spendingByCategory).map(([category, amount], index) => {
    const colors = [
      'hsl(var(--expense-color))',
      'hsl(var(--primary))',
      'hsl(var(--warning))',
      'hsl(var(--accent))',
      'hsl(var(--destructive))'
    ]
    return {
      name: category,
      value: amount,
      color: colors[index % colors.length]
    }
  })
  if (variant === 'bar') {
    return (
      <ChartContainer 
        title="Income vs Expenses" 
        description="Monthly comparison over time"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--success))" name="Income" />
            <Bar dataKey="expenses" fill="hsl(var(--expense-color))" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer 
      title="Spending Breakdown" 
      description="Your expenses by category this month"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={spendingData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {spendingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}