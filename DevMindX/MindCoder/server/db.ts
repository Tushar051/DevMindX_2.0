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
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB || 'devmindx';

let mongoClient: MongoClient;
let mongoDb: Db;

async function connectToMongoDB() {
  if (!mongoClient) {
    // Configure TLS based on URI and environment
    const isSrv = mongoUri.startsWith('mongodb+srv://');
    const envTls = process.env.MONGODB_TLS;
    const tlsEnabled = envTls === 'true' ? true : envTls === 'false' ? false : isSrv;
    const mongoOptions: any = {
      // Only enable TLS by default for Atlas (mongodb+srv). Allow override with MONGODB_TLS
      tls: tlsEnabled,
    };

    mongoClient = new MongoClient(mongoUri, mongoOptions);
    await mongoClient.connect();
    mongoDb = mongoClient.db(mongoDbName);
    console.log('Connected to MongoDB');
  }
  return mongoDb;
}

export { connectToMongoDB, mongoDb };
