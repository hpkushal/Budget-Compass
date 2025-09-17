import { createServerComponentClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/currency'
import { formatDateInTimezone } from '@/lib/date-utils'
import { Edit, Trash2, Filter } from 'lucide-react'

interface ExpensesByCategoryProps {
  userId: string
  selectedCategoryId?: string
  limit?: number
  showHeader?: boolean
}

export async function ExpensesByCategory({ 
  userId, 
  selectedCategoryId, 
  limit = 50, 
  showHeader = true 
}: ExpensesByCategoryProps) {
  const supabase = await createServerComponentClient()
  
  // Get all categories for the filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .eq('user_id', userId)
    .order('name')

  // Build the query for expenses
  let expensesQuery = supabase
    .from('expenses')
    .select(`
      id,
      amount,
      currency,
      description,
      expense_date,
      created_at,
      categories!inner (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  // Apply category filter if specified
  if (selectedCategoryId) {
    expensesQuery = expensesQuery.eq('category_id', selectedCategoryId)
  }

  const { data: expenses } = await expensesQuery

  // Group expenses by category
  const expensesByCategory = expenses?.reduce((acc, expense) => {
    const categoryName = expense.categories.name
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: expense.categories,
        expenses: [],
        total: 0
      }
    }
    acc[categoryName].expenses.push(expense)
    acc[categoryName].total += expense.amount
    return acc
  }, {} as Record<string, any>) || {}

  // Sort categories by total spending
  const sortedCategories = Object.values(expensesByCategory)
    .sort((a: any, b: any) => b.total - a.total)

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              {selectedCategoryId ? 'Filtered expenses' : 'Your expenses grouped by category'}
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg font-medium mb-2">No expenses found</p>
            <p className="text-muted-foreground mb-4">
              {selectedCategoryId ? 'No expenses in this category yet.' : 'Start tracking your spending by adding your first expense.'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {showHeader && categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Expenses by Category</span>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Select value={selectedCategoryId || 'all'}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedCategoryId 
                ? `Showing expenses for ${categories.find(c => c.id === selectedCategoryId)?.name}`
                : `${expenses.length} expenses across ${Object.keys(expensesByCategory).length} categories`
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Expenses grouped by category */}
      {sortedCategories.map((categoryGroup: any) => (
        <Card key={categoryGroup.category.name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: categoryGroup.category.color }}
                />
                <span>{categoryGroup.category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryGroup.expenses.length} expenses
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatCurrency(categoryGroup.total, categoryGroup.expenses[0].currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg: {formatCurrency(categoryGroup.total / categoryGroup.expenses.length, categoryGroup.expenses[0].currency)}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryGroup.expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {expense.description || 'No description'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDateInTimezone(expense.expense_date, 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>{formatDateInTimezone(expense.created_at, 'HH:mm')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
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

            {/* Category Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Category Total ({categoryGroup.expenses.length} transaction{categoryGroup.expenses.length !== 1 ? 's' : ''}):
                </span>
                <span className="font-medium">
                  {formatCurrency(categoryGroup.total, categoryGroup.expenses[0].currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Overall Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Total ({expenses.length} expense{expenses.length !== 1 ? 's' : ''}):
            </span>
            <span className="font-bold text-lg">
              {formatCurrency(
                expenses.reduce((sum, expense) => sum + expense.amount, 0),
                expenses[0]?.currency || 'CAD'
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
