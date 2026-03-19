const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env or .env.local');
  process.exit(1);
}

const { initialData } = require('./initialData');

async function seed() {
  try {
    console.log('--- CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGODB_URI);
    console.log('--- CONNECTED ---');

    const { User, Listing, Blog, Message } = require('./models');

    // Clear existing
    console.log('--- CLEARING COLLECTIONS ---');
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Blog.deleteMany({}),
      Message.deleteMany({})
    ]);

    // Insert Users
    console.log('--- SEEDING USERS ---');
    await User.insertMany(initialData.users);

    // Insert Listings
    console.log('--- SEEDING LISTINGS ---');
    await Listing.insertMany(initialData.listings);

    // Insert Blogs
    console.log('--- SEEDING BLOGS ---');
    await Blog.insertMany(initialData.blogs);

    // Insert Messages
    console.log('--- SEEDING MESSAGES ---');
    await Message.insertMany(initialData.messages);

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('--- SEEDING FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

seed();
