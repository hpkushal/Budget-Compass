'use client'

import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { createClientComponentClient } from '@/lib/supabase'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </DropdownMenuItem>
  )
}

