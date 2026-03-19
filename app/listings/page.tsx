import { Suspense } from 'react';
import { Nav } from '@/components/Nav';
import { ListingFilters } from '@/components/ListingFilters';
import { ListingCard } from '@/components/ListingCard';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Tag, SlidersHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';
import path from 'path';

async function getListings(searchParams: any) {
  const db = await getDb();
  
  let listings = (db.listings || []).filter((l: any) => l.status === 'approved');
  
  if (searchParams.type && searchParams.type !== 'all') {
    listings = listings.filter((l: any) => l.type === searchParams.type);
  }
  if (searchParams.location) {
    const loc = searchParams.location.toLowerCase();
    listings = listings.filter((l: any) => l.location.toLowerCase().includes(loc));
  }
  if (searchParams.search) {
    const s = searchParams.search.toLowerCase();
    listings = listings.filter((l: any) => 
      l.title.toLowerCase().includes(s) || 
      l.description.toLowerCase().includes(s)
    );
  }

  return listings;
}

export default async function ListingsPage({ searchParams }: { searchParams: any }) {
  const session = await getSession();
  const listings = await getListings(searchParams);

  return (
    <main className="min-h-screen bg-white">
      <Nav user={session?.user} />
      
      {/* Header & Filters */}
      <section className="bg-gray-50 pt-16 pb-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-10 text-center max-w-2xl mx-auto">
             <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-4 tracking-tight">Browse Tiny Homes</h1>
             <p className="text-gray-500 font-medium text-lg leading-relaxed">
               {listings.length} beautiful homes available for sale and rent across the USA.
             </p>
           </div>

           <Suspense fallback={<div className="bg-white p-8 rounded-tiny text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse border border-gray-100">Loading Filters...</div>}>
              <ListingFilters />
           </Suspense>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center max-w-md mx-auto">
             <div className="text-6xl mb-6 grayscale opacity-50">🏠</div>
             <h3 className="text-2xl font-bold text-charcoal mb-2 leading-tight">No homes found in this search</h3>
             <p className="text-gray-500 font-medium mb-8 leading-relaxed">Try adjusting your filters or area to see more available tiny houses.</p>
             <button className="btn btn-outline border-green group transition-all">Clear All Filters <ArrowUpDown className="w-4 h-4 ml-1" /></button>
          </div>
        )}
      </section>

      {/* Recommended Section */}
      <section className="bg-cream py-24 mb-0">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold text-charcoal mb-8 leading-tight">Can't find what you're looking for?</h2>
            <p className="text-gray-500 font-medium mb-12 max-w-xl mx-auto leading-relaxed">Our team of tiny living experts can help you find exactly what you need. Sign up to get customized alerts when new homes are listed.</p>
            <Link href="/signup" className="btn btn-primary px-12 py-4 shadow-xl">Join the Waitlist</Link>
         </div>
      </section>

      <Footer />
    </main>
  );
}
