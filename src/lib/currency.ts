export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'CA$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  CAD: 'Canadian Dollar',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
}

export function formatCurrency(amount: number, currency: Currency = 'CAD'): string {
  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || '$'
}

export function parseCurrencyInput(input: string): number {
  // Remove currency symbols and spaces, then parse
  const cleaned = input.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : Math.abs(parsed) // Ensure positive
}

