import fs from 'fs';
import path from 'path';

// Use /storage mount for Render if configured, else fallback to project root
const DB_DIR = process.env.DB_MOUNT_PATH || path.join(process.cwd(), 'storage', 'db');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure file exists with initial structure if missing
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], listings: [], blogs: [], messages: [] }));
}

export function getDb() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}
