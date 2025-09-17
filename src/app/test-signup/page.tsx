'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClientComponentClient()

  const handleSignup = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      setResult({
        success: !error,
        error: error?.message,
        user: data.user?.id ? 'Created' : 'Not created',
        session: data.session ? 'Active' : 'None',
        needsConfirmation: !data.session && data.user && !error
      })
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message,
        user: 'Error',
        session: 'Error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Signup</CardTitle>
          <CardDescription>
            Debug signup functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            onClick={handleSignup} 
            disabled={loading || !email || !password}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Signup'}
          </Button>

          {result && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Result:</h3>
              <div className="text-sm space-y-1">
                <p>Success: {result.success ? '✅' : '❌'}</p>
                <p>User: {result.user}</p>
                <p>Session: {result.session}</p>
                {result.error && <p className="text-red-600">Error: {result.error}</p>}
                {result.needsConfirmation && (
                  <p className="text-blue-600">✉️ Check your email for confirmation</p>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Supabase URL: https://fiswiqyybmoycrsykrxw.supabase.co</p>
            <p>Using anon key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
