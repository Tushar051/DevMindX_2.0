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

async function connectToMongoDB(): Promise<Db> {
  // Check if MongoDB URI is configured
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set. Please configure MongoDB connection.');
  }

  // Return cached connection if available
  if (cachedMongoDb) {
    return cachedMongoDb;
  }

  if (!mongoClient) {
    try {
      // Configure connection options for MongoDB Atlas
      const mongoOptions: any = {
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true,
        w: 'majority'
      };

      mongoClient = new MongoClient(mongoUri, mongoOptions);
      await mongoClient.connect();
      cachedMongoDb = mongoClient.db(mongoDbName);
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      mongoClient = null;
      cachedMongoDb = null;
      throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return cachedMongoDb!;
}

// Export a promise that resolves to the database
export const mongoDb = connectToMongoDB();

export { connectToMongoDB };
