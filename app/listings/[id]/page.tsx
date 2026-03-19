import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { MapPin, Ruler, Bed, ShowerHead, Calendar, CheckCircle2, MessageSquare, ArrowRight, Star, Heart } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getListing(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.listing;
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const listing = await getListing(params.id);

  if (!listing) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Nav user={session?.user} />

      <section className="bg-gray-50 pt-12 pb-24 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-10 flex items-center justify-between">
              <Link href="/listings" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-green transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" /> Back to listings
              </Link>
              <div className="flex gap-3">
                 <button className="p-3 bg-white border border-gray-200 rounded-tiny-sm shadow-tiny-sm hover:shadow-tiny transition-all"><Heart className="w-4 h-4 text-gray-400" /></button>
                 <button className="p-3 bg-white border border-gray-200 rounded-tiny-sm shadow-tiny-sm hover:shadow-tiny transition-all font-bold text-xs uppercase tracking-widest text-charcoal">Share Listing</button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Media Container */}
              <div className="space-y-6">
                 <div className="aspect-[4/3] bg-gray-100 rounded-tiny shadow-2xl flex items-center justify-center relative overflow-hidden group">
                    {listing.img && (listing.img.startsWith('http') || listing.img.startsWith('/')) ? (
                      <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <span className="text-[160px] opacity-80 group-hover:scale-105 transition-transform duration-700">{listing.img || '🏠'}</span>
                    )}
                    <div className="absolute top-6 left-6 flex gap-3">
                       <span className="px-5 py-2 bg-green shadow-xl text-white font-bold text-xs uppercase tracking-widest rounded-full">{listing.type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                       <span className="px-5 py-2 bg-white/90 backdrop-blur-md shadow-xl text-charcoal font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-500 fill-current" /> Verified Home
                       </span>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-tiny hover:opacity-80 transition-opacity cursor-pointer"></div>
                    ))}
                 </div>
              </div>

              {/* Info Container */}
              <div className="space-y-12">
                 <div>
                    <div className="text-3xl lg:text-5xl font-serif font-bold text-green mb-4 mb-2 tracking-tight">
                        {listing.type === 'rent' ? `$${listing.price.toLocaleString()}/mo` : `$${listing.price.toLocaleString()}`}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
                       <MapPin className="w-4 h-4 text-green-light" /> {listing.location} · 24 SALES IN AREA
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-charcoal mb-8 leading-tight">{listing.title}</h1>
                    
                    <div className="flex flex-wrap gap-4 mb-10">
                       {[
                         { icon: Ruler, val: `${listing.sqft} FT²`, lbl: 'TOTAL AREA' },
                         { icon: Bed, val: listing.beds === 0 ? 'STUDIO' : `${listing.beds} BED`, lbl: 'SLEEP CAPACITY' },
                         { icon: ShowerHead, val: `${listing.baths} BATH`, lbl: 'FULL BATHS' },
                         { icon: Calendar, val: listing.year, lbl: 'YEAR BUILT' }
                       ].map((spec, i) => (
                         <div key={i} className="flex-1 min-w-[140px] bg-white border border-gray-100 p-6 rounded-tiny shadow-tiny-sm hover:shadow-tiny transition-all">
                            <spec.icon className="w-5 h-5 text-green-light mb-4" />
                            <div className="text-lg font-bold text-charcoal leading-none mb-1">{spec.val}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{spec.lbl}</div>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Home Description</h3>
                       <p className="text-gray-500 font-medium text-lg leading-relaxed">{listing.description}</p>
                    </div>
                 </div>

                 {/* Seller Card */}
                 <div className="bg-white p-8 rounded-tiny border border-gray-100 shadow-tiny-sm">
                    <div className="flex items-center gap-6 mb-8 group">
                       <div className="w-16 h-16 rounded-full bg-green text-white flex items-center justify-center font-serif font-bold text-2xl shadow-xl group-hover:scale-105 transition-transform duration-300">
                          {listing.sellerName[0]}
                       </div>
                       <div>
                          <div className="text-xl font-bold text-charcoal mb-1 flex items-center gap-2">
                             {listing.sellerName} <CheckCircle2 className="w-5 h-5 text-green-light" />
                          </div>
                          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verified Multi-Unit Seller</div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <Link 
                         href={`/messages?to=${listing.seller}&listingId=${listing.id}&title=${encodeURIComponent(listing.title)}`} 
                         className="w-full btn btn-primary py-5 justify-center shadow-xl hover:-translate-y-1 transition-all"
                       >
                          <MessageSquare className="w-5 h-5 mr-2" /> Message Seller
                       </Link>
                       <button className="w-full btn bg-white border-2 border-green text-green px-10 py-4 font-bold rounded-tiny shadow-sm hover:bg-green-pale transition-all">Request Individual Viewing</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <h2 className="font-serif text-3xl font-bold text-charcoal mb-12">Amenities & Standard Features</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
            {listing.amenities.map((amenity: string, i: number) => (
              <div key={i} className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-tiny bg-green-pale text-green flex items-center justify-center shrink-0 group-hover:bg-green group-hover:text-white transition-colors duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                 </div>
                 <span className="text-lg font-semibold text-gray-500 group-hover:text-charcoal transition-colors">{amenity}</span>
              </div>
            ))}
         </div>
      </section>

      <Footer />
    </main>
  );
}
