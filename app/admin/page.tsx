import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ModerationList } from '@/components/ModerationList';
import { Users, Home, MessageSquare, CheckCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const db = getDb();
  const pendingListings = db.listings.filter((l: any) => l.status === 'pending');
  const totalUsers = db.users.length;
  const totalListings = db.listings.length;
  const totalMessages = db.messages.length;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={session.user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-12">
           <h1 className="font-serif text-4xl font-bold text-charcoal mb-4 tracking-tight">Admin Dashboard</h1>
           <p className="text-gray-500 font-medium">Platform overview and moderation center. Keep TinyNest safe and vibrant.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-fade-in">
           {[
             { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Total Listings', value: totalListings, icon: Home, color: 'text-green', bg: 'bg-green-pale' },
             { label: 'Total Messages', value: totalMessages, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
             { label: 'Pending Approval', value: pendingListings.length, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-tiny border border-gray-100 shadow-tiny-sm flex items-center gap-6 group hover:shadow-tiny transition-all">
                <div className={`w-14 h-14 rounded-tiny flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</div>
                   <div className="text-3xl font-serif font-bold text-charcoal">{stat.value}</div>
                </div>
             </div>
           ))}
        </div>

        {/* Content Tabs Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-charcoal">Pending Approvals</h2>
                 <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{pendingListings.length} NEW</span>
              </div>

              <ModerationList initialListings={pendingListings} />
           </div>

           <div className="space-y-8">
              <h2 className="text-2xl font-bold text-charcoal">Platform Health</h2>
              <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny-sm p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-charcoal uppercase tracking-widest leading-none mb-1">Server Traffic</div>
                      <div className="text-xs text-gray-500 font-medium">Last 24 hours</div>
                    </div>
                    <span className="text-green font-bold text-sm">+12%</span>
                 </div>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-green h-full w-[85%] rounded-full shadow-lg"></div>
                 </div>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <div className="text-sm font-bold text-charcoal uppercase tracking-widest leading-none mb-1">Moderation Queue</div>
                      <div className="text-xs text-gray-500 font-medium">Avg response time</div>
                    </div>
                    <span className="text-amber-600 font-bold text-sm underline decoration-amber-100 decoration-2 underline-offset-4 tracking-tighter">1.5 HRS</span>
                 </div>

                 <button className="w-full btn bg-charcoal text-white py-3 mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors">
                    Export Platform Data
                 </button>
              </div>
           </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
