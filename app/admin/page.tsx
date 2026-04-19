import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getSession } from '../../lib/auth';
import { getDb } from '../../lib/db';
import AdminDashboard from '../../components/AdminDashboard';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const db = await getDb();
  const pendingListings = db.listings.filter((l: any) => l.status === 'pending');

  const data = {
    users: db.users,
    listings: db.listings,
    messages: db.messages,
    blogs: db.blogs || [],
    communities: db.communities || [],
    pendingListings,
    session,
  };

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
