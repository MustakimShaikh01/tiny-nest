'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, ArrowRight, Loader2, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        setUser(userData.user);

        // Fetch All Listings to filter
        const listRes = await fetch('/api/listings?status=approved');
        const listData = await listRes.json();
        const allListings = listData.listings || [];

        // Load favorites from localStorage
        const favIds: string[] = JSON.parse(localStorage.getItem('tinynest_favorites') || '[]');
        
        // Filter based on _id or id
        const favListings = allListings.filter((l: any) => 
          favIds.includes(String(l._id)) || favIds.includes(String(l.id))
        );
        setFavorites(favListings);

        // Recommendations (Similar Listings)
        if (favListings.length > 0) {
          const favTypes = Array.from(new Set(favListings.map((l: any) => l.type)));
          // Suggest listings of same type not in favorites
          const similar = allListings
            .filter((l: any) => 
              l.status === 'approved' && 
              !favIds.includes(String(l._id)) && 
              !favIds.includes(String(l.id))
            )
            .filter((l: any) => favTypes.includes(l.type))
            .slice(0, 6);
          setSimilarListings(similar);
        } else {
          // If no favorites, show 6 most recent
          setSimilarListings(allListings.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = (id: string) => {
    const favIds: string[] = JSON.parse(localStorage.getItem('tinynest_favorites') || '[]');
    let newFavs;
    if (favIds.includes(id)) {
      newFavs = favIds.filter(f => f !== id);
    } else {
      newFavs = [...favIds, id];
    }
    localStorage.setItem('tinynest_favorites', JSON.stringify(newFavs));
    // Trigger re-render of list
    setFavorites(prev => prev.filter(l => (l._id || l.id) !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-green" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={user} />

      <div className="max-w-7xl mx-auto px-4 py-20 w-full flex-1">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-green font-bold text-xs uppercase tracking-widest mb-2">
            <Heart className="w-4 h-4 fill-green" /> Saved Homes
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal tracking-tight">Your Favorites</h1>
          <p className="text-gray-400 mt-3 text-lg font-medium">Manage the tiny houses you've saved for later.</p>
        </header>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((listing: any) => (
              <div key={listing._id || listing.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-tiny-sm overflow-hidden hover:shadow-tiny hover:-translate-y-1 transition-all flex flex-col">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <button 
                    onClick={() => toggleFavorite(listing._id || listing.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-xl hover:scale-110 transition-transform"
                  >
                    <Heart className="w-5 h-5 fill-red-500" />
                  </button>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-charcoal shadow-sm">
                      ${listing.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green uppercase tracking-widest mb-2">
                    <MapPin className="w-3 h-3" /> {listing.location}
                  </div>
                  <h3 className="font-bold text-charcoal text-lg mb-4 line-clamp-1 group-hover:text-green transition-colors">{listing.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                       <span>{listing.beds} Bed</span>
                       <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                       <span>{listing.sqft} sqft</span>
                    </div>
                    <Link href={`/listings/${listing.slug || listing.id || listing._id}`} className="text-green font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-charcoal mb-3">No favorites yet</h2>
            <p className="text-gray-400 max-w-sm mx-auto font-medium mb-8">Start exploring listings and click the heart icon to save the homes you love.</p>
            <Link href="/listings" className="btn btn-primary px-10 py-4 flex items-center justify-center gap-2 mx-auto inline-flex">
              <Search className="w-4 h-4" /> Browse Listings
            </Link>
          </div>
        )}

        {/* Similar Suggestions */}
        <section className="mt-24 pt-16 border-t border-gray-100">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl font-bold text-charcoal tracking-tight">You Might Also Like</h2>
              <p className="text-gray-400 mt-2 text-sm font-medium">Revolving recommendations based on your interests.</p>
            </div>
            <Link href="/listings" className="text-green font-bold text-sm flex items-center gap-1 hover:underline">
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {similarListings.map((listing: any) => (
              <Link key={listing.slug || listing.id || listing._id} href={`/listings/${listing.slug || listing.id || listing._id}`} className="group bg-white rounded-3xl border border-gray-100 shadow-tiny-sm overflow-hidden hover:shadow-tiny transition-all">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="text-[10px] font-bold text-green uppercase tracking-widest mb-1 truncate">{listing.location}</div>
                  <h4 className="font-bold text-charcoal text-sm group-hover:text-green transition-colors mb-3 truncate">{listing.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-green font-serif font-bold text-lg">${listing.price?.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 font-bold">{listing.beds} Bed · {listing.sqft} sqft</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
