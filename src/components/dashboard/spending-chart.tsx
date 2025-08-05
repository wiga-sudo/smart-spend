import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from '@/components/ui/chart-container'

const spendingData = [
  { name: 'Food', value: 400, color: 'hsl(var(--expense-color))' },
  { name: 'Transport', value: 300, color: 'hsl(var(--primary))' },
  { name: 'Entertainment', value: 200, color: 'hsl(var(--warning))' },
  { name: 'Shopping', value: 150, color: 'hsl(var(--accent))' },
  { name: 'Bills', value: 600, color: 'hsl(var(--destructive))' },
]

const monthlyData = [
  { month: 'Jan', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 4200, expenses: 2800 },
  { month: 'Mar', income: 4100, expenses: 2600 },
  { month: 'Apr', income: 4300, expenses: 2900 },
  { month: 'May', income: 4150, expenses: 2650 },
  { month: 'Jun', income: 4400, expenses: 3100 },
]

interface SpendingChartProps {
  variant?: 'pie' | 'bar'
}

export function SpendingChart({ variant = 'pie' }: SpendingChartProps) {
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