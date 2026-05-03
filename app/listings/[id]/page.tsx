import type { Metadata } from 'next';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getDb } from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { notFound } from 'next/navigation';
import {
  MapPin, Bed, ShowerHead, Maximize, Calendar, Share2, Heart,
  MessageCircle, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight, Home, Ruler
} from 'lucide-react';
import Link from 'next/link';
import PropertyMap from '../../../components/PropertyMap';
import { ListingActions } from '../../../components/ListingActions';
import { ListingCard } from '../../../components/ListingCard';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinynest.com';

async function getListing(id: string) {
  const db = await getDb();
  return db.listings.find((l: any) =>
    String(l.id) === String(id) ||
    String(l._id) === String(id)
  );
}

// Dynamic SEO metadata per listing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListing(params.id);

  if (!listing) {
    return {
      title: 'Listing Not Found | TinyNest',
      description: 'This listing could not be found.',
    };
  }

  const title = listing.metaTitle || `${listing.title} – ${listing.type === 'sale' ? 'For Sale' : 'For Rent'} in ${listing.location} | TinyNest`;
  const description = listing.metaDesc || `${listing.title} – ${listing.sqft} sqft, ${listing.beds} bed tiny home ${listing.type === 'sale' ? 'for sale' : 'for rent'} in ${listing.location}. $${listing.price.toLocaleString()}${listing.type === 'rent' ? '/mo' : ''}. ${listing.description?.slice(0, 100)}`;
  const canonical = listing.slug ? `${siteUrl}/listings/${listing.slug}` : `${siteUrl}/listings/${listing.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [
        {
          url: listing.img?.startsWith('http') ? listing.img : `${siteUrl}${listing.img}`,
          width: 800,
          height: 600,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [listing.img?.startsWith('http') ? listing.img : `${siteUrl}${listing.img}`],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const session = await getSession();
  const user = session?.user;

  // Get similar homes
  const db = await getDb();
  const similarListings = (db.listings || [])
    .filter((l: any) => l.status === 'approved' && String(l.id) !== String(params.id))
    .slice(0, 3);

  // JSON-LD: RealEstateListing / Product schema
  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': listing.type === 'rent' ? 'Accommodation' : 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${siteUrl}/listings/${listing.id}`,
    image: listing.images?.length
      ? listing.images.map((img: string) => (img.startsWith('http') ? img : `${siteUrl}${img}`))
      : [listing.img?.startsWith('http') ? listing.img : `${siteUrl}${listing.img}`],
    address: listing.address?.street ? {
      '@type': 'PostalAddress',
      streetAddress: listing.address.street,
      addressLocality: listing.address.city,
      addressRegion: listing.address.state,
      postalCode: listing.address.zip,
      addressCountry: listing.address.country || 'US',
    } : {
      '@type': 'PostalAddress',
      addressLocality: listing.location?.split(',')[0]?.trim(),
      addressRegion: listing.location?.split(',')[1]?.trim(),
      addressCountry: 'US',
    },
    numberOfRooms: listing.beds || 0,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: listing.sqft,
      unitCode: 'FTK',
    },
    yearBuilt: listing.year,
    ...(listing.type === 'sale'
      ? {
          offers: {
            '@type': 'Offer',
            price: listing.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            itemCondition: listing.condition === 'New' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
            seller: {
              '@type': 'RealEstateAgent',
              name: listing.sellerName,
            },
          },
        }
      : {
          priceRange: `$${listing.price}/month`,
        }),
    amenityFeature: (listing.amenities || []).map((amenity: string) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Listings', item: `${siteUrl}/listings` },
      { '@type': 'ListItem', position: 3, name: listing.title, item: `${siteUrl}/listings/${listing.id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-white">
        <Nav user={user} />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
          <ol className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <li><Link href="/" className="hover:text-green transition-colors">Home</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li><Link href="/listings" className="hover:text-green transition-colors">Listings</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li className="text-charcoal truncate max-w-[200px]" aria-current="page">{listing.title}</li>
          </ol>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          <Link href="/listings" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" /> Back to listings
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-12">
              <div className="aspect-[16/9] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <img
                  src={listing.img}
                  className="w-full h-full object-cover"
                  alt={`${listing.title} – Tiny home in ${listing.location}`}
                  width={800}
                  height={450}
                  loading="eager"
                />
                <div className="absolute top-8 left-8 flex gap-3">
                  <span className="px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full text-sm font-bold text-charcoal shadow-xl">
                    ${listing.price.toLocaleString()}{listing.type === 'rent' ? '/mo' : ''}
                  </span>
                  <span
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-md ${
                      listing.type === 'sale' ? 'bg-green/90 text-white' : 'bg-earth/90 text-white'
                    }`}
                  >
                    For {listing.type}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-green text-xs font-bold uppercase tracking-[0.2em]">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <address className="not-italic">{listing.location}</address>
                </div>
                <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal leading-tight tracking-tight">
                  {listing.title}
                </h1>
              </div>

              {/* Key Facts */}
              <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-gray-50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100">
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</dt>
                  <dd className="flex items-center gap-2 text-charcoal font-bold">
                    <Home className="w-4 h-4 text-green" aria-hidden="true" /> {listing.category || 'Tiny House'}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Square Feet</dt>
                  <dd className="flex items-center gap-2 text-charcoal font-bold">
                    <Maximize className="w-4 h-4 text-green" aria-hidden="true" /> {listing.sqft} sqft
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bedrooms</dt>
                  <dd className="flex items-center gap-2 text-charcoal font-bold">
                    <Bed className="w-4 h-4 text-green" aria-hidden="true" /> {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bathrooms</dt>
                  <dd className="flex items-center gap-2 text-charcoal font-bold">
                    <ShowerHead className="w-4 h-4 text-green" aria-hidden="true" /> {listing.baths || 1} bath{listing.baths !== 1 ? 's' : ''}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Build Year</dt>
                  <dd className="flex items-center gap-2 text-charcoal font-bold">
                    <Calendar className="w-4 h-4 text-green" aria-hidden="true" /> {listing.year}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Condition</dt>
                  <dd className="flex items-center gap-2 text-charcoal font-bold">
                    <ShieldCheck className="w-4 h-4 text-green" aria-hidden="true" /> {listing.condition || 'Like New'}
                  </dd>
                </div>
                {listing.dimensions && (
                   <div className="space-y-1">
                     <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dimensions</dt>
                     <dd className="flex items-center gap-2 text-charcoal font-bold">
                       <Ruler className="w-4 h-4 text-green" aria-hidden="true" /> {listing.dimensions}
                     </dd>
                   </div>
                )}
              </dl>

              {/* Description */}
              <div className="space-y-6">
                <h2 className="font-serif text-3xl font-bold text-charcoal">About This Home</h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">{listing.description}</p>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl font-bold text-charcoal">Amenities &amp; Features</h2>
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-3" aria-label="Listing amenities">
                    {listing.amenities.map((amenity: string) => (
                      <li key={amenity} className="flex items-center gap-2 text-sm font-medium text-charcoal bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" aria-hidden="true" /> {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Map Section */}
              <div className="space-y-6 pt-12 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-3xl font-bold text-charcoal">Location</h2>
                  <div className="text-xs font-bold text-green uppercase tracking-widest bg-green-pale/30 px-3 py-1 rounded-full">Explore Area</div>
                </div>
                <div className="w-full h-[450px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-tiny-sm">
                  <PropertyMap location={listing.location} title={listing.title} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8" aria-label="Contact seller and actions">
              <div className="bg-charcoal text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-green/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <Link href={`/profile/${encodeURIComponent(listing.seller)}`} className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10 hover:opacity-80 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-green text-white flex items-center justify-center font-serif text-2xl font-bold" aria-hidden="true">
                      {listing.sellerName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Seller</div>
                      <div className="font-bold text-lg flex items-center gap-2">
                        {listing.sellerName} <CheckCircle2 className="w-4 h-4 text-green" aria-label="Verified seller" />
                      </div>
                    </div>
                  </Link>

                  <ListingActions listingId={listing.id} sellerEmail={listing.seller} listingTitle={listing.title} />
                </div>
              </div>

              <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-center">
                <div className="text-3xl mb-4" aria-hidden="true">💡</div>
                <h4 className="font-bold text-charcoal mb-2">Buying Tip</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Most tiny houses sell within 14 days. We recommend messaging the seller early to secure your viewing.
                </p>
                <Link
                  href="https://drive.google.com/file/d/1SWqzToHyludoVLrV2U90fCo17Axj9gRk/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green font-bold text-xs mt-4 hover:underline"
                  aria-label="Download buyer's checklist PDF guide"
                >
                  📄 Download Buyer Checklist <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </aside>
          </div>

          {/* Similar Listings / Auto Suggestions */}
          {similarListings.length > 0 && (
            <div className="mt-24 pt-16 border-t border-gray-100">
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-8">Similar Homes You Might Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarListings.map((l: any) => (
                  <ListingCard key={l.id || l._id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}
