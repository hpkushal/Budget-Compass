import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MonthlyReportGenerator } from '@/components/reports/monthly-report-generator'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ReportsPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user settings
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('currency, timezone')
    .eq('user_id', user.id)
    .single()

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generate comprehensive financial reports with your data and analytics
            </p>
          </div>
        </div>

        <MonthlyReportGenerator 
          userId={user.id}
          userCurrency={(userSettings as any)?.currency || 'CAD'}
          userTimezone={(userSettings as any)?.timezone || 'America/Halifax'}
        />
      </div>
    </div>
  )
}
