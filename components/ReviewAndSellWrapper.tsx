'use client';

import { useState } from 'react';
import ReviewAndSell from './ReviewAndSell';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ReviewAndSellWrapper({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleComplete = async (formData: any) => {
    setLoading(true);
    try {
      const listingData = {
        ...formData,
        price: Number(formData.price),
        sqft: Number(formData.sqft),
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        year: Number(formData.year),
        amenities: formData.amenities.split(',').map((s: string) => s.trim()).filter(Boolean),
        location: `${formData.city}, ${formData.state}`,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: 'US'
        },
        img: formData.images[0],
        seller: user.email,
        sellerName: user.name
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/listings'), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="w-12 h-12 text-green animate-spin" />
        <h3 className="text-2xl font-bold text-charcoal">Publishing Your Listing...</h3>
        <p className="text-gray-400 font-medium tracking-tight uppercase text-xs">Finalizing SEO metadata and building Rich Snippets</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-green text-white rounded-full flex items-center justify-center shadow-2xl shadow-green/40">
           <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
           <h3 className="text-3xl font-bold text-charcoal mb-2 leading-tight">Submitted Successfully!</h3>
           <p className="text-gray-500 font-medium max-w-sm mx-auto">Your tiny home is now in the validation queue. We'll notify you when it's live.</p>
        </div>
      </div>
    );
  }

  return <ReviewAndSell user={user} onComplete={handleComplete} />;
}
