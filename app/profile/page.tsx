'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, Edit2, CheckCircle2, Loader2, Save, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const [myListings, setMyListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);
      setFormData({ name: data.user.name });
      
      const listRes = await fetch('/api/listings?status=all');
      const listData = await listRes.json();
      setMyListings(listData.listings.filter((l: any) => l.seller === data.user.email));
      
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-green" /></div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={user} />

      <div className="max-w-4xl mx-auto px-4 py-20 flex-1 w-full">
         <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar/Image */}
            <div className="md:w-1/3 bg-green p-12 flex flex-col items-center text-white text-center">
               <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center font-serif font-bold text-5xl mb-6 shadow-2xl relative group">
                  {user.name[0]}
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Edit2 className="w-6 h-6" />
                  </div>
               </div>
               <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
               <div className="text-green-pale font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-8">
                  {user.role} member
               </div>
               
               <div className="w-full space-y-4 pt-8 border-t border-white/10 text-left">
                  <div className="flex items-center gap-3 text-sm">
                     <Mail className="w-4 h-4 text-green-pale" /> {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <Calendar className="w-4 h-4 text-green-pale" /> Joined {user.joined || 'Mar 2026'}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <Shield className="w-4 h-4 text-green-pale" /> Status: <span className="text-white font-bold">{user.status}</span>
                  </div>
               </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12">
               <div className="flex justify-between items-center mb-10">
                  <h1 className="font-serif text-3xl font-bold text-charcoal">Account Settings</h1>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">Edit Profile</button>
                  ) : (
                    <div className="flex gap-2">
                       <button onClick={() => setEditing(false)} className="btn bg-gray-100 text-charcoal btn-sm">Cancel</button>
                    </div>
                  )}
               </div>

               {editing ? (
                 <form onSubmit={handleUpdate} className="space-y-8 animate-fade-in">
                    <div className="space-y-4">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Display Name</label>
                       <div className="relative flex items-center group">
                          <User className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-green transition-colors" />
                          <input 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" 
                          />
                       </div>
                    </div>
                    
                    <div className="p-4 bg-green-pale/20 rounded-tiny border border-green/10 flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 text-green mt-0.5" />
                       <div className="text-xs text-green font-medium leading-relaxed">
                          Your display name helps buyers and sellers identify you in the marketplace and messaging system.
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                       <button 
                         type="submit" 
                         disabled={updating}
                         className="btn btn-primary px-8 py-4 text-sm font-bold shadow-xl flex items-center justify-center gap-2"
                       >
                         {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                       </button>
                    </div>
                 </form>
               ) : (
                 <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Full Name</label>
                          <p className="text-charcoal font-bold text-lg">{user.name}</p>
                       </div>
                       <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Email Address</label>
                          <p className="text-charcoal font-bold text-lg">{user.email}</p>
                       </div>
                       <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Account Role</label>
                          <p className="text-charcoal font-bold text-lg capitalize">{user.role}</p>
                       </div>
                       <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Verification Level</label>
                          <p className="text-green font-bold text-lg flex items-center gap-2">Verified <CheckCircle2 className="w-4 h-4" /></p>
                       </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-tiny border border-gray-100">
                       <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-4">Security</h3>
                       <p className="text-gray-500 text-sm mb-6 leading-relaxed">Your account is secured with end-to-end multi-layer encryption.</p>
                       <button className="text-xs font-bold text-green hover:underline uppercase tracking-widest">Change Password</button>
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* Stats */}
         <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-tiny border border-gray-100 shadow-tiny-sm text-center">
               <div className="text-3xl font-bold text-green mb-1">{myListings.length}</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Properties Listed</div>
            </div>
            <div className="bg-white p-8 rounded-tiny border border-gray-100 shadow-tiny-sm text-center">
               <div className="text-3xl font-bold text-green mb-1">4.9</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Rating</div>
            </div>
            <div className="bg-white p-8 rounded-tiny border border-gray-100 shadow-tiny-sm text-center text-uppercase">
               <div className="text-3xl font-bold text-green mb-1">{user.id ? user.id.slice(0, 4) : '...' }</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member ID</div>
            </div>
         </div>

         {/* My Properties */}
         <div className="mt-16 space-y-10 mb-20">
            <div className="flex items-center justify-between">
               <h2 className="font-serif text-3xl font-bold text-charcoal tracking-tight">My Properties</h2>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{myListings.length} Total</span>
            </div>

            {myListings.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {myListings.map((listing: any) => (
                    <div key={listing.id} className="bg-white rounded-tiny border border-gray-100 shadow-tiny-sm overflow-hidden group hover:shadow-tiny transition-all">
                       <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                          <img src={listing.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={listing.title} />
                          <div className="absolute top-4 right-4 group-hover:-translate-y-1 transition-transform">
                             <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 backdrop-blur-md ${
                               listing.status === 'approved' ? 'bg-green/90 text-white' : 
                               listing.status === 'pending' ? 'bg-amber-100/90 text-amber-700' : 
                               'bg-red-100/90 text-red-700'
                             }`}>
                                {listing.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : listing.status === 'pending' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                                {listing.status}
                             </div>
                          </div>
                          <div className="absolute bottom-4 left-4">
                             <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-charcoal uppercase tracking-widest shadow-sm">
                                ${listing.price.toLocaleString()}
                             </span>
                          </div>
                       </div>
                       <div className="p-6">
                          <h3 className="font-bold text-charcoal mb-2 group-hover:text-green transition-colors">{listing.title}</h3>
                          <p className="text-xs text-gray-400 font-medium line-clamp-1 flex items-center gap-1 uppercase tracking-widest">
                             <MapPin className="w-3 h-3 text-green" /> {listing.location}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="bg-white border border-dashed border-gray-200 rounded-tiny p-20 text-center">
                  <div className="text-4xl mb-4 grayscale opacity-30">🏠</div>
                  <h3 className="text-lg font-bold text-gray-400">No properties listed yet.</h3>
                  <button onClick={() => router.push('/list-home')} className="text-green text-sm font-bold mt-4 hover:underline">List your first home</button>
               </div>
            )}
         </div>
      </div>

      <Footer />
    </main>
  );
}
