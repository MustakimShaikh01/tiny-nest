import { getSession } from '../../../lib/auth';
import { connectDB } from '../../../lib/db';
import { Community, CommunityPost, CommunityMessage, User } from '../../../lib/models';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import CommunityView from '../../../components/CommunityView';
import { notFound } from 'next/navigation';

export default async function CommunityDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  
  await connectDB();
  const community = await Community.findById(params.id).lean();
  
  // Admins can view regardless of status for moderation
  const isAdmin = session?.user?.role === 'admin';
  
  if (!community || (community.status !== 'approved' && !isAdmin)) {
    notFound();
  }

  let isMember = false;
  if (session?.user) {
    const userDoc = await User.findOne({ email: session.user.email }).lean();
    isMember = userDoc?.communities?.includes(params.id) || false;
  }

  const posts = await CommunityPost.find({ communityId: params.id }).sort({ createdAt: -1 }).lean();
  const messages = await CommunityMessage.find({ communityId: params.id }).sort({ createdAt: 1 }).limit(50).lean();
  
  const data = JSON.parse(JSON.stringify({
    community,
    posts,
    messages,
    isMember
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={session?.user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <CommunityView data={data} user={session?.user} />
      </main>
      <Footer />
    </div>
  );
}
