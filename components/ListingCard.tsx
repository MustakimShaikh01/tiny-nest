'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Ruler, Bed, ShowerHead, Eye, MessageSquare, Plus } from 'lucide-react';

export function ListingCard({ listing, showActions = false, onApprove, onReject }: { listing: any; showActions?: boolean; onApprove?: () => void; onReject?: () => void }) {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== 'undefined') {
      const favorites = JSON.parse(localStorage.getItem('tinynest_favorites') || '[]');
      return favorites.includes((listing.id || listing._id));
    }
    return false;
  });
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('tinynest_favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favorites.filter((id: string) => id !== (listing.id || listing._id));
    } else {
      updated = [...favorites, (listing.id || listing._id)];
    }
    localStorage.setItem('tinynest_favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/listings/${(listing.id || listing._id)}`;
    navigator.clipboard.writeText(url);
    alert('Listing URL copied to clipboard! Share the tiny living joy.');
  };
  
  const isImageUrl = listing.img && (listing.img.startsWith('http') || listing.img.startsWith('/'));

  return (
    <div className="group bg-white rounded-tiny border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all duration-300 relative overflow-hidden flex flex-col">
      <div className="relative h-64 overflow-hidden block">
        <Link href={`/listings/${(listing.id || listing._id)}`} className="absolute inset-0 bg-gray-100 transition-colors duration-500 flex items-center justify-center">
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
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-green hover:bg-green hover:text-white flex items-center justify-center transition-all duration-300 shadow-xl border border-white/20"
          >
            <Plus className="w-4 h-4" />
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
            <span className="font-serif text-2xl font-bold text-green">
              {listing.type === 'rent' ? `$${listing.price.toLocaleString()}/mo` : `$${listing.price.toLocaleString()}`}
            </span>
          </div>
          <Link href={`/listings/${(listing.id || listing._id)}`} className="block">
            <h3 className="text-xl font-bold text-charcoal mb-2 line-clamp-1 group-hover:text-green transition-colors leading-tight">
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
            <MapPin className="w-4 h-4 text-green-light" />
            {listing.location}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-50 mb-6 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
          <div className="flex flex-col items-center gap-1">
            <Ruler className="w-4 h-4 text-gray-300" />
            <span>{listing.sqft} FT²</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-gray-50">
            <Bed className="w-4 h-4 text-gray-300" />
            <span>{listing.beds === 0 ? 'STUDIO' : `${listing.beds} BED`}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShowerHead className="w-4 h-4 text-gray-300" />
            <span>{listing.baths} BATH</span>
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
    </div>
  );
}
