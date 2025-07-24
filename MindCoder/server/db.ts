import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { MongoClient, Db } from 'mongodb';

neonConfig.webSocketConstructor = ws;

// Only initialize Postgres/Neon if DATABASE_URL is set
let pool, db;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn('DATABASE_URL not set. Skipping Postgres/Neon connection. Only MongoDB will be used.');
}

export { pool, db };

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
