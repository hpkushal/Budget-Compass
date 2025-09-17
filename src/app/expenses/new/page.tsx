import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AddExpenseForm } from '@/components/expenses/add-expense-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewExpensePage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .eq('user_id', user.id)
    .order('name')

  // Get user settings for currency
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('currency')
    .eq('user_id', user.id)
    .single()

  if (!categories || categories.length === 0) {
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
                Add Expense
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Record a new expense
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="text-center py-12">
              <p className="text-lg font-medium mb-2">No Categories Found</p>
              <p className="text-muted-foreground mb-6">
                You need categories to track expenses. Please contact support if this issue persists.
              </p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
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
              Add Expense
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Record a new expense
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <AddExpenseForm 
            categories={categories}
            userCurrency={(userSettings as any)?.currency || 'CAD'}
          />
        </div>
      </div>
    </div>
  )
}

