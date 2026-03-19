import fs from 'fs';
import path from 'path';
import { initialData } from './initialData';

// Dynamic Import Fallback for missing mongoose
let mongoose: any = null;
try {
  mongoose = require('mongoose');
} catch (e) {
  console.warn('--- MONGOOSE NOT DETECTED. FALLING BACK TO JSON DB ---');
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (!mongoose) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((m: any) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export function saveDb(data: any) {
  if (!mongoose || !MONGODB_URI) {
    const DB_PATH = path.resolve(process.cwd(), 'db/db.json');
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
}

const DB_PATH = path.resolve(process.cwd(), 'db/db.json');

export async function getDb() {
  if (mongoose && MONGODB_URI) {
    try {
      await connectDB();
      const { User, Listing, Blog, Message } = require('./models');
      const [usersRaw, listingsRaw, blogsRaw, messagesRaw] = await Promise.all([
        User.find({}).lean(),
        Listing.find({}).lean(),
        Blog.find({}).lean(),
        Message.find({}).lean()
      ]);
      
      const normalize = (arr: any[]) => arr.map(item => ({ 
        ...item, 
        id: item.id || item._id?.toString() || item._id 
      }));

      return JSON.parse(JSON.stringify({
        users: normalize(usersRaw),
        listings: normalize(listingsRaw),
        blogs: normalize(blogsRaw),
        messages: normalize(messagesRaw)
      }));
    } catch (e) {
       console.error('Mongo load failed, falling back to JSON:', e);
    }
  }

  // JSON Fallback
  if (!fs.existsSync(DB_PATH)) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
  
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  return data;
}

export function generateId() {
  if (mongoose) return new mongoose.Types.ObjectId().toString();
  return Math.random().toString(36).substring(2, 15);
}
