import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BudgetForm } from '@/components/budgets/budget-form'
import { formatCurrency } from '@/lib/currency'
import { getCurrentMonth, getCurrentYear, getMonthName } from '@/lib/date-utils'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'

export default async function BudgetsPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()

  // Get user categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .eq('user_id', user.id)
    .order('name')

  // Get existing budgets for current month
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .order('created_at', { ascending: false })

  // Get budget overview with spending data
  const { data: budgetOverview } = await supabase
    .from('monthly_budget_overview')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .order('percentage_used', { ascending: false })

  // Get user settings
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('currency')
    .eq('user_id', user.id)
    .single()

  if (!categories) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-lg font-medium mb-2">No Categories Found</p>
            <p className="text-muted-foreground mb-6">
              You need categories to set budgets. Please contact support.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Budget Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Set and manage your monthly budgets for {getMonthName(currentMonth)} {currentYear}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Budget Form */}
          <div className="lg:col-span-1">
            <BudgetForm 
              categories={categories}
              existingBudgets={budgets || []}
              userCurrency={(userSettings as any)?.currency || 'CAD'}
              selectedMonth={currentMonth}
              selectedYear={currentYear}
            />
          </div>

          {/* Existing Budgets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Budgets</CardTitle>
                <CardDescription>
                  Your budgets for {getMonthName(currentMonth)} {currentYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!budgetOverview || budgetOverview.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No budgets set for this month yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use the form on the left to add your first budget.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(budgetOverview as any[] || []).map((budget: any) => {
                      const isOverBudget = budget.is_over_budget
                      const isNearLimit = budget.percentage_used >= 80 && !isOverBudget
                      
                      return (
                        <div
                          key={budget.category_id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: budget.category_color }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{budget.category_name}</h3>
                                {isOverBudget && (
                                  <Badge variant="destructive" className="text-xs">
                                    Over Budget
                                  </Badge>
                                )}
                                {isNearLimit && (
                                  <Badge variant="secondary" className="text-xs">
                                    Near Limit
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(budget.spent_amount, budget.currency)} spent of{' '}
                                {formatCurrency(budget.budget_amount, budget.currency)} budget
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-medium">
                                {budget.percentage_used.toFixed(1)}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(budget.remaining_amount, budget.currency)} left
                              </p>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Summary */}
                    <div className="border-t pt-4 mt-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Total Monthly Budget:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            (budgetOverview as any[] || []).reduce((sum: number, b: any) => sum + b.budget_amount, 0),
                            (userSettings as any)?.currency || 'CAD'
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(
                            (budgetOverview as any[] || []).reduce((sum: number, b: any) => sum + b.spent_amount, 0),
                            (userSettings as any)?.currency || 'CAD'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
