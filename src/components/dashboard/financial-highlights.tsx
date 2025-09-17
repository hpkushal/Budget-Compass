import { createServerComponentClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { getMonthName } from '@/lib/date-utils'
import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react'

interface FinancialHighlightsProps {
  userId: string
}

export async function FinancialHighlights({ userId }: FinancialHighlightsProps) {
  const supabase = await createServerComponentClient()
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

  // Get current and last month data
  const { data: currentMonthData } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('year', currentYear)

  const { data: lastMonthData } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('month', lastMonth)
    .eq('year', lastMonthYear)

  // Get top category this month
  const topCategoryThisMonth = currentMonthData?.reduce((prev, current) => 
    (prev.total_amount > current.total_amount) ? prev : current
  )

  // Calculate month-over-month change
  const currentTotal = currentMonthData?.reduce((sum, cat) => sum + cat.total_amount, 0) || 0
  const lastTotal = lastMonthData?.reduce((sum, cat) => sum + cat.total_amount, 0) || 0
  const monthChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100) : 0

  // Get budget performance for current month
  const { data: budgetPerformance } = await supabase
    .from('monthly_budget_overview')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('year', currentYear)

  const budgetStats = budgetPerformance?.reduce((acc, budget) => {
    acc.totalBudget += budget.budget_amount
    acc.totalSpent += budget.spent_amount
    if (budget.is_over_budget) acc.overBudgetCategories += 1
    if (budget.percentage_used >= 80) acc.nearLimitCategories += 1
    return acc
  }, { totalBudget: 0, totalSpent: 0, overBudgetCategories: 0, nearLimitCategories: 0 })

  const budgetUsagePercentage = budgetStats?.totalBudget > 0 
    ? (budgetStats.totalSpent / budgetStats.totalBudget * 100) 
    : 0

  if (!currentMonthData || currentMonthData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Highlights</CardTitle>
          <CardDescription>Key insights for {getMonthName(currentMonth)} {currentYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Add some expenses to see your financial highlights!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Highlights</CardTitle>
        <CardDescription>Key insights for {getMonthName(currentMonth)} {currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month-over-month trend */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {monthChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="font-medium">Monthly Trend</p>
                <p className="text-sm text-muted-foreground">vs last month</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${monthChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {monthChange > 0 ? '+' : ''}{monthChange.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(Math.abs(currentTotal - lastTotal), topCategoryThisMonth?.currency || 'CAD')}
              </p>
            </div>
          </div>

          {/* Top spending category */}
          {topCategoryThisMonth && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Top Category</p>
                  <p className="text-sm text-muted-foreground">{topCategoryThisMonth.category_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  {formatCurrency(topCategoryThisMonth.total_amount, topCategoryThisMonth.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((topCategoryThisMonth.total_amount / currentTotal) * 100).toFixed(1)}% of spending
                </p>
              </div>
            </div>
          )}

          {/* Budget performance */}
          {budgetStats && budgetStats.totalBudget > 0 && (
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              budgetStats.overBudgetCategories > 0 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : budgetStats.nearLimitCategories > 0 
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${
                  budgetStats.overBudgetCategories > 0 
                    ? 'text-red-600' 
                    : budgetStats.nearLimitCategories > 0 
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`} />
                <div>
                  <p className="font-medium">Budget Status</p>
                  <p className="text-sm text-muted-foreground">
                    {budgetStats.overBudgetCategories > 0 
                      ? `${budgetStats.overBudgetCategories} over budget`
                      : budgetStats.nearLimitCategories > 0 
                      ? `${budgetStats.nearLimitCategories} near limit`
                      : 'All on track'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  budgetUsagePercentage > 100 
                    ? 'text-red-600' 
                    : budgetUsagePercentage > 80 
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {budgetUsagePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(budgetStats.totalSpent, topCategoryThisMonth?.currency || 'CAD')} used
                </p>
              </div>
            </div>
          )}

          {/* Activity summary */}
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div>
              <p className="font-medium">This Month's Activity</p>
              <div className="flex gap-4 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {currentMonthData.reduce((sum, cat) => sum + cat.expense_count, 0)} transactions
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {currentMonthData.length} categories
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-600">
                {formatCurrency(currentTotal, topCategoryThisMonth?.currency || 'CAD')}
              </p>
              <p className="text-sm text-muted-foreground">total spent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
