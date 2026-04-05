import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema.js";
import { MongoClient, Db, ObjectId } from 'mongodb';

neonConfig.webSocketConstructor = ws;

// Only initialize Postgres/Neon if DATABASE_URL is set
let pool, db;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: { ...schema } });
} else {
  console.warn('DATABASE_URL not set. Skipping Postgres/Neon connection. Only MongoDB will be used.');
}

export { pool, db };

// Helper to create MongoDB _id filter
export function createMongoIdFilter(userId: string | number | ObjectId): { _id: ObjectId | number | string } {
  if (userId instanceof ObjectId) {
    return { _id: userId };
  }

  if (typeof userId === 'number') {
    return { _id: userId };
  }

  if (typeof userId === 'string') {
    if (ObjectId.isValid(userId)) {
      return { _id: new ObjectId(userId) };
    }

    const numericId = Number(userId);
    if (!Number.isNaN(numericId)) {
      return { _id: numericId };
    }

    return { _id: userId };
  }

  throw new Error(`Unsupported userId type: ${typeof userId}`);
}

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || 'devmindx';

let mongoClient: MongoClient | null = null;
let cachedMongoDb: Db | null = null;

async function connectToMongoDB(): Promise<Db | null> {
  // Check if MongoDB URI is configured
  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI environment variable is not set. MongoDB features will be unavailable.');
    return null;
  }

  // Return cached connection if available
  if (cachedMongoDb) {
    return cachedMongoDb;
  }

  if (!mongoClient) {
    try {
      // Configure connection options for MongoDB Atlas
      // Compatible with MongoDB Node.js Driver v6+
      const isLocalhost = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');
      const isSrv = mongoUri.startsWith('mongodb+srv://');
      const mongoOptions: any = {
        serverSelectionTimeoutMS: 30000, // Increased timeout for Render cold starts
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1, // Reduced for free tier
        retryWrites: true,
        retryReads: true,
        w: 'majority'
      };
      
      if (isSrv || (!isLocalhost && process.env.NODE_ENV === 'production')) {
         mongoOptions.tls = true;
      }

      mongoClient = new MongoClient(mongoUri, mongoOptions);
      await mongoClient.connect();
      cachedMongoDb = mongoClient.db(mongoDbName);
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      mongoClient = null;
      cachedMongoDb = null;
      
      // Don't throw - return null to let caller handle gracefully
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`MongoDB connection failed: ${errorMessage}`);
      console.error('Server will continue with fallback storage (MemStorage)');
      
      return null;
    }
  }
  
  return cachedMongoDb;
}
// Export the connection function
// Returns Db | null - null if connection fails or not configured
export { connectToMongoDB };
export type { Db };