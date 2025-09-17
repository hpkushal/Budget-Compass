'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Save, Bell, Mail, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClientComponentClient } from '@/lib/supabase'

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  budget_alerts: z.boolean(),
  weekly_digest: z.boolean(),
  budget_threshold: z.number().min(50).max(100),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface NotificationSettingsProps {
  userSettings: {
    email_notifications: boolean
    budget_alerts: boolean
    weekly_digest: boolean
    budget_threshold: number
  }
  userId: string
}

export function NotificationSettings({ userSettings, userId }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: userSettings.email_notifications,
      budget_alerts: userSettings.budget_alerts,
      weekly_digest: userSettings.weekly_digest,
      budget_threshold: userSettings.budget_threshold,
    },
  })

  const onSubmit = async (data: NotificationFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          email_notifications: data.email_notifications,
          budget_alerts: data.budget_alerts,
          weekly_digest: data.weekly_digest,
          budget_threshold: data.budget_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) throw error

      toast.success('Notification settings updated!', {
        description: 'Your preferences have been saved.',
      })

      router.refresh()
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast.error('Failed to update settings', {
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const watchedEmailNotifications = form.watch('email_notifications')
  const watchedBudgetThreshold = form.watch('budget_threshold')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when and how you receive notifications about your finances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Master Email Toggle */}
            <FormField
              control={form.control}
              name="email_notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Mail className="w-4 h-4" />
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Enable or disable all email notifications from Monthly Money Manager.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Budget Alerts */}
            <FormField
              control={form.control}
              name="budget_alerts"
              render={({ field }) => (
                <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-4 ${
                  !watchedEmailNotifications ? 'opacity-50' : ''
                }`}>
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <AlertTriangle className="w-4 h-4" />
                      Budget Alerts
                      {!watchedEmailNotifications && (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </FormLabel>
                    <FormDescription>
                      Get notified when you reach {watchedBudgetThreshold}% of your category budget.
                      Only one alert per category per month.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value && watchedEmailNotifications}
                      onCheckedChange={field.onChange}
                      disabled={!watchedEmailNotifications}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Budget Threshold */}
            <FormField
              control={form.control}
              name="budget_threshold"
              render={({ field }) => (
                <FormItem className={!watchedEmailNotifications ? 'opacity-50' : ''}>
                  <FormLabel>Budget Alert Threshold</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value.toString()}
                    disabled={!watchedEmailNotifications}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="50">50% of budget</SelectItem>
                      <SelectItem value="60">60% of budget</SelectItem>
                      <SelectItem value="70">70% of budget</SelectItem>
                      <SelectItem value="80">80% of budget</SelectItem>
                      <SelectItem value="90">90% of budget</SelectItem>
                      <SelectItem value="95">95% of budget</SelectItem>
                      <SelectItem value="100">100% of budget</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    You&apos;ll receive an alert when your spending reaches this percentage of your budget.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weekly Digest */}
            <FormField
              control={form.control}
              name="weekly_digest"
              render={({ field }) => (
                <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-4 ${
                  !watchedEmailNotifications ? 'opacity-50' : ''
                }`}>
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Mail className="w-4 h-4" />
                      Weekly Digest
                      {!watchedEmailNotifications && (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </FormLabel>
                    <FormDescription>
                      Receive a weekly summary of your spending, budgets, and financial insights.
                      Sent every Sunday at 9:00 AM in your timezone.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value && watchedEmailNotifications}
                      onCheckedChange={field.onChange}
                      disabled={!watchedEmailNotifications}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Notification Preview */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Email Notifications:</span>
                  <Badge variant={watchedEmailNotifications ? "default" : "secondary"}>
                    {watchedEmailNotifications ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {watchedEmailNotifications && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Budget Alerts:</span>
                      <Badge variant={form.watch('budget_alerts') ? "default" : "secondary"}>
                        {form.watch('budget_alerts') ? `At ${watchedBudgetThreshold}%` : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weekly Digest:</span>
                      <Badge variant={form.watch('weekly_digest') ? "default" : "secondary"}>
                        {form.watch('weekly_digest') ? "Sundays 9:00 AM" : "Disabled"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Email System Coming Soon
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Email notifications are currently being developed. Your preferences will be saved 
                    and applied once the email system is activated.
                  </p>
                </div>
              </div>
            </div>

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
                    Save Settings
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
