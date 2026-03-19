'use client';

import { useState } from 'react';
import { ListingCard } from './ListingCard';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function ModerationList({ initialListings }: { initialListings: any[] }) {
  const [listings, setListings] = useState(initialListings);
  const router = useRouter();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setListings(listings.filter((l: any) => l.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="bg-white p-24 text-center rounded-tiny border border-gray-100 shadow-tiny-sm animate-fade-in">
         <div className="text-6xl mb-6 grayscale opacity-20">✅</div>
         <h3 className="text-xl font-bold text-charcoal mb-2 leading-tight">All caught up!</h3>
         <p className="text-gray-500 font-medium leading-relaxed">There are no listings waiting for global approval at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {listings.map((listing: any) => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          showActions={true} 
          onApprove={() => handleStatusUpdate(listing.id, 'approved')}
          onReject={() => handleStatusUpdate(listing.id, 'rejected')}
        />
      ))}
    </div>
  );
}
