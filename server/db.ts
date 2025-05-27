import dotenv from "dotenv";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

// Load environment variables first
dotenv.config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Support both SQLite and PostgreSQL
let db: any; // Use any to avoid union type issues

if (process.env.DATABASE_URL.startsWith('sqlite:')) {
  // SQLite for local development
  const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
  const sqlite = new Database(dbPath);
  db = drizzleSQLite(sqlite, { schema });
} else {
  // PostgreSQL/Neon for production
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
}

export { db };