import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createServerComponentClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/currency'
import { getCurrentMonth, getCurrentYear } from '@/lib/date-utils'
import { Eye } from 'lucide-react'
import Link from 'next/link'

interface BudgetOverviewProps {
  userId: string
}

export async function BudgetOverview({ userId }: BudgetOverviewProps) {
  const supabase = await createServerComponentClient()
  
  const { data: budgetOverview } = await supabase
    .from('monthly_budget_overview')
    .select('*')
    .eq('user_id', userId)
    .eq('month', getCurrentMonth())
    .eq('year', getCurrentYear())
    .order('percentage_used', { ascending: false })

  if (!budgetOverview || budgetOverview.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              No budgets set for this month
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/expenses">
              <Eye className="w-4 h-4 mr-2" />
              View All Expenses
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set up your monthly budgets to track your spending progress.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            Your spending progress for this month
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/expenses">
            <Eye className="w-4 h-4 mr-2" />
            View All Expenses
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgetOverview.map((budget) => {
          const progressValue = Math.min(budget.percentage_used, 100)
          const isOverBudget = budget.is_over_budget
          const isNearLimit = budget.percentage_used >= 80 && !isOverBudget
          
          return (
            <div key={budget.category_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: budget.category_color }}
                  />
                  <span className="font-medium">{budget.category_name}</span>
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
                <div className="text-right text-sm">
                  <div className="font-medium">
                    {formatCurrency(budget.spent_amount, budget.currency)}
                  </div>
                  <div className="text-muted-foreground">
                    of {formatCurrency(budget.budget_amount, budget.currency)}
                  </div>
                </div>
              </div>
              
              <Progress 
                value={progressValue} 
                className="h-2"
                style={{
                  '--progress-background': isOverBudget 
                    ? 'hsl(var(--destructive))' 
                    : isNearLimit 
                    ? 'hsl(var(--warning))' 
                    : 'hsl(var(--primary))'
                } as React.CSSProperties}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budget.percentage_used.toFixed(1)}% used</span>
                <span>
                  {formatCurrency(budget.remaining_amount, budget.currency)} remaining
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

