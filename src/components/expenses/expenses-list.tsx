import { createServerComponentClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency'
import { formatDateInTimezone } from '@/lib/date-utils'
import { Edit, Trash2, Calendar } from 'lucide-react'

interface ExpensesListProps {
  userId: string
  limit?: number
  showHeader?: boolean
}

export async function ExpensesList({ userId, limit = 50, showHeader = true }: ExpensesListProps) {
  const supabase = await createServerComponentClient()
  
  // Get recent expenses with category information
  const { data: expenses } = await supabase
    .rpc('get_recent_expenses', {
      p_user_id: userId,
      p_limit: limit
    })

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              Your expense history
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No expenses yet</p>
            <p className="text-muted-foreground mb-4">
              Start tracking your spending by adding your first expense.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Your latest {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: expense.category_color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {expense.description || expense.category_name}
                    </h3>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {expense.category_name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDateInTimezone(expense.expense_date, 'MMM dd, yyyy')}</span>
                    {expense.description && expense.description !== expense.category_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{expense.category_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateInTimezone(expense.created_at, 'HH:mm')}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Total ({expenses.length} expense{expenses.length !== 1 ? 's' : ''}):
            </span>
            <span className="font-medium">
              {formatCurrency(
                expenses.reduce((sum, expense) => sum + expense.amount, 0),
                expenses[0]?.currency || 'CAD'
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
