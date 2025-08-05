import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

const transactions = [
  {
    id: 1,
    description: "Grocery Store",
    amount: -85.50,
    category: "Food",
    date: new Date(2024, 7, 3),
    type: "expense" as const
  },
  {
    id: 2,
    description: "Salary Deposit",
    amount: 4200,
    category: "Income",
    date: new Date(2024, 7, 1),
    type: "income" as const
  },
  {
    id: 3,
    description: "Gas Station",
    amount: -45.20,
    category: "Transport",
    date: new Date(2024, 7, 2),
    type: "expense" as const
  },
  {
    id: 4,
    description: "Coffee Shop",
    amount: -12.50,
    category: "Food",
    date: new Date(2024, 7, 3),
    type: "expense" as const
  },
  {
    id: 5,
    description: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    date: new Date(2024, 6, 30),
    type: "expense" as const
  }
]

export function RecentTransactions() {
  return (
    <Card className="mx-4 mb-4">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex-1">
              <p className="font-medium text-sm">{transaction.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={transaction.type === 'income' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {transaction.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(transaction.date, { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className={`font-semibold ${
              transaction.type === 'income' 
                ? 'text-success' 
                : 'text-destructive'
            }`}>
              {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}