import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, type Currency } from '@/lib/currency'
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'

interface DashboardStatsProps {
  data: {
    total_monthly_budget: number
    total_monthly_spent: number
    total_remaining_budget: number
    overall_percentage_used: number
    categories_with_budget: number
    categories_over_budget: number
    monthly_expense_count: number
  } | null
  currency: Currency
}

export function DashboardStats({ data, currency }: DashboardStatsProps) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const isOverBudget = data.total_monthly_spent > data.total_monthly_budget
  const budgetUsageColor = data.overall_percentage_used >= 80 
    ? 'text-red-600' 
    : data.overall_percentage_used >= 60 
    ? 'text-yellow-600' 
    : 'text-green-600'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Budget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.total_monthly_budget, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.categories_with_budget} categories
          </p>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          {isOverBudget ? (
            <TrendingUp className="h-4 w-4 text-red-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.total_monthly_spent, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.monthly_expense_count} expenses this month
          </p>
        </CardContent>
      </Card>

      {/* Remaining Budget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
            {formatCurrency(data.total_remaining_budget, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {isOverBudget ? 'Over budget' : 'Available to spend'}
          </p>
        </CardContent>
      </Card>

      {/* Budget Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${budgetUsageColor}`}>
            {data.overall_percentage_used.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {data.categories_over_budget > 0 && (
              <Badge variant="destructive" className="text-xs">
                {data.categories_over_budget} over budget
              </Badge>
            )}
            {data.categories_over_budget === 0 && (
              <span>All categories on track</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

