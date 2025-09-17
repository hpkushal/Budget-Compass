import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Ensure user setup is complete for email-confirmed users
      try {
        // Create a client to handle user setup
        const setupClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  request.cookies.set(name, value)
                })
              },
            },
          }
        )

        // Check if user needs setup
        const { data: userSettings } = await setupClient
          .from('user_settings')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (!userSettings) {
          // User needs setup - create settings and categories
          console.log('Setting up confirmed user:', data.user.id)
          
          await setupClient.from('user_settings').insert({
            user_id: data.user.id,
            timezone: 'America/Halifax',
            currency: 'CAD'
          })

          const defaultCategories = [
            { name: 'Food & Dining', color: '#EF4444', icon: 'utensils' },
            { name: 'Transportation', color: '#3B82F6', icon: 'car' },
            { name: 'Shopping', color: '#8B5CF6', icon: 'shopping-bag' },
            { name: 'Entertainment', color: '#F59E0B', icon: 'film' },
            { name: 'Bills & Utilities', color: '#10B981', icon: 'receipt' },
            { name: 'Healthcare', color: '#EF4444', icon: 'heart' },
            { name: 'Education', color: '#6366F1', icon: 'book-open' },
            { name: 'Personal Care', color: '#EC4899', icon: 'sparkles' },
            { name: 'Travel', color: '#06B6D4', icon: 'plane' },
            { name: 'Other', color: '#6B7280', icon: 'more-horizontal' }
          ]

          await setupClient.from('categories').insert(
            defaultCategories.map(category => ({
              user_id: data.user.id,
              name: category.name,
              color: category.color,
              icon: category.icon,
              is_default: true
            }))
          )
        }
      } catch (setupError) {
        console.error('Error setting up user after confirmation:', setupError)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // In development, redirect to localhost
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // In production, use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback to origin
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

