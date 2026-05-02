'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Plus, CheckCircle2, Loader2, Shield, Eye, Clock, Home } from 'lucide-react';

export default function MyListingsPage() {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  const searchParams = useSearchParams();
  const sellerQuery = searchParams.get('seller');

  useEffect(() => {
    const fetchData = async () => {
      let currentUser = null;
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        currentUser = data.user;
        setUser(currentUser);
      } catch (err) {}

      // If no seller query and no user, go login
      if (!sellerQuery && !currentUser) {
        router.push('/login');
        return;
      }

      const listRes = await fetch('/api/listings?status=all');
      const listData = await listRes.json();
      const allListings = listData.listings || [];
      
      // If seller param exists, show that seller's listings, else own
      const targetSeller = sellerQuery || currentUser?.email;
      setListings(allListings.filter((l: any) => l.seller === targetSeller));
      setLoading(false);
    };
    fetchData();
  }, [router, sellerQuery]);

  const filtered = filter === 'all' ? listings : listings.filter((l: any) => l.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-green" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={user} />

      <div className="max-w-5xl mx-auto px-4 py-16 flex-1 w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="text-green font-bold text-xs tracking-widest uppercase block mb-2">{sellerQuery ? 'User Profile' : 'My Account'}</span>
            <h1 className="font-serif text-4xl font-bold text-charcoal tracking-tight">{sellerQuery ? 'Seller Portfolio' : 'My Listings'}</h1>
            <p className="text-gray-400 font-medium mt-2">
              {sellerQuery ? `Viewing listings for ${sellerQuery}` : `${listings.length} ${listings.length === 1 ? 'property' : 'properties'} listed`}
            </p>
          </div>
          {!sellerQuery && (
            <Link href="/list-home" className="btn btn-primary flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> List a New Home
            </Link>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'approved', 'pending', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-green text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
              <span className="ml-2 opacity-60">
                {f === 'all' ? listings.length : listings.filter((l: any) => l.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((listing: any) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-tiny-sm overflow-hidden group hover:shadow-tiny hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={listing.img}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={listing.title}
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-md ${
                        listing.status === 'approved'
                          ? 'bg-green/90 text-white'
                          : listing.status === 'pending'
                          ? 'bg-amber-100/90 text-amber-700'
                          : 'bg-red-100/90 text-red-700'
                      }`}
                    >
                      {listing.status === 'approved' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : listing.status === 'pending' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {listing.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-charcoal uppercase tracking-widest shadow-sm">
                      ${listing.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-charcoal text-lg mb-2 group-hover:text-green transition-colors leading-tight">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 uppercase tracking-widest mb-4">
                    <MapPin className="w-3 h-3 text-green" />
                    {listing.location}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>{listing.beds} beds</span>
                      <span>{listing.sqft} sqft</span>
                    </div>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-green hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Listing
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {filter === 'all' ? 'No properties yet.' : `No ${filter} listings.`}
            </h3>
            <p className="text-gray-300 text-sm font-medium mb-6">
              {filter === 'all'
                ? 'Start selling by listing your first tiny home today.'
                : `You don't have any ${filter} listings right now.`}
            </p>
            {filter === 'all' && (
              <Link href="/list-home" className="btn btn-primary px-8 py-3 shadow-lg">
                <Plus className="w-4 h-4" /> List Your First Home
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
