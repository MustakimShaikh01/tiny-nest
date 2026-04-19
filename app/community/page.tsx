import { getSession } from '../../lib/auth';
import { connectDB } from '../../lib/db';
import { Community } from '../../lib/models';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import CommunityList from '../../components/CommunityList';
import { redirect } from 'next/navigation';

export default async function CommunityPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login?redirect=/community');
  }

  await connectDB();
  const communities = await Community.find({ status: 'approved' }).sort({ createdAt: -1 }).lean();
  
  const serializedCommunities = JSON.parse(JSON.stringify(communities));

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={session?.user} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
            Discover Your <span className="text-green-pale bg-green-900 px-3 py-1 rounded-lg">Community</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            Connect with people in your area, share updates, and participate in community discussions. 
            Standard community living, modernized for the tiny house lifestyle.
          </p>
        </div>
        
        <CommunityList initialCommunities={serializedCommunities} user={session?.user} />
      </main>
      <Footer />
    </div>
  );
}
