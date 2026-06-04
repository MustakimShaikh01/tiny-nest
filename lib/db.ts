import fs from 'fs';
import path from 'path';
import { initialData } from './initialData';

const sanitizeSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, '') // remove special characters except spaces/hyphens
    .trim()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // replace multiple hyphens with single hyphen
    .slice(0, 60);
};

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

let _dbCache: any = null;
let _dbCacheTime = 0;

export async function getDb() {
  if (mongoose && MONGODB_URI) {
    const now = Date.now();
    if (_dbCache && now - _dbCacheTime < 2000) {
      return _dbCache; // Serve from fast memory cache if < 2 seconds old
    }
    try {
      await connectDB();
      const { User, Listing, Blog, Message, Community } = require('./models');
      const [usersRaw, listingsRaw, blogsRaw, messagesRaw, communitiesRaw] = await Promise.all([
        User.find({}).lean(),
        Listing.find({}).lean(),
        Blog.find({}).lean(),
        Message.find({}).lean(),
        Community.find({}).lean()
      ]);

      // Populate missing slugs in MongoDB
      for (const item of listingsRaw) {
        if (!item.slug) {
          const generated = sanitizeSlug(item.title || 'listing');
          item.slug = generated;
          await Listing.updateOne({ _id: item._id }, { $set: { slug: generated } });
        }
      }
      for (const item of blogsRaw) {
        if (!item.slug) {
          const generated = sanitizeSlug(item.title || 'blog');
          item.slug = generated;
          await Blog.updateOne({ _id: item._id }, { $set: { slug: generated } });
        }
      }
      
      const normalize = (arr: any[]) => arr.map(item => ({ 
        ...item, 
        id: item.id || item._id?.toString() || item._id 
      }));

      // Cache it to prevent full DB dumps multiple times per page load
      _dbCache = JSON.parse(JSON.stringify({
        users: normalize(usersRaw),
        listings: normalize(listingsRaw),
        blogs: normalize(blogsRaw),
        messages: normalize(messagesRaw),
        communities: normalize(communitiesRaw)
      }));
      _dbCacheTime = now;
      return _dbCache;
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
  let updatedJson = false;
  for (const item of data.listings || []) {
    if (!item.slug) {
      item.slug = sanitizeSlug(item.title || 'listing');
      updatedJson = true;
    }
  }
  for (const item of data.blogs || []) {
    if (!item.slug) {
      item.slug = sanitizeSlug(item.title || 'blog');
      updatedJson = true;
    }
  }
  if (updatedJson) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
  return data;
}

export function generateId() {
  if (mongoose) return new mongoose.Types.ObjectId().toString();
  return Math.random().toString(36).substring(2, 15);
}
