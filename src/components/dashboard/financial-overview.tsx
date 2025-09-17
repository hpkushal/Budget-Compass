import { createServerComponentClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { getMonthName } from '@/lib/date-utils'
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'

interface FinancialOverviewProps {
  userId: string
}

export async function FinancialOverview({ userId }: FinancialOverviewProps) {
  const supabase = await createServerComponentClient()
  
  // Get last 6 months of data
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  // Monthly spending trends
  const { data: monthlyTrends } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('year', sixMonthsAgo.getFullYear())
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(6)

  // Category spending over time
  const { data: categoryTrends } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('year', sixMonthsAgo.getFullYear())
    .order('total_amount', { ascending: false })

  // Budget vs actual over time
  const { data: budgetHistory } = await supabase
    .from('monthly_budget_overview')
    .select('*')
    .eq('user_id', userId)
    .gte('year', sixMonthsAgo.getFullYear())
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  // Year-to-date summary
  const currentYear = new Date().getFullYear()
  const { data: yearToDate } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('year', currentYear)

  // Calculate trends
  const monthlyData = monthlyTrends || []
  const totalSpentThisMonth = monthlyData[0]?.total_amount || 0
  const totalSpentLastMonth = monthlyData[1]?.total_amount || 0
  const monthlyTrend = totalSpentLastMonth > 0 
    ? ((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth * 100)
    : 0

  const yearToDateTotal = yearToDate?.reduce((sum, month) => sum + month.total_amount, 0) || 0
  const yearToDateBudget = budgetHistory
    ?.filter(b => b.year === currentYear)
    ?.reduce((sum, budget) => sum + budget.budget_amount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Year-to-Date Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year to Date Spending</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(yearToDateTotal, monthlyData[0]?.currency || 'CAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {yearToDate?.length || 0} months of data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
            {monthlyTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyTrend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {monthlyTrend > 0 ? '+' : ''}{monthlyTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {yearToDateBudget > 0 ? 
                ((yearToDateTotal / yearToDateBudget) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              of yearly budget used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="budget-history">Budget History</TabsTrigger>
        </TabsList>

        {/* Monthly Trends */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 6 Months Spending</CardTitle>
              <CardDescription>
                Your monthly spending patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!monthlyData || monthlyData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No spending data available yet. Start logging expenses to see trends.
                </p>
              ) : (
                <div className="space-y-4">
                  {monthlyData.map((month) => {
                    const isCurrentMonth = month.month === new Date().getMonth() + 1 && 
                                         month.year === new Date().getFullYear()
                    return (
                      <div key={`${month.year}-${month.month}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {getMonthName(month.month)} {month.year}
                              {isCurrentMonth && (
                                <Badge variant="secondary" className="text-xs">Current</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {month.expense_count} transactions across {
                                categoryTrends?.filter(c => c.month === month.month && c.year === month.year).length || 0
                              } categories
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            {formatCurrency(month.total_amount, month.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg: {formatCurrency(month.average_amount, month.currency)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Analysis */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>
                Where your money goes across all months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!categoryTrends || categoryTrends.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No category data available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {categoryTrends
                    .reduce((acc, curr) => {
                      const existing = acc.find(item => item.category_name === curr.category_name)
                      if (existing) {
                        existing.total_amount += curr.total_amount
                        existing.expense_count += curr.expense_count
                      } else {
                        acc.push({ ...curr })
                      }
                      return acc
                    }, [] as typeof categoryTrends)
                    .sort((a, b) => b.total_amount - a.total_amount)
                    .slice(0, 8)
                    .map((category) => (
                      <div key={category.category_name} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.category_color }}
                          />
                          <div>
                            <h4 className="font-medium">{category.category_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {category.expense_count} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(category.total_amount, category.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg: {formatCurrency(category.average_amount, category.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget History */}
        <TabsContent value="budget-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Performance History</CardTitle>
              <CardDescription>
                How well you've stuck to your budgets over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!budgetHistory || budgetHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No budget history available yet. Set up budgets to track performance.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    budgetHistory.reduce((acc, budget) => {
                      const key = `${budget.year}-${budget.month}`
                      if (!acc[key]) {
                        acc[key] = {
                          year: budget.year,
                          month: budget.month,
                          totalBudget: 0,
                          totalSpent: 0,
                          categories: 0
                        }
                      }
                      acc[key].totalBudget += budget.budget_amount
                      acc[key].totalSpent += budget.spent_amount
                      acc[key].categories += 1
                      return acc
                    }, {} as Record<string, any>)
                  )
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 6)
                    .map(([key, data]) => {
                      const percentage = data.totalBudget > 0 
                        ? (data.totalSpent / data.totalBudget * 100) 
                        : 0
                      const isOver = percentage > 100
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {getMonthName(data.month)} {data.year}
                              {isOver && (
                                <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {data.categories} categories budgeted
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(data.totalSpent, budgetHistory[0].currency)} / {formatCurrency(data.totalBudget, budgetHistory[0].currency)}
                            </p>
                            <p className={`text-sm ${isOver ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {percentage.toFixed(1)}% of budget
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
