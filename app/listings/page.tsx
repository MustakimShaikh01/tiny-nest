import type { Metadata } from 'next';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getSession } from '../../lib/auth';
import { getDb } from '../../lib/db';
import ListingMapView from '../../components/ListingMapView';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinyliving.com';

export const metadata: Metadata = {
  title: 'Tiny Houses for Sale & Rent – Browse 12,400+ Listings | Tiny Living Market',
  description: 'Browse 12,400+ verified tiny house listings across the USA. Filter by price, location, and type.',
  alternates: { canonical: `${siteUrl}/listings` },
};

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
    <main className="min-h-screen bg-white flex flex-col">
      <Nav user={session?.user} />
      
      <div className="flex-1">
        <ListingMapView initialListings={listings} />
      </div>

      <Footer />
    </main>
  );
}
