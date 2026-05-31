import DB from './db.mjs';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

config({ path: new URL('.env', import.meta.url).pathname });
const db = new DB();
await db.dropDB();
await db.createDB();
await db.connect();
await db.createTables();
const passwordHash = await bcrypt.hash('password123', 10);
await db.insertUser('alice', passwordHash);
await db.close();