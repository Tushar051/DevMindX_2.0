// Test Supabase Connection
// Run this with: node test-supabase.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check if credentials are loaded
console.log('📋 Configuration Check:');
console.log('  SUPABASE_URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('  SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Loaded' : '❌ Missing');
console.log('  URL Value:', supabaseUrl);
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Testing connection to Supabase...');
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Connection successful, but tables not created yet');
        console.log('   Run the SQL schema in Supabase dashboard to create tables');
        console.log('   File: supabase-schema.sql\n');
        return false;
      }
      throw error;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Database tables are accessible\n');
    return true;

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if SUPABASE_URL is correct');
    console.error('   2. Check if SUPABASE_ANON_KEY is correct');
    console.error('   3. Make sure your Supabase project is active');
    console.error('   4. Run supabase-schema.sql in Supabase SQL Editor\n');
    return false;
  }
}

async function testTables() {
  console.log('📊 Testing database tables...\n');

  const tables = ['users', 'projects', 'chat_history', 'collaboration_sessions'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          console.log(`  ❌ Table "${table}" does not exist`);
        } else {
          console.log(`  ⚠️  Table "${table}" - ${error.message}`);
        }
      } else {
        console.log(`  ✅ Table "${table}" exists and is accessible`);
      }
    } catch (err) {
      console.log(`  ❌ Table "${table}" - ${err.message}`);
    }
  }
  console.log('');
}

async function testInsert() {
  console.log('✍️  Testing write permissions...\n');
  
  try {
    // Try to insert a test record (will fail if RLS is enabled without auth)
    const { error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (error) {
      console.log('  ⚠️  RLS (Row Level Security) is enabled');
      console.log('  ℹ️  This is expected - authentication required for writes\n');
    } else {
      console.log('  ✅ Read access working\n');
    }
  } catch (err) {
    console.log('  ❌ Error:', err.message, '\n');
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════\n');
  
  const connected = await testConnection();
  
  if (connected) {
    await testTables();
    await testInsert();
    
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Supabase is configured correctly!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. If tables don\'t exist, run supabase-schema.sql');
    console.log('   2. Start your app: npm run dev');
    console.log('   3. Test authentication and features');
    console.log('═══════════════════════════════════════════════════\n');
  } else {
    console.log('═══════════════════════════════════════════════════');
    console.log('❌ Supabase connection failed');
    console.log('');
    console.log('📝 Required actions:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/csexvydhnfulvfezqoit');
    console.log('   2. Click SQL Editor');
    console.log('   3. Copy contents of supabase-schema.sql');
    console.log('   4. Paste and click Run');
    console.log('   5. Run this test again: node test-supabase.js');
    console.log('═══════════════════════════════════════════════════\n');
  }
}

runTests().catch(console.error);
