import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { formatCurrency } from './currency'
import { formatDateInTimezone, getMonthName } from './date-utils'

interface ExpenseData {
  id: string
  amount: number
  currency: string
  description: string | null
  expense_date: string
  created_at: string
  categories: {
    name: string
    color: string
  }
}

interface BudgetData {
  category_name: string
  category_color: string
  budget_amount: number
  spent_amount: number
  remaining_amount: number
  percentage_used: number
  is_over_budget: boolean
  currency: string
}

interface MonthlyData {
  category_name: string
  total_amount: number
  expense_count: number
  average_amount: number
  currency: string
  month: number
  year: number
}

interface ReportData {
  expenses: ExpenseData[]
  budgets: BudgetData[]
  monthlyTrends: MonthlyData[]
  userSettings: {
    currency: string
    timezone: string
  }
  dateRange: {
    startDate: string
    endDate: string
  }
}

export function generateMonthlyReport(data: ReportData) {
  const { expenses, budgets, monthlyTrends, userSettings, dateRange } = data
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  
  // 1. Summary Sheet
  const summaryData = generateSummarySheet(data)
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
  
  // 2. Expenses Sheet
  const expensesData = generateExpensesSheet(expenses, userSettings)
  const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData)
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses')
  
  // 3. Budget Analysis Sheet
  if (budgets.length > 0) {
    const budgetData = generateBudgetSheet(budgets)
    const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData)
    XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Budget Analysis')
  }
  
  // 4. Category Breakdown Sheet
  const categoryData = generateCategorySheet(expenses, userSettings)
  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown')
  
  // 5. Monthly Trends Sheet
  if (monthlyTrends.length > 0) {
    const trendsData = generateTrendsSheet(monthlyTrends)
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData)
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Monthly Trends')
  }
  
  // Generate filename
  const startDate = new Date(dateRange.startDate)
  const endDate = new Date(dateRange.endDate)
  const filename = `Monthly_Report_${formatDateForFilename(startDate)}_to_${formatDateForFilename(endDate)}.xlsx`
  
  // Save file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, filename)
}

function generateSummarySheet(data: ReportData) {
  const { expenses, budgets, userSettings, dateRange } = data
  
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget_amount, 0)
  const totalTransactions = expenses.length
  const categoriesUsed = new Set(expenses.map(exp => exp.categories.name)).size
  const overBudgetCategories = budgets.filter(b => b.is_over_budget).length
  
  const averagePerTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0
  const budgetUsagePercentage = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0
  
  return [
    ['MONTHLY FINANCIAL REPORT'],
    ['Generated on:', new Date().toLocaleDateString()],
    ['Report Period:', `${formatDateInTimezone(dateRange.startDate, 'PPP')} - ${formatDateInTimezone(dateRange.endDate, 'PPP')}`],
    ['Currency:', userSettings.currency],
    ['Timezone:', userSettings.timezone],
    [],
    ['SUMMARY STATISTICS'],
    ['Total Spent:', formatCurrency(totalSpent, userSettings.currency)],
    ['Total Budget:', formatCurrency(totalBudget, userSettings.currency)],
    ['Remaining Budget:', formatCurrency(Math.max(0, totalBudget - totalSpent), userSettings.currency)],
    ['Budget Usage:', `${budgetUsagePercentage.toFixed(1)}%`],
    [],
    ['TRANSACTION DETAILS'],
    ['Total Transactions:', totalTransactions],
    ['Categories Used:', categoriesUsed],
    ['Average per Transaction:', formatCurrency(averagePerTransaction, userSettings.currency)],
    ['Over-Budget Categories:', overBudgetCategories],
    [],
    ['FINANCIAL HEALTH'],
    ['Budget Discipline:', overBudgetCategories === 0 ? 'Excellent' : overBudgetCategories <= 2 ? 'Good' : 'Needs Improvement'],
    ['Spending Trend:', budgetUsagePercentage < 80 ? 'On Track' : budgetUsagePercentage < 100 ? 'Near Limit' : 'Over Budget'],
    ['Activity Level:', totalTransactions > 20 ? 'High' : totalTransactions > 10 ? 'Medium' : 'Low']
  ]
}

