'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientComponentClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpass123')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const supabase = createClientComponentClient()

  const addResult = (test: string, result: any, success: boolean) => {
    setResults(prev => [...prev, { test, result, success, timestamp: new Date().toISOString() }])
  }

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('user_settings').select('count').limit(1)
      addResult('Database Connection', { data, error }, !error)
    } catch (error) {
      addResult('Database Connection', { error: error.message }, false)
    }
    setIsLoading(false)
  }

  const testSignup = async () => {
    setIsLoading(true)
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: password,
      })
      addResult('Signup Test', { 
        email: testEmail,
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session ? 'Session created' : 'No session',
        error 
      }, !error)
    } catch (error) {
      addResult('Signup Test', { error: error.message }, false)
    }
    setIsLoading(false)
  }

  const testLogin = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      addResult('Login Test', { 
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session ? 'Session created' : 'No session',
        error 
      }, !error)
      
      if (data.session) {
        toast.success('Login successful!')
      } else if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      addResult('Login Test', { error: error.message }, false)
    }
    setIsLoading(false)
  }

  const testCurrentUser = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getUser()
      addResult('Current User', { 
        user: data.user ? { id: data.user.id, email: data.user.email, emailConfirmed: data.user.email_confirmed_at } : null,
        error 
      }, !error)
    } catch (error) {
      addResult('Current User', { error: error.message }, false)
    }
    setIsLoading(false)
  }

  const clearResults = () => setResults([])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Authentication Diagnostics</CardTitle>
          <CardDescription>
            Test various authentication functions to diagnose login issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to test login"
              />
            </div>
            <div>
              <Label htmlFor="password">Test Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testConnection} disabled={isLoading}>
              Test Database Connection
            </Button>
            <Button onClick={testCurrentUser} disabled={isLoading}>
              Check Current User
            </Button>
            <Button onClick={testSignup} disabled={isLoading} variant="outline">
              Test Signup (creates new user)
            </Button>
            <Button onClick={testLogin} disabled={isLoading} variant="outline">
              Test Login
            </Button>
            <Button onClick={clearResults} variant="ghost">
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <Card key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.test}</h4>
                        <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                      </div>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">💡 Troubleshooting Tips:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>First test database connection to ensure Supabase is accessible</li>
              <li>Check current user to see if you're already logged in</li>
              <li>Create a test user with signup if you don't have one</li>
              <li>Try logging in with the test credentials</li>
              <li>Check browser console for additional error messages</li>
              <li>Verify Supabase Auth settings (email confirmation, etc.)</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium mb-2">🔗 Quick Links:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Supabase Dashboard:</strong> <a href="https://supabase.com/dashboard/project/fiswiqyybmoycrsykrxw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Dashboard</a></div>
              <div><strong>Auth Users:</strong> <a href="https://supabase.com/dashboard/project/fiswiqyybmoycrsykrxw/auth/users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Users</a></div>
              <div><strong>Auth Settings:</strong> <a href="https://supabase.com/dashboard/project/fiswiqyybmoycrsykrxw/auth/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Auth Settings</a></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
