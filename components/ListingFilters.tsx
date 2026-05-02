'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Tag, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type !== 'all') params.set('type', type);
    if (location) params.set('location', location);
    
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl shadow-xl shadow-charcoal/5 border border-gray-100 flex flex-col lg:flex-row gap-1.5 sm:gap-2 w-full">
      <div className="flex-1 flex items-center gap-3 px-4 py-2.5 sm:py-3 bg-gray-50/50 rounded-xl border border-transparent focus-within:border-green/20 focus-within:bg-white transition-all group">
        <Search className="text-gray-300 group-focus-within:text-green w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
        <div className="flex-1 flex flex-col min-w-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5 pointer-events-none">Search</span>
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Keywords, property name..." 
             className="bg-transparent border-none outline-none w-full text-charcoal font-bold text-sm placeholder:text-gray-200 placeholder:font-medium"
           />
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 px-4 py-2.5 sm:py-3 bg-gray-50/50 rounded-xl border border-transparent focus-within:border-green/20 focus-within:bg-white transition-all group">
        <MapPin className="text-gray-300 group-focus-within:text-green w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
        <div className="flex-1 flex flex-col min-w-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5 pointer-events-none">Location</span>
           <input 
             type="text" 
             value={location}
             onChange={(e) => setLocation(e.target.value)}
             placeholder="City, State, Zip..." 
             className="bg-transparent border-none outline-none w-full text-charcoal font-bold text-sm placeholder:text-gray-200 placeholder:font-medium"
           />
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 sm:py-3 bg-gray-50/50 rounded-xl border border-transparent focus-within:border-green/20 focus-within:bg-white transition-all group">
        <div className="flex flex-col min-w-[100px]">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Type</span>
           <select 
             value={type}
             onChange={(e) => setType(e.target.value)}
             className="bg-transparent border-none outline-none font-bold text-sm text-charcoal cursor-pointer appearance-none pr-4"
           >
             <option value="all">All Homes</option>
             <option value="sale">For Sale</option>
             <option value="rent">For Rent</option>
           </select>
        </div>
      </div>

      <button 
        onClick={handleFilter}
        className="px-8 py-3 sm:py-4 bg-green text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-green/20 hover:bg-green-dark hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
      >
        <Search className="w-4 h-4" />
        Find Tiny Homes
      </button>
    </div>
  );
}