function generateExpensesSheet(expenses: ExpenseData[], userSettings: any) {
  const header = [
    'Date',
    'Category',
    'Description',
    'Amount',
    'Currency',
    'Day of Week',
    'Time Added'
  ]
  
  const rows = expenses.map(expense => [
    formatDateInTimezone(expense.expense_date, 'yyyy-MM-dd'),
    expense.categories.name,
    expense.description || 'No description',
    expense.amount,
    expense.currency,
    formatDateInTimezone(expense.expense_date, 'EEEE'),
    formatDateInTimezone(expense.created_at, 'HH:mm')
  ])
  
  // Add totals row
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalsRow = ['TOTAL', '', '', totalAmount, userSettings.currency, '', '']
  
  return [header, ...rows, [], totalsRow]
}

function generateBudgetSheet(budgets: BudgetData[]) {
  const header = [
    'Category',
    'Budget Amount',
    'Spent Amount',
    'Remaining',
    'Percentage Used',
    'Status',
    'Currency'
  ]
  
  const rows = budgets.map(budget => [
    budget.category_name,
    budget.budget_amount,
    budget.spent_amount,
    budget.remaining_amount,
    `${budget.percentage_used.toFixed(1)}%`,
    budget.is_over_budget ? 'Over Budget' : budget.percentage_used >= 80 ? 'Near Limit' : 'On Track',
    budget.currency
  ])
  
  // Add summary
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget_amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0)
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0
  
  const summaryRows = [
    [],
    ['BUDGET SUMMARY'],
    ['Total Budget:', totalBudget],
    ['Total Spent:', totalSpent],
    ['Overall Usage:', `${overallPercentage.toFixed(1)}%`],
    ['Categories Over Budget:', budgets.filter(b => b.is_over_budget).length]
  ]
  
  return [header, ...rows, ...summaryRows]
}

function generateCategorySheet(expenses: ExpenseData[], userSettings: any) {
  // Group by category
  const categoryStats = expenses.reduce((acc, expense) => {
    const categoryName = expense.categories.name
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        total: 0,
        count: 0,
        transactions: []
      }
    }
    acc[categoryName].total += expense.amount
    acc[categoryName].count += 1
    acc[categoryName].transactions.push(expense)
    return acc
  }, {} as Record<string, any>)
  
  const header = [
    'Category',
    'Total Spent',
    'Transaction Count',
    'Average per Transaction',
    'Percentage of Total',
    'Highest Single Expense',
    'Lowest Single Expense'
  ]
  
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  
  const rows = Object.values(categoryStats)
    .sort((a: any, b: any) => b.total - a.total)
    .map((category: any) => {
      const highest = Math.max(...category.transactions.map((t: any) => t.amount))
      const lowest = Math.min(...category.transactions.map((t: any) => t.amount))
      const percentage = totalSpent > 0 ? (category.total / totalSpent * 100) : 0
      
      return [
        category.name,
        category.total,
        category.count,
        category.total / category.count,
        `${percentage.toFixed(1)}%`,
        highest,
        lowest
      ]
    })
  
  return [header, ...rows]
}

function generateTrendsSheet(monthlyTrends: MonthlyData[]) {
  const header = [
    'Month',
    'Year',
    'Category',
    'Total Spent',
    'Transaction Count',
    'Average per Transaction'
  ]
  
  const rows = monthlyTrends
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      if (a.month !== b.month) return b.month - a.month
      return b.total_amount - a.total_amount
    })
    .map(trend => [
      getMonthName(trend.month),
      trend.year,
      trend.category_name,
      trend.total_amount,
      trend.expense_count,
      trend.average_amount
    ])
  
  return [header, ...rows]
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}
