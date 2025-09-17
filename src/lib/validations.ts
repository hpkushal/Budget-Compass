import { z } from 'zod'

// Currency validation
export const currencySchema = z.enum(['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'])

// Expense validation
export const expenseSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  amount: z.number().positive('Amount must be positive').max(999999.99, 'Amount too large'),
  currency: currencySchema.default('CAD'),
  description: z.string().max(255, 'Description too long').optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})

export const expenseFormSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  amount: z.string().min(1, 'Amount is required'),
  currency: currencySchema,
  description: z.string().max(255, 'Description too long').optional(),
  expense_date: z.string().min(1, 'Date is required'),
})

// Budget validation
export const budgetSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  amount: z.number().min(0, 'Budget cannot be negative').max(999999.99, 'Budget too large'),
  currency: currencySchema.default('CAD'),
  month: z.number().int().min(1).max(12, 'Invalid month'),
  year: z.number().int().min(2020).max(2100, 'Invalid year'),
})

export const budgetFormSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  amount: z.string().min(1, 'Amount is required'),
  currency: currencySchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().optional(),
})

// User settings validation
export const userSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  currency: currencySchema,
  weekly_digest_enabled: z.boolean().default(true),
  weekly_digest_day: z.number().int().min(0).max(6).default(1), // 0 = Sunday
})

// Auth validation
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Helper function to parse currency amount from form input
export function parseCurrencyAmount(input: string): number {
  const cleaned = input.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  if (isNaN(parsed)) return 0
  return Math.abs(parsed) // Ensure positive
}

// Type exports
export type ExpenseFormData = z.infer<typeof expenseFormSchema>
export type BudgetFormData = z.infer<typeof budgetFormSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>

