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
    <div className="bg-white p-3 rounded-tiny shadow-tiny border border-gray-100 flex flex-col lg:flex-row gap-2 max-w-5xl mx-auto">
      <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-tiny-sm border border-transparent focus-within:border-green-light focus-within:bg-white transition-all group">
        <Search className="text-gray-400 group-focus-within:text-green-light w-5 h-5" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search homes..." 
          className="bg-transparent border-none outline-none w-full text-charcoal font-medium"
        />
      </div>

      <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-tiny-sm border border-transparent focus-within:border-green-light focus-within:bg-white transition-all group">
        <MapPin className="text-gray-400 group-focus-within:text-green-light w-5 h-5" />
        <input 
          type="text" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (City, State)..." 
          className="bg-transparent border-none outline-none w-full text-charcoal font-medium"
        />
      </div>

      <div className="flex items-center gap-4 px-4">
        <select 
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-transparent border-none outline-none font-bold text-xs uppercase tracking-widest text-gray-500 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      <button 
        onClick={handleFilter}
        className="btn btn-primary h-auto px-8 justify-center shadow-lg active:scale-95 transition-transform"
      >
        Find Homes
      </button>
    </div>
  );
}
