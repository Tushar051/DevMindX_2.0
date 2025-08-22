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
export function createMongoIdFilter(userId: string | number | ObjectId): { _id: ObjectId | number } {
  if (typeof userId === 'string' && ObjectId.isValid(userId)) {
    return { _id: new ObjectId(userId) };
  } else if (typeof userId === 'number') {
    return { _id: userId }; // Return as an object for numeric _id
  } else if (userId instanceof ObjectId) {
    return { _id: userId };
  } else {
    console.warn(`Invalid or unexpected userId format: ${userId}`);
    return { _id: new ObjectId() }; // Fallback to an unmatchable ObjectId
  }
}

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB || 'devmindx';

let mongoClient: MongoClient;
let mongoDb: Db;

async function connectToMongoDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db(mongoDbName);
    console.log('Connected to MongoDB');
  }
  return mongoDb;
}

export { connectToMongoDB, mongoDb };
