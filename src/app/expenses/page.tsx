import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpensesList } from '@/components/expenses/expenses-list'
import { ExpensesByCategory } from '@/components/expenses/expenses-by-category'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ExpensesPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Expenses
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track and manage your spending
            </p>
          </div>
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="by-category" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="chronological">Chronological</TabsTrigger>
          </TabsList>

          <TabsContent value="by-category" className="space-y-4">
            <ExpensesByCategory userId={user.id} limit={200} />
          </TabsContent>

          <TabsContent value="chronological" className="space-y-4">
            <ExpensesList userId={user.id} limit={100} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

