'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Share2, Check } from 'lucide-react';

interface ListingActionsProps {
  listingId: string;
  sellerEmail: string;
  listingTitle: string;
}

export function ListingActions({ listingId, sellerEmail, listingTitle }: ListingActionsProps) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // Copy the absolute URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // Basic local state save (in a real app, this would make an API call)
    setSaved(!saved);
  };

  return (
    <div className="space-y-4">
      <Link
        href={`/messages?to=${sellerEmail}&title=${encodeURIComponent(listingTitle)}&listingId=${listingId}`}
        className="btn btn-primary w-full py-5 font-bold flex items-center justify-center gap-3 shadow-xl"
        aria-label={`Message seller about ${listingTitle}`}
      >
        <MessageCircle className="w-5 h-5" aria-hidden="true" /> Message Seller
      </Link>
      
      <button
        onClick={handleSave}
        className={`w-full py-5 rounded-tiny font-bold text-sm transition-all flex items-center justify-center gap-3 ${
          saved ? 'bg-white text-charcoal shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      >
        <Heart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
        {saved ? 'Saved to Favorites' : 'Save to Favorites'}
      </button>

      <button
        onClick={handleShare}
        className="w-full py-5 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        aria-label="Share this listing"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-400" aria-hidden="true" /> Link Copied
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" aria-hidden="true" /> Share Listing
          </>
        )}
      </button>
    </div>
  );
}
