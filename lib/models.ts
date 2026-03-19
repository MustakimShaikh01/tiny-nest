let mongoose: any = null;
try {
  mongoose = require('mongoose');
} catch (e) {
  // Silent fail
}

const UserSchema = mongoose ? new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  joined: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
  status: { type: String, default: 'active' },
  listings: { type: Number, default: 0 }
}, { timestamps: true }) : null;

const ListingSchema = mongoose ? new mongoose.Schema({
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
  seller: { type: String, required: true }, // User email
  sellerName: { type: String, required: true }
}, { timestamps: true }) : null;

const BlogSchema = mongoose ? new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  emoji: { type: String, default: '📝' },
  readTime: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  author: { type: String, default: 'Admin' }
}, { timestamps: true }) : null;

const MessageSchema = mongoose ? new mongoose.Schema({
  from: { type: String, required: true },
  fromName: { type: String, required: true },
  to: { type: String, required: true },
  toName: { type: String, required: true },
  listingId: { type: String, required: true },
  listingTitle: { type: String, required: true },
  text: { type: String, required: true },
  status: { type: String, enum: ['read', 'unread'], default: 'unread' },
}, { timestamps: true }) : null;

const mockModel = (name: string) => {
  const mock = function(this: any, data: any) {
    Object.assign(this, data);
    this.save = async () => this;
    return this;
  };
  (mock as any).find = () => ({ sort: () => ({ lean: async () => [] }), lean: async () => [] });
  (mock as any).findOne = () => ({ lean: async () => null });
  (mock as any).findOneAndUpdate = () => ({ lean: async () => null });
  (mock as any).countDocuments = async () => 0;
  return mock;
};

export const User = mongoose ? (mongoose.models.User || mongoose.model('User', UserSchema)) : mockModel('User') as any;
export const Listing = mongoose ? (mongoose.models.Listing || mongoose.model('Listing', ListingSchema)) : mockModel('Listing') as any;
export const Blog = mongoose ? (mongoose.models.Blog || mongoose.model('Blog', BlogSchema)) : mockModel('Blog') as any;
export const Message = mongoose ? (mongoose.models.Message || mongoose.model('Message', MessageSchema)) : mockModel('Message') as any;
