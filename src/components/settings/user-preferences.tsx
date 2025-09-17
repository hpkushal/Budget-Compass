'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Save, Globe, DollarSign, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClientComponentClient } from '@/lib/supabase'

const preferencesSchema = z.object({
  currency: z.enum(['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD']),
  timezone: z.string().min(1, 'Timezone is required'),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

interface UserPreferencesProps {
  userSettings: {
    currency: string
    timezone: string
  }
  userId: string
}

const currencies = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
]

const timezones = [
  { value: 'America/Halifax', label: 'Atlantic Time (Halifax)' },
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
  { value: 'America/Winnipeg', label: 'Central Time (Winnipeg)' },
  { value: 'America/Edmonton', label: 'Mountain Time (Edmonton)' },
  { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Europe/Berlin', label: 'CET (Berlin)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
  { value: 'Australia/Melbourne', label: 'AEST (Melbourne)' },
]

export function UserPreferences({ userSettings, userId }: UserPreferencesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currency: userSettings.currency as 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD',
      timezone: userSettings.timezone,
    },
  })

  const onSubmit = async (data: PreferencesFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          currency: data.currency,
          timezone: data.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) throw error

      toast.success('Preferences updated successfully!', {
        description: 'Your changes have been saved.',
      })

      // Refresh the page to apply new settings
      router.refresh()
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences', {
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const watchedCurrency = form.watch('currency')
  const selectedCurrency = currencies.find(c => c.code === watchedCurrency)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          User Preferences
        </CardTitle>
        <CardDescription>
          Customize your currency, timezone, and display preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Currency
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg">
                              {currency.symbol}
                            </span>
                            <div>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-muted-foreground ml-2">
                                {currency.name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    All amounts will be displayed in {selectedCurrency?.name || 'the selected currency'} ({selectedCurrency?.symbol || '$'}).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timezone
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Dates and times will be displayed in your selected timezone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
