import { Nav } from '@/components/Nav';
import { ListingFilters } from '@/components/ListingFilters';
import { ListingCard } from '@/components/ListingCard';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Search, MapPin, Tag, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

async function getListings(searchParams: any) {
  const query = new URLSearchParams(searchParams).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings?${query}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.listings;
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

           <ListingFilters />
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
