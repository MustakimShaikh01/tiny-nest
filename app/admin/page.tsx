import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getSession } from '../../lib/auth';
import { getDb } from '../../lib/db';
import AdminDashboard from '../../components/AdminDashboard';
import { redirect } from 'next/navigation';
import { connectDB } from '../../lib/db';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const { User, Listing, Message, Blog, Community, Support } = require('../../lib/models');
  
  const users = await User.find().lean();
  const listings = await Listing.find().lean();
  const messages = await Message.find().lean();
  const blogs = await Blog.find().lean();
  const communities = await Community.find().lean();
  const support = await Support.find().sort({ createdAt: -1 }).lean();

  const pendingListings = listings.filter((l: any) => l.status === 'pending');

  const data = JSON.parse(JSON.stringify({
    users,
    listings,
    pendingListings,
    messages,
    blogs,
    communities,
    support,
    session,
  }));

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={session.user} />
      <div className="flex flex-1">
        <AdminDashboard data={data} />
      </div>
      <Footer />
    </main>
  );
}
