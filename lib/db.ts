import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

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
