'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, Edit2, CheckCircle2, Loader2, Save, MapPin, Camera, Heart, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [updating, setUpdating] = useState(false);
  const [pwdMode, setPwdMode] = useState(false);
  const [pwdData, setPwdData] = useState({ newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const router = useRouter();

  const [myListings, setMyListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
      const allListings = listData.listings || [];
      setMyListings(allListings.filter((l: any) => l.seller === data.user.email));
      
      // Load favorites from localStorage and fetch their data
      const favIds: string[] = JSON.parse(localStorage.getItem('tinynest_favorites') || '[]');
      const favListings = allListings.filter((l: any) => favIds.includes(String(l.id || l._id)));
      setFavorites(favListings);
      
      // Suggest similar listings based on type/location of favorites
      if (favListings.length > 0) {
        const favTypes = Array.from(new Set(favListings.map((l: any) => l.type)));
        const favLocations = Array.from(new Set(favListings.map((l: any) => l.location?.split(',')?.pop()?.trim()).filter(Boolean)));
        const similar = allListings
          .filter((l: any) => l.status === 'approved' && !favIds.includes(String(l.id || l._id)))
          .filter((l: any) => favTypes.includes(l.type) || favLocations.some(loc => l.location?.includes(loc)))
          .slice(0, 6);
        setSimilarListings(similar);
      }
      
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        // Save photo to user profile
        await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: data.url }),
        });
        setUser((prev: any) => ({ ...prev, photo: data.url }));
      }
    } catch (err) { console.error(err); }
    finally { setUploadingPhoto(false); }
  };

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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError("Passwords do not match");
      return;
    }
    if (pwdData.newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters");
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, newPassword: pwdData.newPassword })
      });
      if (res.ok) {
        setPwdMode(false);
        setPwdData({ newPassword: '', confirmPassword: '' });
        alert("Password updated successfully!");
      } else {
        const d = await res.json();
        setPwdError(d.error || 'Failed to update password');
      }
    } catch(err) {
      setPwdError('Error updating password');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-green" /></div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={user} />

      <div className="max-w-4xl mx-auto px-4 py-20 flex-1 w-full">
         <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny overflow-hidden flex flex-col md:flex-row">
            {/* Avatar with photo upload */}
            <div className="md:w-1/3 bg-green p-12 flex flex-col items-center text-white text-center">
               <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center font-serif font-bold text-5xl shadow-2xl overflow-hidden border-4 border-white/30">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name[0]}</span>
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 w-9 h-9 bg-white text-green rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-transform" title="Upload photo">
                    {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
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

                    {pwdMode ? (
                      <form onSubmit={handlePasswordUpdate} className="p-8 bg-white rounded-tiny border border-gray-200 mt-6 animate-fade-in shadow-xl">
                         <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6">Update Password</h3>
                         <div className="space-y-4 mb-6">
                            <div>
                               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">New Password</label>
                               <input 
                                 type="password" 
                                 required
                                 value={pwdData.newPassword}
                                 onChange={e => setPwdData({...pwdData, newPassword: e.target.value})}
                                 className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-medium focus:bg-white focus:border-green outline-none" 
                                 placeholder="••••••••"
                               />
                            </div>
                            <div>
                               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Confirm New Password</label>
                               <input 
                                 type="password" 
                                 required
                                 value={pwdData.confirmPassword}
                                 onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})}
                                 className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg font-medium focus:bg-white focus:border-green outline-none" 
                                 placeholder="••••••••"
                               />
                            </div>
                         </div>
                         {pwdError && <p className="text-red-500 text-xs font-bold mb-4">{pwdError}</p>}
                         <div className="flex gap-3">
                            <button type="submit" disabled={pwdLoading} className="btn btn-primary btn-sm flex-1">{pwdLoading ? 'Updating...' : 'Save Password'}</button>
                            <button type="button" onClick={() => { setPwdMode(false); setPwdError(''); }} className="btn bg-gray-100 text-charcoal btn-sm">Cancel</button>
                         </div>
                      </form>
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-tiny border border-gray-100 mt-6">
                         <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-4">Security</h3>
                         <p className="text-gray-500 text-sm mb-6 leading-relaxed">Your account is secured with end-to-end multi-layer encryption.</p>
                         <button 
                           onClick={() => setPwdMode(true)} 
                           className="text-xs font-bold text-green hover:underline uppercase tracking-widest"
                         >
                           Change Password
                         </button>
                      </div>
                    )}
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
               <div className="text-3xl font-bold text-green mb-1">
                 {user.id || user._id ? (typeof (user.id || user._id) === 'string' ? (user.id || user._id).slice(-4) : (user.id || user._id).toString().slice(-4)) : '....'}
               </div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member ID</div>
            </div>
         </div>

          {/* My Listings */}
          <div className="mt-16 space-y-10 mb-10" id="my-listings">
             <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl font-bold text-charcoal tracking-tight">My Listings</h2>
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

          {/* ─── Favorites Section ─── */}
          <div className="mt-16 mb-8" id="favorites">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-green font-bold text-xs tracking-widest uppercase block mb-1">Saved</span>
                <h2 className="font-serif text-3xl font-bold text-charcoal tracking-tight flex items-center gap-3">
                  <Heart className="w-7 h-7 text-red-400 fill-red-400" /> Favorite Listings
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{favorites.length} Saved</span>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((listing: any) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden hover:shadow-tiny hover:-translate-y-0.5 transition-all flex">
                    <div className="w-36 h-full flex-shrink-0 overflow-hidden">
                      <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green uppercase tracking-widest mb-1">
                          <MapPin className="w-3 h-3" /> {listing.location}
                        </div>
                        <h3 className="font-bold text-charcoal text-sm line-clamp-2 group-hover:text-green transition-colors">{listing.title}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-green font-serif">${listing.price?.toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${listing.type === 'sale' ? 'bg-green-pale text-green' : 'bg-amber-50 text-amber-600'}`}>
                          {listing.type === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400 mb-2">No favorites yet.</h3>
                <p className="text-sm text-gray-300 mb-6">Browse listings and click the heart icon to save your favorites.</p>
                <Link href="/listings" className="btn btn-primary px-8 py-3 text-sm">Browse Listings</Link>
              </div>
            )}

            {/* Similar Listings Suggestions */}
            {similarListings.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-2xl font-bold text-charcoal">You Might Also Like</h3>
                  <Link href="/listings" className="flex items-center gap-1 text-sm font-bold text-green hover:underline">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarListings.map((listing: any) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden hover:shadow-tiny hover:-translate-y-1 transition-all">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green uppercase tracking-widest mb-1">
                          <MapPin className="w-3 h-3" /> {listing.location}
                        </div>
                        <h4 className="font-bold text-charcoal text-sm mb-2 line-clamp-1 group-hover:text-green transition-colors">{listing.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green font-serif">${listing.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-400">{listing.beds} bd · {listing.sqft} sqft</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
       </div>

      <Footer />
    </main>
  );
}
