'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Ruler, Bed, ShowerHead, Eye, MessageSquare, Plus, Check, ArrowLeftRight } from 'lucide-react';

export function ListingCard({ 
  listing, 
  showActions = false, 
  onApprove, 
  onReject,
  horizontal = false 
}: { 
  listing: any; 
  showActions?: boolean; 
  onApprove?: () => void; 
  onReject?: () => void;
  horizontal?: boolean;
}) {
  // Start false on server, read localStorage after mount to avoid hydration mismatch
  const [isFavorite, setIsFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const id = String(listing.id || listing._id);
    const favorites = JSON.parse(localStorage.getItem('tinyliving_favorites') || '[]');
    setIsFavorite(favorites.includes(id));
    const compare = JSON.parse(localStorage.getItem('tinyliving_compare') || '[]');
    setInCompare(compare.includes(id));
  }, [listing.id, listing._id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = String(listing.id || listing._id);
    const favorites = JSON.parse(localStorage.getItem('tinyliving_favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favorites.filter((fid: string) => fid !== id);
    } else {
      updated = [...favorites, id];
    }
    localStorage.setItem('tinyliving_favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = String(listing.id || listing._id);
    const url = `${window.location.origin}/listings/${id}`;
    navigator.clipboard.writeText(url);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2500);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = String(listing.id || listing._id);
    const compare: string[] = JSON.parse(localStorage.getItem('tinyliving_compare') || '[]');
    if (compare.includes(id)) {
      const updated = compare.filter(i => i !== id);
      localStorage.setItem('tinyliving_compare', JSON.stringify(updated));
      setInCompare(false);
    } else {
      if (compare.length >= 3) {
        alert('You can compare up to 3 listings at a time. Remove one first.');
        return;
      }
      compare.push(id);
      localStorage.setItem('tinyliving_compare', JSON.stringify(compare));
      setInCompare(true);
      router.push('/compare');
    }
  };
  
  const isImageUrl = listing.img && (listing.img.startsWith('http') || listing.img.startsWith('/'));

  return (
    <div className={`group bg-white rounded-tiny border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all duration-300 relative overflow-hidden flex ${horizontal ? 'flex-row h-48' : 'flex-col min-h-[400px]'}`}>
      <div className={`relative overflow-hidden block ${horizontal ? 'w-48 h-full' : 'h-64'}`}>
        <Link href={`/listings/${(listing.slug || listing.id || listing._id)}`} className="absolute inset-0 bg-gray-100 transition-colors duration-500 flex items-center justify-center">
           {isImageUrl ? (
             <img 
               src={listing.img} 
               alt={listing.title} 
               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
             />
           ) : (
             <span className="text-8xl opacity-80 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
               {listing.img || '🏠'}
             </span>
           )}
        </Link>
        
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
           <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl backdrop-blur-md ${listing.type === 'sale' ? 'bg-green/90' : 'bg-earth/90'}`}>
             {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
           </span>
           {listing.status === 'pending' && (
             <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-amber-500/90 shadow-2xl backdrop-blur-md">
               Pending Approval
             </span>
           )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500 z-10">
          <button 
            onClick={toggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border border-white/20 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-md text-charcoal hover:bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={handleCompare}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl border border-white/20 ${inCompare ? 'bg-blue-500 text-white' : 'bg-white/90 text-green hover:bg-green hover:text-white'}`}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {inCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
          
          <Link 
            href={`/messages?to=${listing.seller}&listingId=${(listing.id || listing._id)}&title=${encodeURIComponent(listing.title)}`}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-green hover:bg-green hover:text-white flex items-center justify-center transition-all duration-300 shadow-xl border border-white/20"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-baseline gap-1 mb-2">
            <span className={`${horizontal ? 'text-lg' : 'text-2xl'} font-serif font-bold text-green`}>
              {listing.type === 'rent' ? `$${listing.price?.toLocaleString()}/mo` : `$${listing.price?.toLocaleString()}`}
            </span>
          </div>
          <Link href={`/listings/${(listing.slug || listing.id || listing._id)}`} className="block">
            <h3 className={`${horizontal ? 'text-base' : 'text-xl'} font-bold text-charcoal mb-2 line-clamp-1 group-hover:text-green transition-colors leading-tight`}>
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
            <MapPin className="w-4 h-4 text-green-light" />
            {listing.location}
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-2 py-4 border-y border-gray-50 ${horizontal ? 'mb-2' : 'mb-6'} text-gray-400 font-bold text-[10px] uppercase tracking-widest`}>
          <div className="flex flex-col items-center gap-1">
            <Ruler className="w-4 h-4 text-gray-300" />
            <span className="truncate max-w-full">{listing.sqft} FT²</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-gray-50">
            <Bed className="w-4 h-4 text-gray-300" />
            <span className="truncate max-w-full">{listing.beds === 0 ? 'STUDIO' : `${listing.beds} BED`}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShowerHead className="w-4 h-4 text-gray-300" />
            <span className="truncate max-w-full">{listing.baths} BATH</span>
          </div>
        </div>

        {showActions ? (
          <div className="flex gap-3">
            <button onClick={onApprove} className="flex-1 btn btn-primary btn-sm justify-center py-3">Approve</button>
            <button onClick={onReject} className="btn bg-gray-100 text-charcoal hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-tiny-sm text-xs font-bold uppercase tracking-widest transition-all">Reject</button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-md">
                 {listing.sellerName ? listing.sellerName[0] : 'U'}
               </div>
               <span className="text-sm font-bold text-charcoal/70 tracking-tight">{listing.sellerName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{listing.views}</span>
            </div>
          </div>
        )}
      </div>

      {/* Center Modal overlay for Share Copy */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm shadow-2xl transition-all duration-300 pointer-events-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(false); }}>
            <div className="bg-white px-8 py-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3 w-full max-w-sm animate-in zoom-in-95 fade-in duration-300">
               <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green border border-green-100 mb-2">
                  <Check className="w-8 h-8" />
               </div>
               <h4 className="font-serif text-2xl font-bold text-charcoal text-center mt-2">Link Copied</h4>
               <p className="text-[15px] font-medium text-gray-400 text-center leading-relaxed">
                 The URL is safely on your clipboard. Paste it anywhere to share this tiny home.
               </p>
            </div>
        </div>
      )}
    </div>
  );
}
