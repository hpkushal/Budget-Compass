import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { BudgetOverview } from '@/components/dashboard/budget-overview'
import { FinancialOverview } from '@/components/dashboard/financial-overview'
import { FinancialHighlights } from '@/components/dashboard/financial-highlights'

export default async function DashboardPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user settings
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get dashboard data
  const { data: dashboardData } = await supabase
    .from('user_dashboard_current_month')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader user={user} />
        
        <DashboardStats 
          data={dashboardData}
          currency={(userSettings as any)?.currency || 'CAD'}
        />
        
        {/* Budget Overview */}
        <BudgetOverview userId={user.id} />
        
        {/* Financial Highlights - Full Width */}
        <FinancialHighlights userId={user.id} />

        {/* Comprehensive Financial Overview */}
        <FinancialOverview userId={user.id} />
      </div>
    </div>
  )
}

