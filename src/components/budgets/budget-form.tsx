'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClientComponentClient } from '@/lib/supabase'
import { budgetFormSchema, type BudgetFormData, parseCurrencyAmount } from '@/lib/validations'
import { CURRENCY_SYMBOLS, type Currency } from '@/lib/currency'
import { getCurrentMonth, getCurrentYear, getMonthName } from '@/lib/date-utils'

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

interface Budget {
  id: string
  category_id: string
  amount: number
  currency: Currency
  month: number
  year: number
}

interface BudgetFormProps {
  categories: Category[]
  existingBudgets: Budget[]
  userCurrency: Currency
  selectedMonth?: number
  selectedYear?: number
}

export function BudgetForm({ 
  categories, 
  existingBudgets, 
  userCurrency,
  selectedMonth = getCurrentMonth(),
  selectedYear = getCurrentYear()
}: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Get available categories (those without budgets for the selected month/year)
  const availableCategories = categories.filter(category => 
    !existingBudgets.some(budget => 
      budget.category_id === category.id && 
      budget.month === selectedMonth && 
      budget.year === selectedYear
    )
  )

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category_id: '',
      amount: '',
      currency: userCurrency,
      month: selectedMonth,
      year: selectedYear,
    },
  })

  async function onSubmit(data: BudgetFormData) {
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Authentication required')
        router.push('/auth/login')
        return
      }

      // Parse the amount from string to number
      const parsedAmount = parseCurrencyAmount(data.amount)
      
      if (parsedAmount < 0) {
        toast.error('Budget amount cannot be negative')
        return
      }

      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: data.category_id,
          amount: parsedAmount,
          currency: data.currency,
          month: data.month,
          year: data.year,
        })

      if (error) {
        console.error('Error adding budget:', error)
        toast.error('Failed to add budget', {
          description: error.message,
        })
        return
      }

      const categoryName = categories.find(c => c.id === data.category_id)?.name
      toast.success('Budget added successfully!', {
        description: `${CURRENCY_SYMBOLS[data.currency]}${parsedAmount.toFixed(2)} for ${categoryName}`,
      })

      // Reset form
      form.reset({
        category_id: '',
        amount: '',
        currency: userCurrency,
        month: selectedMonth,
        year: selectedYear,
      })
      
      router.refresh()
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (availableCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Categories Have Budgets</CardTitle>
          <CardDescription>
            You've set budgets for all categories in {getMonthName(selectedMonth)} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Great job! You have budgets set for all your expense categories this month.
          </p>
          <Button variant="outline" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Budget</CardTitle>
        <CardDescription>
          Set a monthly budget for {getMonthName(selectedMonth)} {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category) => (
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount and Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {CURRENCY_SYMBOLS[form.watch('currency')]}
                          </span>
                          <Input
                            placeholder="0.00"
                            className="pl-8"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              // Allow only numbers and decimal point
                              const value = e.target.value.replace(/[^0-9.]/g, '')
                              field.onChange(value)
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                          <SelectItem key={code} value={code}>
                            {symbol} {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Budget
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
