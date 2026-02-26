import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || 'devmindx';

console.log('===========================================');
console.log('MongoDB Connection Test');
console.log('===========================================\n');

if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.log('\nPlease set MONGODB_URI in your .env file');
  process.exit(1);
}

// Mask the password in the URI for display
const displayUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
console.log('MongoDB URI:', displayUri);
console.log('Database Name:', mongoDbName);
console.log('\nAttempting connection...\n');

async function testConnection() {
  let client;
  
  try {
    // Configure connection options for MongoDB Atlas
    const mongoOptions = {
      tls: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
      w: 'majority'
    };

    console.log('Connection Options:');
    console.log(JSON.stringify(mongoOptions, null, 2));
    console.log('\n');

    client = new MongoClient(mongoUri, mongoOptions);
    
    console.log('⏳ Connecting to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!\n');
    
    const db = client.db(mongoDbName);
    
    // Test database operations
    console.log('Testing database operations...');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Get server info
    const admin = db.admin();
    const serverInfo = await admin.serverInfo();
    console.log(`\n📊 MongoDB Server Info:`);
    console.log(`   Version: ${serverInfo.version}`);
    if (serverInfo.os) {
      console.log(`   Platform: ${serverInfo.os.type} ${serverInfo.os.version}`);
    }
    
    // Test write operation
    console.log('\n✍️  Testing write operation...');
    const testCollection = db.collection('connection_test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`   ✅ Document inserted with ID: ${insertResult.insertedId}`);
    
    // Test read operation
    console.log('\n📖 Testing read operation...');
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Document retrieved: ${foundDoc.message}`);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('   🧹 Test document cleaned up');
    
    console.log('\n===========================================');
    console.log('✅ All tests passed! MongoDB is working correctly.');
    console.log('===========================================\n');
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!\n');
    console.error('Error Details:');
    console.error('-------------');
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Type: Server Selection Error');
      console.error('This usually means:');
      console.error('  1. MongoDB Atlas cluster is paused or not running');
      console.error('  2. Network access is not configured (IP whitelist)');
      console.error('  3. Connection string is incorrect');
      console.error('  4. Firewall is blocking the connection');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Type: Network Error');
      console.error('This usually means:');
      console.error('  1. SSL/TLS handshake failed');
      console.error('  2. Network connectivity issues');
      console.error('  3. DNS resolution problems');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('Type: Authentication Error');
      console.error('This usually means:');
      console.error('  1. Username or password is incorrect');
      console.error('  2. User doesn\'t have proper permissions');
      console.error('  3. Authentication database is wrong');
    }
    
    console.error('\nFull Error:');
    console.error(error);
    
    console.error('\n===========================================');
    console.error('Troubleshooting Steps:');
    console.error('===========================================');
    console.error('1. Check MongoDB Atlas Dashboard:');
    console.error('   - Ensure cluster is running (not paused)');
    console.error('   - Check Network Access settings');
    console.error('   - Add 0.0.0.0/0 to IP whitelist for testing');
    console.error('\n2. Verify Connection String:');
    console.error('   - Should start with mongodb+srv://');
    console.error('   - Username and password are correct');
    console.error('   - Special characters in password are URL-encoded');
    console.error('\n3. Test from MongoDB Compass:');
    console.error('   - Use the same connection string');
    console.error('   - If Compass works, the issue is in the code');
    console.error('\n4. Check Environment Variables:');
    console.error('   - MONGODB_URI is set correctly in .env');
    console.error('   - No extra spaces or quotes');
    console.error('===========================================\n');
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed.\n');
    }
  }
}

testConnection();
