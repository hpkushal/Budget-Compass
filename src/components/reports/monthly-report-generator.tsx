'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { CalendarIcon, Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClientComponentClient } from '@/lib/supabase'
import { generateMonthlyReport } from '@/lib/excel-export'
import { formatDateForInput } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

const reportSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reportType: z.enum(['detailed', 'summary']),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start <= end
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})

type ReportFormData = z.infer<typeof reportSchema>

interface MonthlyReportGeneratorProps {
  userId: string
  userCurrency: string
  userTimezone: string
}

export function MonthlyReportGenerator({ userId, userCurrency, userTimezone }: MonthlyReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportStats, setReportStats] = useState<{
    expenses: number
    categories: number
    budgets: number
    dateRange: string
  } | null>(null)
  const supabase = createClientComponentClient()

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      startDate: formatDateForInput(startOfMonth(new Date())),
      endDate: formatDateForInput(endOfMonth(new Date())),
      reportType: 'detailed',
    },
  })

  // Quick date range presets
  const setDateRange = (preset: string) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (preset) {
      case 'current-month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'last-month':
        const lastMonth = subMonths(now, 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      case 'last-3-months':
        startDate = startOfMonth(subMonths(now, 2))
        endDate = endOfMonth(now)
        break
      case 'last-6-months':
        startDate = startOfMonth(subMonths(now, 5))
        endDate = endOfMonth(now)
        break
      case 'year-to-date':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
        break
      default:
        return
    }

    form.setValue('startDate', formatDateForInput(startDate))
    form.setValue('endDate', formatDateForInput(endDate))
  }

  // Preview report data
  const previewReport = async (data: ReportFormData) => {
    try {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      // Get expenses count
      const { count: expenseCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('expense_date', data.startDate)
        .lte('expense_date', data.endDate)

      // Get categories count
      const { data: expenses } = await supabase
        .from('expenses')
        .select('category_id')
        .eq('user_id', userId)
        .gte('expense_date', data.startDate)
        .lte('expense_date', data.endDate)

      const uniqueCategories = new Set(expenses?.map(e => e.category_id) || []).size

      // Get budget data count
      const startYear = startDate.getFullYear()
      const endYear = endDate.getFullYear()

      const { count: budgetCount } = await supabase
        .from('budgets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('year', startYear)
        .lte('year', endYear)

      setReportStats({
        expenses: expenseCount || 0,
        categories: uniqueCategories,
        budgets: budgetCount || 0,
        dateRange: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
      })
    } catch (error) {
      console.error('Error previewing report:', error)
    }
  }

  // Watch form changes to update preview
  const watchedValues = form.watch()
  useState(() => {
    if (watchedValues.startDate && watchedValues.endDate) {
      previewReport(watchedValues)
    }
  })

  async function onSubmit(data: ReportFormData) {
    setIsGenerating(true)
    
    try {
      // Fetch all required data
      const [expensesResult, budgetsResult, monthlyTrendsResult] = await Promise.all([
        // Get expenses with category information
        supabase
          .from('expenses')
          .select(`
            id,
            amount,
            currency,
            description,
            expense_date,
            created_at,
            categories!inner (
              name,
              color
            )
          `)
          .eq('user_id', userId)
          .gte('expense_date', data.startDate)
          .lte('expense_date', data.endDate)
          .order('expense_date', { ascending: false }),

        // Get budget overview for the period
        supabase
          .from('monthly_budget_overview')
          .select('*')
          .eq('user_id', userId)
          .gte('year', new Date(data.startDate).getFullYear())
          .lte('year', new Date(data.endDate).getFullYear()),

        // Get monthly trends
        supabase
          .from('monthly_expense_summary')
          .select('*')
          .eq('user_id', userId)
          .gte('year', new Date(data.startDate).getFullYear())
          .lte('year', new Date(data.endDate).getFullYear())
      ])

      if (expensesResult.error) throw expensesResult.error
      if (budgetsResult.error) throw budgetsResult.error
      if (monthlyTrendsResult.error) throw monthlyTrendsResult.error

      const reportData = {
        expenses: expensesResult.data || [],
        budgets: budgetsResult.data || [],
        monthlyTrends: monthlyTrendsResult.data || [],
        userSettings: {
          currency: userCurrency,
          timezone: userTimezone
        },
        dateRange: {
          startDate: data.startDate,
          endDate: data.endDate
        }
      }

      // Generate and download Excel file
      generateMonthlyReport(reportData)

      toast.success('Report generated successfully!', {
        description: 'Your monthly financial report has been downloaded.',
      })

    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report', {
        description: 'Please try again later.',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Generate Monthly Report
        </CardTitle>
        <CardDescription>
          Export your financial data and analytics to Excel format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Quick Date Presets */}
            <div>
              <label className="text-sm font-medium mb-3 block">Quick Date Ranges</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'current-month', label: 'Current Month' },
                  { key: 'last-month', label: 'Last Month' },
                  { key: 'last-3-months', label: 'Last 3 Months' },
                  { key: 'last-6-months', label: 'Last 6 Months' },
                  { key: 'year-to-date', label: 'Year to Date' }
                ].map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange(preset.key)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick start date</span>
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
                            date > new Date() || date < new Date("2020-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick end date</span>
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
                            date > new Date() || date < new Date("2020-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Report Type */}
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="detailed">
                        <div>
                          <p className="font-medium">Detailed Report</p>
                          <p className="text-xs text-muted-foreground">All expenses, budgets, and analytics</p>
                        </div>
                      </SelectItem>
                      <SelectItem value="summary">
                        <div>
                          <p className="font-medium">Summary Report</p>
                          <p className="text-xs text-muted-foreground">Key metrics and totals only</p>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Report Preview */}
            {reportStats && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Report Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date Range</p>
                    <p className="font-medium">{reportStats.dateRange}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expenses</p>
                    <p className="font-medium">{reportStats.expenses} transactions</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Categories</p>
                    <p className="font-medium">{reportStats.categories} categories</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budgets</p>
                    <p className="font-medium">{reportStats.budgets} budget entries</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating Report...' : 'Download Excel Report'}
            </Button>
          </form>
        </Form>

        {/* Report Contents Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-2">📊 Report Contents</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Summary:</strong> Key metrics, totals, and financial health score</p>
            <p>• <strong>Expenses:</strong> Detailed transaction list with categories and dates</p>
            <p>• <strong>Budget Analysis:</strong> Budget vs actual spending with performance metrics</p>
            <p>• <strong>Category Breakdown:</strong> Spending analysis by category with percentages</p>
            <p>• <strong>Monthly Trends:</strong> Historical spending patterns and trends</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
