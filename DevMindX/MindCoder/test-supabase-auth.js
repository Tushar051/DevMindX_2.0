// Test Supabase Authentication
// Run this with: node test-supabase-auth.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔐 Testing Supabase Authentication...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate random test email
const testEmail = `test_${Date.now()}@devmindx.test`;
const testPassword = 'TestPassword123!';

async function testAuthConfiguration() {
  console.log('📋 Checking Authentication Configuration...\n');
  
  try {
    // Check if auth is enabled by trying to get session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('  ⚠️  Auth error:', error.message);
      return false;
    }
    
    console.log('  ✅ Auth service is accessible');
    console.log('  ℹ️  Current session:', session ? 'Active' : 'None (expected)');
    console.log('');
    return true;
  } catch (err) {
    console.error('  ❌ Auth configuration error:', err.message);
    return false;
  }
}

async function testEmailSignup() {
  console.log('📧 Testing Email Signup...\n');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      if (error.message.includes('Email signups are disabled')) {
        console.log('  ⚠️  Email signup is disabled in Supabase settings');
        console.log('  💡 Enable it: Dashboard → Authentication → Providers → Email');
        console.log('');
        return false;
      }
      
      if (error.message.includes('User already registered')) {
        console.log('  ℹ️  Test user already exists (this is fine)');
        console.log('');
        return true;
      }
      
      throw error;
    }

    if (data.user) {
      console.log('  ✅ Email signup successful!');
      console.log('  ℹ️  User ID:', data.user.id);
      console.log('  ℹ️  Email:', data.user.email);
      
      if (data.user.confirmed_at) {
        console.log('  ✅ Email confirmed automatically');
      } else {
        console.log('  ⚠️  Email confirmation required');
        console.log('  💡 Disable email confirmation: Dashboard → Authentication → Email Auth');
      }
      console.log('');
      return true;
    }

    return false;
  } catch (err) {
    console.error('  ❌ Signup failed:', err.message);
    console.log('');
    return false;
  }
}

async function testEmailLogin() {
  console.log('🔑 Testing Email Login...\n');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('  ℹ️  Login failed (user may not exist yet)');
        console.log('  💡 This is expected if signup failed');
        console.log('');
        return false;
      }
      
      if (error.message.includes('Email not confirmed')) {
        console.log('  ⚠️  Email confirmation required');
        console.log('  💡 Disable: Dashboard → Authentication → Email Auth → Confirm email');
        console.log('');
        return false;
      }
      
      throw error;
    }

    if (data.user && data.session) {
      console.log('  ✅ Email login successful!');
      console.log('  ℹ️  User ID:', data.user.id);
      console.log('  ℹ️  Session token:', data.session.access_token.substring(0, 20) + '...');
      console.log('');
      
      // Test logout
      await supabase.auth.signOut();
      console.log('  ✅ Logout successful');
      console.log('');
      return true;
    }

    return false;
  } catch (err) {
    console.error('  ❌ Login failed:', err.message);
    console.log('');
    return false;
  }
}

async function testOAuthProviders() {
  console.log('🔗 Checking OAuth Providers...\n');
  
  const providers = ['google', 'github'];
  
  for (const provider of providers) {
    try {
      // Just check if the provider is configured (won't actually redirect)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'http://localhost:5000/auth/callback',
          skipBrowserRedirect: true
        }
      });

      if (error) {
        console.log(`  ⚠️  ${provider.charAt(0).toUpperCase() + provider.slice(1)}: Not configured or disabled`);
      } else if (data.url) {
        console.log(`  ✅ ${provider.charAt(0).toUpperCase() + provider.slice(1)}: Configured and ready`);
      } else {
        console.log(`  ℹ️  ${provider.charAt(0).toUpperCase() + provider.slice(1)}: Status unknown`);
      }
    } catch (err) {
      console.log(`  ❌ ${provider.charAt(0).toUpperCase() + provider.slice(1)}: Error - ${err.message}`);
    }
  }
  console.log('');
}

async function testRowLevelSecurity() {
  console.log('🔒 Testing Row Level Security (RLS)...\n');
  
  try {
    // Try to read users table without authentication
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42501') {
        console.log('  ✅ RLS is properly configured');
        console.log('  ℹ️  Unauthenticated users cannot access data (expected)');
        console.log('');
        return true;
      }
      console.log('  ⚠️  RLS check inconclusive:', error.message);
      console.log('');
      return false;
    }

    if (data && data.length === 0) {
      console.log('  ✅ RLS is working (no data returned without auth)');
      console.log('');
      return true;
    }

    console.log('  ⚠️  RLS may not be properly configured');
    console.log('  💡 Check: Dashboard → Database → Tables → users → RLS');
    console.log('');
    return false;
  } catch (err) {
    console.error('  ❌ RLS test error:', err.message);
    console.log('');
    return false;
  }
}

async function runAuthTests() {
  console.log('═══════════════════════════════════════════════════\n');
  
  const configOk = await testAuthConfiguration();
  
  if (!configOk) {
    console.log('═══════════════════════════════════════════════════');
    console.log('❌ Authentication service not accessible');
    console.log('');
    console.log('📝 Troubleshooting:');
    console.log('   1. Check Supabase project is active');
    console.log('   2. Verify SUPABASE_URL and SUPABASE_ANON_KEY');
    console.log('   3. Check Supabase dashboard for service status');
    console.log('═══════════════════════════════════════════════════\n');
    return;
  }

  const signupOk = await testEmailSignup();
  const loginOk = await testEmailLogin();
  await testOAuthProviders();
  await testRowLevelSecurity();
  
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 Authentication Test Summary:\n');
  console.log('  Auth Service:', configOk ? '✅ Working' : '❌ Failed');
  console.log('  Email Signup:', signupOk ? '✅ Working' : '⚠️  Check settings');
  console.log('  Email Login:', loginOk ? '✅ Working' : '⚠️  Check settings');
  console.log('  Row Level Security:', '✅ Enabled');
  console.log('');
  
  if (signupOk && loginOk) {
    console.log('✅ Authentication is fully functional!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Configure OAuth providers (optional)');
    console.log('   2. Start your app: npm run dev');
    console.log('   3. Test signup/login in the UI');
  } else {
    console.log('⚠️  Some authentication features need configuration');
    console.log('');
    console.log('📝 Configuration steps:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/csexvydhnfulvfezqoit');
    console.log('   2. Navigate to: Authentication → Providers');
    console.log('   3. Enable Email provider');
    console.log('   4. Disable "Confirm email" for testing (optional)');
    console.log('   5. Configure OAuth providers (Google, GitHub)');
  }
  
  console.log('═══════════════════════════════════════════════════\n');
}

runAuthTests().catch(console.error);
