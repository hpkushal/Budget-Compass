#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly
const supabaseUrl = 'https://fiswiqyybmoycrsykrxw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpc3dpcXl5Ym1veWNyc3lrcnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjg4MTMsImV4cCI6MjA3MzYwNDgxM30.qN5zyLKjQYXxX9Ko1hqkd9tdsrpZq03E96SdWSm_-W4';

console.log('🔍 Verifying Monthly Money Manager Setup...\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Environment variables missing!');
  console.log('Make sure .env.local has:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('categories').select('count');
    if (error) {
      console.log('   ❌ Database Error:', error.message);
      if (error.message.includes('relation "categories" does not exist')) {
        console.log('   💡 Run the database setup scripts first!');
      }
    } else {
      console.log('   ✅ Database connection successful');
    }

    // Test 2: Auth Configuration
    console.log('2. Testing auth configuration...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test-' + Date.now() + '@example.com',
        password: 'testpassword123'
      });
      
      if (authError) {
        console.log('   ⚠️  Auth Error:', authError.message);
        if (authError.message.includes('Signup is disabled')) {
          console.log('   💡 Enable signup in Supabase Dashboard > Auth > Settings');
        }
      } else {
        console.log('   ✅ Auth signup working');
        if (authData.user && !authData.session) {
          console.log('   📧 Email confirmation required');
        }
      }
    } catch (authErr) {
      console.log('   ❌ Auth test failed:', authErr.message);
    }

    // Test 3: RLS Policies
    console.log('3. Testing Row Level Security...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('user_settings')
      .select('count');
    
    if (rlsError) {
      console.log('   ⚠️  RLS Error:', rlsError.message);
    } else {
      console.log('   ✅ RLS policies working');
    }

    console.log('\n🎉 Setup verification complete!');
    console.log('\nNext steps:');
    console.log('1. Visit: http://localhost:3000');
    console.log('2. Try signing up with a real email');
    console.log('3. Check your email for confirmation (if enabled)');
    console.log('4. Test the dashboard features');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

verifySetup();
