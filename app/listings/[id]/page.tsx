import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { 
  MapPin, Bed, Maximize, Calendar, Share2, Heart, 
  MessageCircle, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { PropertyMap } from '@/components/PropertyMap';

async function getListing(id: string) {
  const db = await getDb();
  // Find by either standard id string or MongoDB _id string
  return db.listings.find((l: any) => 
    String(l.id) === String(id) || 
    String(l._id) === String(id)
  );
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const session = await getSession();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-white">
      <Nav user={user} />

      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        <Link href="/listings" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <div className="aspect-[16/9] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <img src={listing.img} className="w-full h-full object-cover" alt={listing.title} />
              <div className="absolute top-8 left-8 flex gap-3">
                 <span className="px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full text-sm font-bold text-charcoal shadow-xl">
                   ${listing.price.toLocaleString()}
                 </span>
                 <span className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-md ${
                   listing.type === 'sale' ? 'bg-green/90 text-white' : 'bg-earth/90 text-white'
                 }`}>
                   For {listing.type}
                 </span>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-2 text-green text-xs font-bold uppercase tracking-[0.2em]">
                  <MapPin className="w-4 h-4" /> {listing.location}
               </div>
               <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal leading-tight tracking-tight">
                 {listing.title}
               </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
               <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Square Feet</div>
                  <div className="flex items-center gap-2 text-charcoal font-bold">
                    <Maximize className="w-4 h-4 text-green" /> {listing.sqft}
                  </div>
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bedrooms</div>
                  <div className="flex items-center gap-2 text-charcoal font-bold">
                    <Bed className="w-4 h-4 text-green" /> {listing.beds}
                  </div>
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Build Year</div>
                  <div className="flex items-center gap-2 text-charcoal font-bold">
                    <Calendar className="w-4 h-4 text-green" /> {listing.year}
                  </div>
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Condition</div>
                  <div className="flex items-center gap-2 text-charcoal font-bold">
                    <ShieldCheck className="w-4 h-4 text-green" /> Like New
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h2 className="font-serif text-3xl font-bold text-charcoal">Description</h2>
               <p className="text-lg text-gray-500 font-medium leading-relaxed">
                 {listing.description}
               </p>
            </div>

            {/* Map Section */}
            <div className="space-y-6 pt-12 border-t border-gray-100">
               <h2 className="font-serif text-3xl font-bold text-charcoal">Location</h2>
               <PropertyMap location={listing.location} title={listing.title} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-charcoal text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-green/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                    <div className="w-14 h-14 rounded-full bg-green text-white flex items-center justify-center font-serif text-2xl font-bold">
                       {listing.sellerName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Seller</div>
                      <div className="font-bold text-lg flex items-center gap-2">{listing.sellerName} <CheckCircle2 className="w-4 h-4 text-green" /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <Link 
                       href={`/messages?to=${listing.seller}&title=${encodeURIComponent(listing.title)}&listingId=${listing.id}`} 
                       className="btn btn-primary w-full py-5 font-bold flex items-center justify-center gap-3 shadow-xl"
                     >
                       <MessageCircle className="w-5 h-5" /> Message Seller
                     </Link>
                     <button className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-tiny font-bold text-sm transition-all flex items-center justify-center gap-3">
                        <Heart className="w-5 h-5" /> Save to Favorites
                     </button>
                     <button className="w-full py-5 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" /> Share Listing
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-center">
               <div className="text-3xl mb-4">💡</div>
               <h4 className="font-bold text-charcoal mb-2">Buying Tip</h4>
               <p className="text-xs text-gray-400 font-medium leading-relaxed">Most tiny houses sell within 14 days. We recommend messaging the seller early to secure your viewing.</p>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
