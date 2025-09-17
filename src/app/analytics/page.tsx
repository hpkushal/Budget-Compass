import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { getMonthName } from '@/lib/date-utils'
import { ArrowLeft, TrendingUp, TrendingDown, Target, Calendar, Download } from 'lucide-react'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get comprehensive data for analytics
  const currentYear = new Date().getFullYear()
  const lastYear = currentYear - 1
  
  // Year-over-year comparison
  const { data: thisYearData } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', currentYear)

  const { data: lastYearData } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', lastYear)

  // All-time category breakdown
  const { data: allTimeCategories } = await supabase
    .from('monthly_expense_summary')
    .select('*')
    .eq('user_id', user.id)
    .order('total_amount', { ascending: false })

  // Budget performance over time
  const { data: budgetPerformance } = await supabase
    .from('monthly_budget_overview')
    .select('*')
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)

  // Calculate insights
  const thisYearTotal = (thisYearData as any[] || []).reduce((sum: number, month: any) => sum + (month.total_amount || 0), 0)
  const lastYearTotal = (lastYearData as any[] || []).reduce((sum: number, month: any) => sum + (month.total_amount || 0), 0)
  const yearOverYearChange = lastYearTotal > 0 ? ((thisYearTotal - lastYearTotal) / lastYearTotal * 100) : 0

  // Category insights
  const categoryTotals = (allTimeCategories as any[] || []).reduce((acc: any[], curr: any) => {
    const existing = acc.find((item: any) => item.category_name === curr.category_name)
    if (existing) {
      existing.total_amount += curr.total_amount
      existing.expense_count += curr.expense_count
    } else {
      acc.push({ ...curr })
    }
    return acc
  }, [] as any[])

  const topCategory = categoryTotals.sort((a: any, b: any) => b.total_amount - a.total_amount)[0]
  const totalAllTime = categoryTotals.reduce((sum: number, cat: any) => sum + cat.total_amount, 0)

  // Budget insights
  const budgetStats = (budgetPerformance as any[] || []).reduce((acc: any, budget: any) => {
    acc.totalBudgeted += budget.budget_amount || 0
    acc.totalSpent += budget.spent_amount || 0
    acc.monthsTracked += 1
    if (budget.is_over_budget) acc.monthsOverBudget += 1
    return acc
  }, { totalBudgeted: 0, totalSpent: 0, monthsTracked: 0, monthsOverBudget: 0 })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Deep insights into your spending patterns and financial health
            </p>
          </div>
          <Button asChild>
            <Link href="/reports">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Link>
          </Button>
        </div>

        {/* Key Insights Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Year-over-Year</CardTitle>
              {yearOverYearChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${yearOverYearChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {yearOverYearChange > 0 ? '+' : ''}{yearOverYearChange.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs {lastYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {topCategory?.category_name || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {topCategory ? `${((topCategory.total_amount / totalAllTime) * 100).toFixed(1)}% of spending` : 'No data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Accuracy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {budgetStats?.totalBudgeted > 0 
                  ? ((budgetStats.totalSpent / budgetStats.totalBudgeted) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                of budgets used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Discipline</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {budgetStats?.monthsTracked > 0 
                  ? (((budgetStats.monthsTracked - budgetStats.monthsOverBudget) / budgetStats.monthsTracked) * 100).toFixed(0)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                months on budget
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="yearly" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="yearly">Yearly Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Deep Dive</TabsTrigger>
            <TabsTrigger value="budget-analysis">Budget Analysis</TabsTrigger>
            <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          </TabsList>

          {/* Yearly Trends */}
          <TabsContent value="yearly" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{currentYear} Monthly Breakdown</CardTitle>
                  <CardDescription>Your spending by month this year</CardDescription>
                </CardHeader>
                <CardContent>
                  {!thisYearData || thisYearData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No data for {currentYear} yet</p>
                  ) : (
                    <div className="space-y-3">
                      {(thisYearData as any[] || [])
                        .sort((a: any, b: any) => b.month - a.month)
                        .map((month: any) => (
                          <div key={month.month} className="flex justify-between items-center p-3 border rounded">
                            <span className="font-medium">{getMonthName(month.month)}</span>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(month.total_amount, month.currency)}</p>
                              <p className="text-xs text-muted-foreground">{month.expense_count} transactions</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{lastYear} Comparison</CardTitle>
                  <CardDescription>Last year's spending for comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  {!lastYearData || lastYearData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No data for {lastYear}</p>
                  ) : (
                    <div className="space-y-3">
                      {(lastYearData as any[] || [])
                        .sort((a: any, b: any) => b.month - a.month)
                        .map((month: any) => (
                          <div key={month.month} className="flex justify-between items-center p-3 border rounded">
                            <span className="font-medium">{getMonthName(month.month)}</span>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(month.total_amount, month.currency)}</p>
                              <p className="text-xs text-muted-foreground">{month.expense_count} transactions</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Category Deep Dive */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All-Time Category Performance</CardTitle>
                <CardDescription>Complete breakdown of spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryTotals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No category data available</p>
                ) : (
                  <div className="space-y-4">
                    {categoryTotals
                      .sort((a: any, b: any) => b.total_amount - a.total_amount)
                      .map((category: any) => {
                        const percentage = totalAllTime > 0 ? (category.total_amount / totalAllTime * 100) : 0
                        return (
                          <div key={category.category_name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.category_color }}
                                />
                                <div>
                                  <h4 className="font-medium">{category.category_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {category.expense_count} transactions • Avg: {formatCurrency(category.average_amount, category.currency)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(category.total_amount, category.currency)}</p>
                                <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{ 
                                  backgroundColor: category.category_color,
                                  width: `${percentage}%`
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Analysis */}
          <TabsContent value="budget-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance Over Time</CardTitle>
                <CardDescription>How well you've managed your budgets</CardDescription>
              </CardHeader>
              <CardContent>
                {!budgetPerformance || budgetPerformance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No budget data available</p>
                ) : (
                  <div className="space-y-4">
                    {(budgetPerformance as any[] || []).map((budget: any) => (
                      <div key={`${budget.year}-${budget.month}-${budget.category_id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: budget.category_color }}
                          />
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {budget.category_name}
                              {budget.is_over_budget && (
                                <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {getMonthName(budget.month)} {budget.year}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(budget.spent_amount, budget.currency)} / {formatCurrency(budget.budget_amount, budget.currency)}
                          </p>
                          <p className={`text-sm ${budget.is_over_budget ? 'text-red-600' : budget.percentage_used > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {budget.percentage_used.toFixed(1)}% used
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Insights */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health Score</CardTitle>
                  <CardDescription>Based on your spending and budget patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {budgetStats?.monthsTracked > 0 
                        ? Math.round(((budgetStats.monthsTracked - budgetStats.monthsOverBudget) / budgetStats.monthsTracked) * 100)
                        : 85}
                    </div>
                    <p className="text-muted-foreground">Health Score</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>✅ Regular expense tracking</p>
                      <p>✅ Budget planning active</p>
                      {budgetStats && budgetStats.monthsOverBudget < budgetStats.monthsTracked / 2 && (
                        <p>✅ Good budget discipline</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Personalized tips to improve your finances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {topCategory && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium">💡 Top Spending Category</p>
                        <p className="text-muted-foreground">
                          {topCategory.category_name} accounts for {((topCategory.total_amount / totalAllTime) * 100).toFixed(1)}% of your spending. 
                          Consider setting a stricter budget for this category.
                        </p>
                      </div>
                    )}
                    
                    {yearOverYearChange > 20 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium">⚠️ Spending Increase</p>
                        <p className="text-muted-foreground">
                          Your spending has increased by {yearOverYearChange.toFixed(1)}% compared to last year. 
                          Review your budget allocations.
                        </p>
                      </div>
                    )}

                    {budgetStats && budgetStats.monthsOverBudget > budgetStats.monthsTracked / 2 && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="font-medium">🎯 Budget Discipline</p>
                        <p className="text-muted-foreground">
                          You've exceeded budgets in {budgetStats.monthsOverBudget} out of {budgetStats.monthsTracked} months. 
                          Consider more realistic budget amounts.
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium">🎉 Keep It Up!</p>
                      <p className="text-muted-foreground">
                        You're actively tracking expenses and managing budgets. This puts you ahead of most people financially.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
