const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MANUAL .ENV PARSER to avoid 'dotenv' dependency
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  const fallbackPath = path.resolve(__dirname, '../.env');
  const targetPath = fs.existsSync(envPath) ? envPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  
  if (targetPath) {
    const envFile = fs.readFileSync(targetPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env or .env.local');
  process.exit(1);
}

// Manual Load of Models to avoid TS issues in Node
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  joined: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
  status: { type: String, default: 'active' },
  listings: { type: Number, default: 0 }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['sale', 'rent'], required: true },
  location: { type: String, required: true },
  sqft: { type: Number, required: true },
  beds: { type: Number, required: true },
  baths: { type: Number, required: true },
  year: { type: Number, required: true },
  description: { type: String, required: true },
  amenities: [String],
  img: { type: String, required: true },
  images: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'pending' },
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  seller: { type: String, required: true },
  sellerName: { type: String, required: true }
}, { timestamps: true });
const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  emoji: { type: String, default: '📝' },
  readTime: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  author: { type: String, default: 'Admin' }
}, { timestamps: true });
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  fromName: { type: String, required: true },
  to: { type: String, required: true },
  toName: { type: String, required: true },
  listingId: { type: String, required: true },
  listingTitle: { type: String, required: true },
  text: { type: String, required: true },
  status: { type: String, enum: ['read', 'unread'], default: 'unread' },
}, { timestamps: true });
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

async function seed() {
  try {
    const DB_PATH = path.resolve(__dirname, '../db/db.json');
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

    console.log('--- CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGODB_URI);
    console.log('--- CONNECTED ---');

    // Clear existing
    console.log('--- CLEARING COLLECTIONS ---');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Blog.deleteMany({});
    await Message.deleteMany({});

    // Bulk Insert
    console.log('--- SEEDING DATA ---');
    await User.insertMany(data.users);
    await Listing.insertMany(data.listings);
    await Blog.insertMany(data.blogs);
    await Message.insertMany(data.messages);

    console.log('--- SEEDING SUCCESSFUL ---');
    process.exit(0);
  } catch (error) {
    console.error('--- SEEDING FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

seed();
