import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryManagement } from '@/components/settings/category-management'
import { UserPreferences } from '@/components/settings/user-preferences'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { ArrowLeft, Settings, Tag, Globe, Bell } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Fetch user settings
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch categories with expense counts
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      color,
      is_default,
      expenses(count)
    `)
    .eq('user_id', user.id)
    .order('name')

  // Transform categories to include expense count
  const categoriesWithCount = (categories as any[] || []).map((category: any) => ({
    ...category,
    expense_count: category.expenses?.[0]?.count || 0,
    expenses: undefined, // Remove the nested object
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your preferences, categories, and notifications
            </p>
          </div>
        </div>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6">
            <UserPreferences 
              userSettings={{
                currency: (userSettings as any)?.currency || 'CAD',
                timezone: (userSettings as any)?.timezone || 'America/Halifax'
              }}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement 
              categories={categoriesWithCount}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings 
              userSettings={{
                email_notifications: (userSettings as any)?.email_notifications ?? true,
                budget_alerts: (userSettings as any)?.budget_alerts ?? true,
                weekly_digest: (userSettings as any)?.weekly_digest ?? true,
                budget_threshold: (userSettings as any)?.budget_threshold ?? 80
              }}
              userId={user.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}