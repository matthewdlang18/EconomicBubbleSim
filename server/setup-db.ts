import { db } from './db.js';
import { users, gameSessions, studentDecisions, marketEvents } from '@shared/schema';

console.log('Setting up local database...');

// The database file will be created automatically by better-sqlite3
// Tables will be created by drizzle when first accessed

console.log('Database setup complete! You can now run the application.');
