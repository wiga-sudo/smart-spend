import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinancialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  variant?: "default" | "income" | "expense" | "savings" | "debt"
}

const FinancialCard = React.forwardRef<HTMLDivElement, FinancialCardProps>(
  ({ className, title, value, trend, trendValue, icon, variant = "default", ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "income":
          return "border-l-4 border-l-success bg-success-light/20"
        case "expense":
          return "border-l-4 border-l-destructive bg-destructive-light/20"
        case "savings":
          return "border-l-4 border-l-primary bg-primary-light/20"
        case "debt":
          return "border-l-4 border-l-warning bg-warning-light/20"
        default:
          return "hover:shadow-lg transition-shadow"
      }
    }

    const getTrendIcon = () => {
      if (trend === "up") return "↗"
      if (trend === "down") return "↘"
      return "→"
    }

    const getTrendColor = () => {
      if (trend === "up") return "text-success"
      if (trend === "down") return "text-destructive"
      return "text-muted-foreground"
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-300 hover:shadow-md",
          getVariantStyles(),
          className
        )}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && trendValue && (
            <p className={cn("text-xs flex items-center mt-1", getTrendColor())}>
              <span className="mr-1">{getTrendIcon()}</span>
              {trendValue}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }
)
FinancialCard.displayName = "FinancialCard"

export { FinancialCard }