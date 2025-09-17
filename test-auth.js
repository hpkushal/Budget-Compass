#!/usr/bin/env node

// Test script to check Supabase authentication and database connectivity
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Not found')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.log('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n🔗 Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('user_settings')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Test auth endpoint
    console.log('\n🔐 Testing auth endpoint...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth endpoint error:', authError.message)
      return false
    }
    
    console.log('✅ Auth endpoint accessible!')
    
    // Check if tables exist
    console.log('\n📊 Checking required tables...')
    const tables = ['user_settings', 'categories', 'expenses', 'budgets']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (tableError && !tableError.message.includes('no rows')) {
          console.log(`❌ Table '${table}' issue:`, tableError.message)
        } else {
          console.log(`✅ Table '${table}' accessible`)
        }
      } catch (e) {
        console.log(`❌ Table '${table}' error:`, e.message)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    return false
  }
}

async function testSignup() {
  console.log('\n👤 Testing user signup...')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpass123'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.log('❌ Signup test failed:', error.message)
      return false
    }
    
    console.log('✅ Signup test successful!')
    console.log('User ID:', data.user?.id)
    console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
    
    return true
  } catch (error) {
    console.error('❌ Signup test error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Budget Compass Auth Test\n')
  
  const connectionOk = await testConnection()
  
  if (connectionOk) {
    await testSignup()
  }
  
  console.log('\n📋 Test Summary:')
  console.log('- Check your browser console for any client-side errors')
  console.log('- Verify Supabase project is active and accessible')
  console.log('- Check Supabase Auth settings (email confirmation, etc.)')
  console.log('- Ensure RLS policies allow the operations you need')
  
  console.log('\n🔗 Useful links:')
  console.log('- Supabase Dashboard:', `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}`)
  console.log('- Auth Users:', `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/auth/users`)
  console.log('- Database Tables:', `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/editor`)
}

main().catch(console.error)
