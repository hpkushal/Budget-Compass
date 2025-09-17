'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClientComponentClient } from '@/lib/supabase'
import { expenseFormSchema, type ExpenseFormData, parseCurrencyAmount } from '@/lib/validations'
import { formatDateForInput } from '@/lib/date-utils'
import { CURRENCY_SYMBOLS, type Currency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

interface AddExpenseFormProps {
  categories: Category[]
  userCurrency: Currency
}

export function AddExpenseForm({ categories, userCurrency }: AddExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category_id: '',
      amount: '',
      currency: userCurrency,
      description: '',
      expense_date: formatDateForInput(new Date()),
    },
  })

  async function onSubmit(data: ExpenseFormData) {
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
      
      if (parsedAmount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }

      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          category_id: data.category_id,
          amount: parsedAmount,
          currency: data.currency,
          description: data.description || null,
          expense_date: data.expense_date,
        })

      if (error) {
        console.error('Error adding expense:', error)
        toast.error('Failed to add expense', {
          description: error.message,
        })
        return
      }

      toast.success('Expense added successfully!', {
        description: `${CURRENCY_SYMBOLS[data.currency]}${parsedAmount.toFixed(2)} for ${
          categories.find(c => c.id === data.category_id)?.name
        }`,
      })

      // Reset form and redirect
      form.reset()
      router.push('/dashboard')
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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>
          Record a new expense to track your spending
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                      <FormLabel>Amount</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Date Selection */}
            <FormField
              control={form.control}
              name="expense_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? formatDateForInput(date) : '')
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was this expense for?"
                      className="min-h-[80px]"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Expense
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
