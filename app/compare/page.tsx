'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { X, MapPin, Ruler, Bed, ShowerHead, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';

export default function ComparePage() {
  const [user, setUser] = useState<any>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
    
    // Load compare IDs from localStorage
    const ids: string[] = JSON.parse(localStorage.getItem('tinynest_compare') || '[]');
    setCompareIds(ids);
    
    if (ids.length > 0) {
      fetch('/api/listings?status=all')
        .then(r => r.json())
        .then(d => {
          const all = d.listings || [];
          setListings(all.filter((l: any) => ids.includes(l.id || l._id)));
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const removeFromCompare = (id: string) => {
    const ids: string[] = JSON.parse(localStorage.getItem('tinynest_compare') || '[]');
    const updated = ids.filter((i) => i !== id);
    localStorage.setItem('tinynest_compare', JSON.stringify(updated));
    setListings(prev => prev.filter(l => (l.id || l._id) !== id));
    setCompareIds(updated);
  };

  const compareFields = [
    { label: 'Price', render: (l: any) => <span className="text-2xl font-serif font-bold text-green">${l.price?.toLocaleString()}{l.type === 'rent' ? '/mo' : ''}</span> },
    { label: 'Type', render: (l: any) => <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${l.type === 'sale' ? 'bg-green-pale text-green' : 'bg-amber-50 text-amber-600'}`}>{l.type === 'sale' ? 'For Sale' : 'For Rent'}</span> },
    { label: 'Location', render: (l: any) => <span className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-green" />{l.location}</span> },
    { label: 'Sqft', render: (l: any) => <span className="font-bold text-charcoal flex items-center gap-1"><Ruler className="w-4 h-4 text-gray-400" />{l.sqft} ft²</span> },
    { label: 'Bedrooms', render: (l: any) => <span className="font-bold text-charcoal flex items-center gap-1"><Bed className="w-4 h-4 text-gray-400" />{l.beds === 0 ? 'Studio' : `${l.beds} bed`}</span> },
    { label: 'Bathrooms', render: (l: any) => <span className="font-bold text-charcoal flex items-center gap-1"><ShowerHead className="w-4 h-4 text-gray-400" />{l.baths} bath</span> },
    { label: 'Category', render: (l: any) => <span className="text-sm text-gray-600">{l.category || 'Tiny House'}</span> },
    { label: 'Condition', render: (l: any) => <span className="text-sm text-gray-600">{l.condition || 'Good'}</span> },
    { label: 'Status', render: (l: any) => <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${l.status === 'approved' ? 'bg-green-pale text-green' : 'bg-amber-50 text-amber-600'}`}>{l.status}</span> },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={user} />

      <div className="max-w-7xl mx-auto px-4 py-16 flex-1 w-full">
        <div className="mb-8">
          <Link href="/listings" className="flex items-center gap-2 text-green font-bold text-sm hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </Link>
          <span className="text-green font-bold text-xs tracking-widest uppercase mb-2 block">Side by Side</span>
          <h1 className="font-serif text-4xl font-bold text-charcoal">Compare Listings</h1>
          <p className="text-gray-400 font-medium mt-2">
            {listings.length > 0 ? `Comparing ${listings.length} home${listings.length > 1 ? 's' : ''}` : 'No homes selected for comparison yet'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-24 text-center">
            <div className="text-6xl mb-6 grayscale opacity-20">⚡</div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">No listings to compare</h3>
            <p className="text-gray-400 mb-8 font-medium">Browse listings and click the <strong>⊕ Compare</strong> button to add homes here.</p>
            <Link href="/listings" className="btn btn-primary px-10 py-4">Browse Listings</Link>
          </div>
        ) : (
          <div className="relative border border-gray-100 bg-white rounded-3xl shadow-tiny overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <div 
                className="grid p-6 gap-x-6 gap-y-0" 
                style={{ 
                  gridTemplateColumns: `180px repeat(${listings.length < 3 ? listings.length + 1 : listings.length}, minmax(300px, 1fr))`,
                  minWidth: `${180 + ((listings.length < 3 ? listings.length + 1 : listings.length) * 300)}px` 
                }}
              >
                {/* Photo Row */}
                <div className="sticky left-0 z-20 flex items-end pb-6 bg-white">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property</span>
                </div>
                {listings.map((l: any) => (
                  <div key={l.id} className="pb-6 relative group">
                    <div className="bg-gray-50 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all group-hover:shadow-md">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={l.img} alt={l.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <button
                          onClick={() => removeFromCompare(l.id || l._id)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"
                          title="Remove from compare"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="font-serif font-bold text-charcoal text-lg line-clamp-2 mb-3">{l.title}</h3>
                        <Link href={`/listings/${l.id}`} className="inline-flex items-center gap-2 text-xs text-white bg-charcoal px-5 py-2.5 rounded-full font-bold hover:bg-green transition-colors">
                          View Listing →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Add more slot */}
                {listings.length < 3 && (
                  <div className="pb-6">
                    <Link href="/listings" className="border-2 border-dashed border-gray-200 rounded-[2rem] h-full flex flex-col items-center justify-center gap-3 hover:border-green hover:bg-green-pale/30 transition-all group min-h-[300px]">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                        <Plus className="w-8 h-8 text-gray-300 group-hover:text-green transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-green transition-colors uppercase tracking-widest">Add Home</span>
                    </Link>
                  </div>
                )}

                {/* Comparison Rows */}
                {compareFields.map(({ label, render }, idx) => (
                  <div className="contents" key={label}>
                    <div className={`sticky left-0 z-10 flex items-center py-5 bg-white border-t border-gray-50`}>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                    </div>
                    {listings.map((l: any) => (
                      <div key={`${l.id}-${label}`} className={`py-5 flex items-center border-t border-gray-50`}>
                        {render(l)}
                      </div>
                    ))}
                    {listings.length < 3 && <div className={`border-t border-gray-50`} />}
                  </div>
                ))}

                {/* Amenities Row */}
                <div className="contents">
                  <div className="sticky left-0 z-10 flex items-start py-6 bg-white border-t border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amenities</span>
                  </div>
                  {listings.map((l: any) => (
                    <div key={`${l.id}-amenities`} className="py-6 border-t border-gray-50">
                      {l.amenities && l.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(l.amenities) ? l.amenities : typeof l.amenities === 'string' ? l.amenities.split(',') : [])
                            .map((a: string) => a.trim())
                            .filter(Boolean)
                            .map((a: string) => (
                            <span key={a} className="flex items-center gap-1.5 text-xs font-bold text-charcoal bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green" /> {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No amenities listed</span>
                      )}
                    </div>
                  ))}
                  {listings.length < 3 && <div className="border-t border-gray-50" />}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
