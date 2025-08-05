import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useFinancialStore } from "@/store/financial-store"

export function RecentTransactions() {
  const { transactions, deleteTransaction } = useFinancialStore()
  
  // Get the 5 most recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleDelete = (id: string) => {
    deleteTransaction(id)
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="mx-4 mb-4">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No transactions yet. Add your first transaction!
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="mx-4 mb-4">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.map((transaction) => (
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
                  {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`font-semibold ${
                transaction.type === 'income' 
                  ? 'text-success' 
                  : 'text-destructive'
              }`}>
                {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDelete(transaction.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}