'use client';

import { useState, useEffect } from 'react';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { Mail, Shield, Calendar, MapPin, CheckCircle2, Loader2, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage({ params }: { params: { email: string } }) {
  const [user, setUser] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const decodedEmail = decodeURIComponent(params.email);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session user
        const sessionRes = await fetch('/api/auth/me');
        const sessionData = await sessionRes.json();
        setSessionUser(sessionData.user);

        // Fetch User details (we might need a public API for this, or use the email to filter from all listings)
        // For now, we'll derive some info from listings if no user API
        const listRes = await fetch(`/api/listings?status=approved`);
        const listData = await listRes.json();
        const allListings = listData.listings || [];
        const sellerListings = allListings.filter((l: any) => l.seller === decodedEmail);
        setListings(sellerListings);

        if (sellerListings.length > 0) {
          setUser({
            name: sellerListings[0].sellerName,
            email: decodedEmail,
            role: 'seller',
            joined: 'Mar 2026', // Placeholder
            status: 'active'
          });
        } else {
           // Try to look up user if they have no listings
           // For now just show placeholder
           setUser({ name: decodedEmail.split('@')[0], email: decodedEmail, role: 'member', status: 'active' });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [decodedEmail]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-green" /></div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={sessionUser} />

      <div className="max-w-6xl mx-auto px-4 py-20 flex-1 w-full">
         <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-tiny overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar info */}
            <div className="md:w-1/3 bg-charcoal p-12 flex flex-col items-center text-white text-center">
               <div className="w-32 h-32 rounded-full bg-green text-white flex items-center justify-center font-serif font-bold text-5xl mb-6 shadow-2xl border-4 border-white/10">
                  {user.name[0]}
               </div>
               <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
               <div className="text-green-pale font-bold text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-10 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> {user.role} member
               </div>
               
               <div className="w-full space-y-5 pt-10 border-t border-white/5 text-left">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                     <Mail className="w-4 h-4 text-green-pale" /> {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                     <Calendar className="w-4 h-4 text-green-pale" /> Joined {user.joined || 'Mar 2026'}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <CheckCircle2 className="w-4 h-4 text-green" /> <span className="text-white font-bold">Verified Member</span>
                  </div>
               </div>

               <div className="mt-12 w-full">
                  <Link href={`/messages?with=${user.email}`} className="btn btn-primary w-full py-4 rounded-xl text-xs flex items-center justify-center gap-2">
                    Message Seller
                  </Link>
               </div>
            </div>

            {/* Main Listings */}
            <div className="flex-1 p-12 lg:p-16">
               <div className="flex items-center justify-between mb-12">
                  <h1 className="font-serif text-3xl font-bold text-charcoal tracking-tight">Listings by {user.name}</h1>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">{listings.length} Active</span>
               </div>

               {listings.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {listings.map((listing: any) => (
                       <Link key={listing.slug || listing.id || listing._id} href={`/listings/${listing.slug || listing.id || listing._id}`} className="group bg-white rounded-3xl border border-gray-100 shadow-tiny-sm overflow-hidden hover:shadow-tiny hover:-translate-y-1 transition-all">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img src={listing.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={listing.title} />
                           <div className="absolute top-4 left-4">
                             <span className={`px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-charcoal uppercase tracking-widest shadow-sm`}>
                               ${listing.price?.toLocaleString()}
                             </span>
                           </div>
                        </div>
                        <div className="p-6">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-green uppercase tracking-widest mb-2">
                            <MapPin className="w-3 h-3" /> {listing.location}
                           </div>
                           <h3 className="font-bold text-charcoal mb-4 group-hover:text-green transition-colors line-clamp-1">{listing.title}</h3>
                           <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                              <span>{listing.beds} Bed · {listing.sqft} sqft</span>
                              <ArrowRight className="w-4 h-4 text-green opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                           </div>
                        </div>
                      </Link>
                    ))}
                 </div>
               ) : (
                 <div className="bg-gray-50 rounded-3xl p-20 text-center border border-dashed border-gray-200">
                    <Home className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-400">No active listings yet.</h3>
                    <p className="text-sm text-gray-300 mt-2">Check back later for tiny homes from this seller.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      <Footer />
    </main>
  );
}
