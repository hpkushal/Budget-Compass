import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BudgetCompassLogo } from '@/components/ui/compass-logo'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, Plus } from 'lucide-react'
import { LogoutButton } from '@/components/auth/logout-button'
import Link from 'next/link'

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const userInitials = user.email
    ?.split('@')[0]
    .split('.')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'U'

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <BudgetCompassLogo size="sm" showText={false} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {user.email?.split('@')[0]}!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/analytics">
            Analytics
          </Link>
        </Button>

        <Button variant="ghost" asChild>
          <Link href="/reports">
            Reports
          </Link>
        </Button>

        <Button variant="ghost" asChild>
          <Link href="/settings">
            Settings
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/budgets">
            Manage Budgets
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

