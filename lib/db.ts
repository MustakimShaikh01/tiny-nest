import fs from 'fs';
import path from 'path';

import { initialData } from './initialData';

// On Render, we use a different path for the persistent disk. Locally, we use the root 'db' folder.
const DB_DIR = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/storage/db' 
  : path.join(process.cwd(), 'db');

const DB_PATH = path.join(DB_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure file exists with initial structure if missing
if (!fs.existsSync(DB_PATH) || fs.readFileSync(DB_PATH, 'utf-8').trim() === '' || JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')).listings.length === 0) {
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
} else {
  // Ensure admin user exists in existing database
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  if (!db.users.find((u: any) => u.email === 'admin@tinynest.com')) {
    db.users.push(initialData.users.find((u: any) => u.email === 'admin@tinynest.com'));
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
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
