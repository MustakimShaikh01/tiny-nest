'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommunityModeration } from './CommunityModeration';
import Link from 'next/link';
import { ModerationList } from './ModerationList';
import { ListingCard } from './ListingCard';
import {
  Users, Home, MessageSquare, CheckCircle2, LayoutDashboard,
  List, UserCircle, BookOpen, Star, BarChart3, Eye, Edit, Trash2,
  Plus, Search, ChevronRight, Mail, Shield, Calendar, ArrowRight,
  Menu, X, TrendingUp, Activity, Clock, Globe, HelpCircle
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'listings', label: 'Listings', icon: List },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'communities', label: 'Communities', icon: Globe },
  { id: 'posts', label: 'Posts', icon: MessageSquare },
  { id: 'support', label: 'Support', icon: HelpCircle },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminDashboard({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeGuests, setActiveGuests] = useState(12);
  
  const [modal, setModal] = useState<{isOpen: boolean; title: string; text: string; onConfirm: () => void; isDestructive?: boolean}>({
    isOpen: false, title: '', text: '', onConfirm: () => {}
  });

  let { users, listings, messages, blogs, communities, support, pendingListings, session } = data;

  // Safe fallbacks — prevent .filter() crash if any array is missing from props
  users = (users || []).filter((u: any) => u.status !== 'deleted');
  listings = (listings || []).filter((l: any) => l.status !== 'deleted');
  pendingListings = (pendingListings || []).filter((l: any) => l.status !== 'deleted');
  messages = messages || [];
  blogs = blogs || [];
  communities = communities || [];
  support = support || [];

  const router = useRouter();

  // Fix hydration mismatch for dynamic random values
  useEffect(() => {
    setActiveGuests(Math.floor(Math.random() * 50) + 12);
  }, []);

  const confirmAction = (title: string, text: string, onConfirm: () => void, isDestructive = false) => {
    setModal({ isOpen: true, title, text, onConfirm, isDestructive });
  };

  const approvedListings = listings.filter((l: any) => l.status === 'approved');
  const rejectedListings = listings.filter((l: any) => l.status === 'rejected');

  return (
    <div className="flex flex-1 w-full min-h-0" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Dark Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}
        style={{ background: '#111827', minHeight: '100%' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!sidebarCollapsed && (
            <span className="text-white font-bold text-xs uppercase tracking-widest opacity-60">
              Admin
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white/40 hover:text-white transition-colors ml-auto"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={sidebarCollapsed ? tab.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-green text-white shadow-lg'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="truncate">{tab.label}</span>
                )}
                {/* Tooltip on collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-charcoal text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-xl transition-opacity">
                    {tab.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-2 py-4 border-t border-white/10">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            title={sidebarCollapsed ? 'Back to Site' : undefined}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-charcoal mb-1 tracking-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Welcome back, {session?.user?.name?.split(' ')[0]}. Platform is healthy.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-charcoal text-white border border-white/10 rounded-lg px-4 py-2 shadow-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest"><span className="text-green-pale">{activeGuests}</span> Active Guests</span>
              </div>
              <div className="flex items-center gap-2 bg-green-pale/60 border border-green/20 rounded-lg px-4 py-2">
                <span className="w-2 h-2 bg-green rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-green uppercase tracking-widest">Live</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab
              totalUsers={users.length}
              totalListings={listings.length}
              totalMessages={messages.length}
              pendingCount={pendingListings.length}
              pendingListings={pendingListings}
            />
          )}
          {activeTab === 'listings' && <ListingsTab listings={listings} confirmAction={confirmAction} />}
          {activeTab === 'users' && <UsersTab users={users} listings={listings} confirmAction={confirmAction} />}
          {activeTab === 'messages' && <MessagesTab messages={messages} />}
          {activeTab === 'blog' && <BlogTab blogs={blogs} />}
          {activeTab === 'posts' && <CommunityModeration />}
          {activeTab === 'featured' && <FeaturedTab listings={approvedListings} />}
          {activeTab === 'communities' && <CommunitiesTab communities={communities} confirmAction={confirmAction} />}
          {activeTab === 'support' && <SupportTab support={support || []} confirmAction={confirmAction} />}
          {activeTab === 'analytics' && (
            <AnalyticsTab users={users} listings={listings} messages={messages} blogs={blogs} />
          )}
        </div>
      </main>

      {/* Custom Confirm Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-charcoal mb-2">{modal.title}</h3>
            <p className="text-sm text-gray-500 mb-8">{modal.text}</p>
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setModal({ ...modal, isOpen: false })} 
                className="px-4 py-2 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  modal.onConfirm();
                  setModal({ ...modal, isOpen: false });
                }} 
                className={`px-4 py-2 font-bold text-sm rounded-lg text-white transition-colors shadow-lg ${modal.isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-green hover:bg-green-dark'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ OVERVIEW TAB ============ */
function OverviewTab({ totalUsers, totalListings, totalMessages, pendingCount, pendingListings }: any) {
  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+4 this week' },
    { label: 'Total Listings', value: totalListings, icon: Home, color: 'text-green', bg: 'bg-green-pale', trend: `${pendingCount} pending` },
    { label: 'Messages', value: totalMessages, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'All channels' },
    { label: 'Pending Approval', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Needs review' },
  ];

  return (
    <div className="animate-fade-in space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-tiny-sm flex flex-col gap-4 group hover:shadow-tiny hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-charcoal">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal">Pending Approvals</h2>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {pendingCount} NEW
            </span>
          </div>
          <ModerationList initialListings={pendingListings} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-charcoal">Platform Health</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-charcoal">Server Traffic</div>
                  <div className="text-xs text-gray-400 font-medium">Last 24 hours</div>
                </div>
                <span className="text-green font-bold text-sm flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +12%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-green h-full w-[85%] rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400 font-medium mt-1">85% capacity</div>
            </div>
            <div className="border-t border-gray-50 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-charcoal">Moderation Queue</div>
                  <div className="text-xs text-gray-400 font-medium">Avg response time</div>
                </div>
                <span className="text-amber-600 font-bold text-sm">1.5h</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[40%] rounded-full"></div>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-charcoal">Listing Approval Rate</div>
                  <div className="text-xs text-gray-400 font-medium">All time</div>
                </div>
                <span className="text-blue-600 font-bold text-sm">94%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[94%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ LISTINGS TAB ============ */
function ListingsTab({ listings, confirmAction }: any) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = (filter === 'all' ? listings : listings.filter((l: any) => l.status === filter))
    .filter((l: any) => !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase()));

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (err) { console.error(err); }
  };

  const handleDeleteListing = (id: string) => {
    confirmAction(
      "Delete Listing",
      "Are you sure you want to permanently delete this listing? This action cannot be undone.",
      async () => {
        try {
          await fetch(`/api/listings/${id}`, { method: 'DELETE' });
          router.refresh();
        } catch (err) { console.error(err); }
      },
      true
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'approved', 'pending', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? 'bg-green text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
              <span className="ml-2 opacity-60">
                {f === 'all' ? listings.length : listings.filter((l: any) => l.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Title</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Seller</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing: any) => (
              <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-charcoal text-sm">{listing.title}</div>
                  <div className="text-xs text-gray-400">{listing.location}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{listing.sellerName || listing.seller}</td>
                <td className="px-6 py-4 text-sm font-bold text-green">${listing.price?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    listing.status === 'approved' ? 'bg-green-pale text-green' :
                    listing.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>{listing.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {listing.status === 'pending' && (
                      <button onClick={() => handleStatusUpdate(listing.id, 'approved')} className="p-2 bg-green-pale text-green rounded-lg hover:bg-green hover:text-white transition-all" title="Approve">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {(listing.status === 'pending' || listing.status === 'approved') && (
                      <button onClick={() => handleStatusUpdate(listing.id, 'rejected')} className="p-2 bg-amber-50 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteListing(listing.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete listing completely">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link href={`/listings/${listing._id || listing.id}`} className="p-2 bg-gray-100 text-gray-400 hover:text-green rounded-lg hover:bg-gray-50 transition-all" title="View Listing">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-16 text-center text-gray-400 text-sm font-medium">No listings found.</div>
        )}
      </div>
    </div>
  );
}

/* ============ USERS TAB ============ */
function UsersTab({ users, listings, confirmAction }: any) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState('');

  const userListings = selectedUser
    ? listings.filter((l: any) => l.seller === selectedUser.email)
    : [];

  const filteredUsers = users.filter((u: any) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserAction = (id: string, action: string) => {
    confirmAction(
      action === 'delete' ? "Delete User" : action === 'block' ? "Block User" : "Unblock User",
      `Are you sure you want to ${action} this user?`,
      async () => {
        try {
          if (action === 'delete') {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
          } else {
            await fetch(`/api/users/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: action === 'block' ? 'blocked' : 'active' })
            });
          }
          router.refresh();
        } catch (err) { console.error(err); }
      },
      action === 'delete' || action === 'block'
    );
  };

  return (
    <div className="animate-fade-in">
      {selectedUser ? (
        <div>
          <button onClick={() => setSelectedUser(null)} className="text-green font-bold text-sm mb-6 hover:underline flex items-center gap-1">
            ← Back to Users
          </button>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-green text-white flex items-center justify-center font-bold text-2xl">{selectedUser.name[0]}</div>
              <div>
                <h2 className="text-2xl font-bold text-charcoal">{selectedUser.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedUser.email}</span>
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {selectedUser.role}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedUser.joined}</span>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-4">User Listings ({userListings.length})</h3>
            {userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userListings.map((l: any) => (
                  <div key={l.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="font-bold text-charcoal text-sm">{l.title}</div>
                    <div className="text-xs text-gray-400">{l.location} · ${l.price?.toLocaleString()}</div>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      l.status === 'approved' ? 'bg-green-pale text-green' : l.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>{l.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No listings from this user.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal">All Users ({users.length})</h2>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-green transition-colors"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">User</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Activity</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u: any, index: number) => (
                  <tr key={u.id || u._id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center font-bold text-xs">{u.name[0]}</div>
                        <span className="font-bold text-charcoal text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                        u.role === 'seller' ? 'bg-green-pale text-green' :
                        'bg-blue-50 text-blue-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs text-charcoal font-bold">{u.status === 'blocked' ? 'Offline' : 'Active'}</div>
                       <div className="text-[10px] text-gray-400 uppercase tracking-widest">{listings.filter((l: any) => l.seller === u.email).length} listings</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-pale text-green'
                      }`}>{u.status || 'Active'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/my-listings?seller=${encodeURIComponent(u.email)}`} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all" title="View seller profile & listings">
                           <Eye className="w-4 h-4" />
                        </Link>
                        {u.status === 'blocked' ? (
                          <button onClick={() => handleUserAction(u.id || u._id, 'unblock')} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green hover:text-white transition-all" title="Unblock User">
                             <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleUserAction(u.id || u._id, 'block')} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all" title="Block User">
                             <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleUserAction(u.id || u._id, 'delete')} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete User">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ MESSAGES TAB ============ */
function MessagesTab({ messages }: any) {
  const [search, setSearch] = useState('');
  const filtered = messages.filter((m: any) =>
    !search ||
    m.fromName?.toLowerCase().includes(search.toLowerCase()) ||
    m.text?.toLowerCase().includes(search.toLowerCase()) ||
    m.listingTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-charcoal">All Messages ({messages.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <Link href="/messages" className="btn btn-primary btn-sm text-xs">Open Messenger</Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">From</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">To</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Listing</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Message</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m: any) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-charcoal">{m.fromName || m.from}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.toName || m.to}</td>
                <td className="px-6 py-4 text-xs text-green font-bold uppercase tracking-widest truncate max-w-[150px]">{m.listingTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{m.text}</td>
                <td className="px-6 py-4 text-xs text-gray-400">{m.time} · {m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-16 text-center text-gray-400 text-sm font-medium">No messages found.</div>
        )}
      </div>
    </div>
  );
}

/* ============ BLOG TAB ============ */
function BlogTab({ blogs }: any) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-charcoal">Blog Posts ({blogs.length})</h2>
        <Link href="/admin/blog/editor" className="btn btn-primary btn-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {blogs.map((blog: any) => (
          <div key={blog.id} className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm p-6 hover:shadow-tiny transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-green uppercase tracking-widest">{blog.category}</span>
                <h3 className="text-lg font-bold text-charcoal mt-1 group-hover:text-green transition-colors">{blog.title}</h3>
              </div>
              <span className="text-4xl">{blog.emoji}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2">{blog.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{blog.date} · {blog.readTime}</span>
              <Link href={`/admin/blog/editor?id=${blog.id}`} className="text-green font-bold hover:underline flex items-center gap-1">
                Edit <Edit className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {blogs.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-20 text-center">
          <div className="text-4xl mb-4 grayscale opacity-30">📝</div>
          <h3 className="text-lg font-bold text-gray-400">No blog posts yet.</h3>
          <Link href="/admin/blog/editor" className="text-green text-sm font-bold mt-4 hover:underline inline-block">
            Create your first article
          </Link>
        </div>
      )}
    </div>
  );
}

/* ============ FEATURED TAB ============ */
function FeaturedTab({ listings }: any) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Featured Listings ({listings.length})</h2>
          <p className="text-sm text-gray-400 mt-1">Approved listings shown on the homepage.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.slice(0, 6).map((listing: any) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {listings.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-20 text-center">
          <div className="text-4xl mb-4 grayscale opacity-30">⭐</div>
          <h3 className="text-lg font-bold text-gray-400">No featured listings.</h3>
        </div>
      )}
    </div>
  );
}

/* ============ ANALYTICS TAB ============ */
function AnalyticsTab({ users, listings, messages, blogs }: any) {
  const approved = listings.filter((l: any) => l.status === 'approved').length;
  const pending = listings.filter((l: any) => l.status === 'pending').length;
  const rejected = listings.filter((l: any) => l.status === 'rejected').length;
  const sellers = users.filter((u: any) => u.role === 'seller').length;
  const buyers = users.filter((u: any) => u.role === 'buyer').length;
  const admins = users.filter((u: any) => u.role === 'admin').length;

  const totalViews = listings.reduce((sum: number, l: any) => sum + (l.views || 0), 0);
  const totalFavs = listings.reduce((sum: number, l: any) => sum + (l.favorites || 0), 0);
  const avgPrice = Math.round(listings.reduce((s: number, l: any) => s + (l.price || 0), 0) / (listings.length || 1));

  const metrics = [
    { label: 'Total Views', value: totalViews.toLocaleString(), change: '+12%', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Favorites', value: totalFavs.toLocaleString(), change: '+8%', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Blog Posts', value: String(blogs.length), change: '', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Price', value: `$${avgPrice.toLocaleString()}`, change: '', icon: TrendingUp, color: 'text-green', bg: 'bg-green-pale' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-xl font-bold text-charcoal">Platform Analytics</h2>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-tiny-sm hover:shadow-tiny hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                <m.icon className="w-4 h-4" />
              </div>
              {m.change && <span className="text-green font-bold text-sm flex items-center gap-1"><TrendingUp className="w-3 h-3" />{m.change}</span>}
            </div>
            <div className="text-3xl font-serif font-bold text-charcoal">{m.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-tiny-sm">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green" /> Listing Status Breakdown
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Approved', count: approved, color: 'bg-green', total: listings.length },
              { label: 'Pending', count: pending, color: 'bg-amber-400', total: listings.length },
              { label: 'Rejected', count: rejected, color: 'bg-red-400', total: listings.length },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>{item.label}</span>
                  <span>{item.count} <span className="text-gray-300">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-tiny-sm">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 text-green" /> User Breakdown
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Sellers', count: sellers, color: 'bg-green', total: users.length },
              { label: 'Buyers', count: buyers, color: 'bg-blue-400', total: users.length },
              { label: 'Admins', count: admins, color: 'bg-purple-400', total: users.length },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>{item.label}</span>
                  <span>{item.count} <span className="text-gray-300">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${users.length ? (item.count / users.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Summary */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-tiny-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green" /> Engagement Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: users.length, suffix: 'accounts' },
              { label: 'All Listings', value: listings.length, suffix: 'properties' },
              { label: 'Total Messages', value: messages.length, suffix: 'sent' },
              { label: 'Blog Articles', value: blogs.length, suffix: 'published' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-serif font-bold text-charcoal">{item.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{item.label}</div>
                <div className="text-[10px] text-gray-300 font-medium mt-0.5">{item.suffix}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
/* ============ COMMUNITIES TAB ============ */
function CommunitiesTab({ communities, confirmAction }: any) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const filtered = communities
    .filter((c: any) => filter === 'all' || c.status === filter)
    .filter((c: any) => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.area?.toLowerCase().includes(search.toLowerCase()));

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/communities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (err) { console.error(err); }
  };

  const handleDeleteCommunity = (id: string) => {
    confirmAction(
      "Delete Community",
      "Are you sure you want to permanently delete this community? All posts and messages will remain but the community will be gone.",
      async () => {
        try {
          await fetch(`/api/admin/communities/${id}`, { method: 'DELETE' });
          router.refresh();
        } catch (err) { console.error(err); }
      },
      true
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'approved', 'pending', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? 'bg-green text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
              <span className="ml-2 opacity-60">
                {f === 'all' ? communities.length : communities.filter((c: any) => c.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Name</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Area</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Creator</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((community: any) => (
              <tr key={community.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-charcoal text-sm">{community.name}</div>
                  <div className="text-xs text-gray-400 truncate max-w-[200px]">{community.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{community.area}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{community.creatorName}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    community.status === 'approved' ? 'bg-green-pale text-green' :
                    community.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>{community.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {community.status === 'pending' && (
                      <button onClick={() => handleStatusUpdate(community.id, 'approved')} className="p-2 bg-green-pale text-green rounded-lg hover:bg-green hover:text-white transition-all" title="Approve">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {(community.status === 'pending' || community.status === 'approved') && (
                      <button onClick={() => handleStatusUpdate(community.id, 'rejected')} className="p-2 bg-amber-50 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteCommunity(community.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete community">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link href={`/community/${community._id || community.id}`} className="p-2 bg-gray-100 text-gray-400 hover:text-green rounded-lg hover:bg-gray-50 transition-all" title="View Community Board">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-16 text-center text-gray-400 text-sm font-medium">No communities found.</div>
        )}
      </div>
    </div>
  );
}

/* ============ SUPPORT TAB ============ */
function SupportTab({ support, confirmAction }: any) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = (support || [])
    .filter((s: any) => filter === 'all' || s.status === filter)
    .filter((s: any) => !search || 
        s.subject?.toLowerCase().includes(search.toLowerCase()) || 
        s.email?.toLowerCase().includes(search.toLowerCase()) || 
        s.supportId?.includes(search)
    );

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'in-progress', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? 'bg-green text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
              <span className="ml-2 opacity-60">
                {f === 'all' ? support.length : support.filter((s: any) => s.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Message</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-400">#{s.supportId}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-charcoal text-sm">{s.name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-400">{s.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-charcoal max-w-[150px] truncate" title={s.subject}>{s.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={s.message}>{s.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      s.status === 'open' ? 'bg-amber-50 text-amber-600' :
                      s.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-pale text-green'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <select 
                         value={s.status}
                         onChange={(e) => handleStatusUpdate(s._id || s.id, e.target.value)}
                         className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-green transition-colors"
                       >
                         <option value="open">Open</option>
                         <option value="in-progress">In Progress</option>
                         <option value="resolved">Resolved</option>
                       </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center">
              <HelpCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 text-sm font-medium">No support inquiries found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
