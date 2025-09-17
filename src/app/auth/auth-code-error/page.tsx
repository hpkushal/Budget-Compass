import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem confirming your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>This could happen if:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The confirmation link has expired</li>
              <li>The link has already been used</li>
              <li>There was a network error</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signup">
                Try signing up again
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">
                Back to login
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{' '}
              <Link href="mailto:support@example.com" className="underline hover:text-primary">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

