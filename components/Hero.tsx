'use client';

import { useState } from 'react';
import { Search, MapPin, Tag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Hero() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/listings?q=${encodeURIComponent(search)}&type=${type}`);
  };

  return (
    <section className="relative min-h-[580px] flex items-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green to-[#40916C]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/30 text-white text-xs font-semibold mb-8 backdrop-blur-md animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-green-light animate-pulse"></span>
            🏡 #1 TINY HOUSE MARKETPLACE IN THE USA
          </div>
          
          <h1 className="font-serif text-5xl lg:text-7xl text-white font-bold leading-[1.1] mb-8 animate-slide-up">
            Find Your Perfect <span className="text-green-light underline decoration-white/30 decoration-4 underline-offset-8">Tiny Home</span> & Live Large
          </h1>
          
          <p className="text-lg lg:text-xl text-white/80 font-medium mb-10 max-w-xl animate-slide-up animation-delay-200">
            Browse thousands of tiny houses for sale and rent across America. Join a community of 50,000+ tiny home enthusiasts today.
          </p>

          <form onSubmit={handleSearch} className="bg-white p-2 rounded-tiny shadow-2xl flex flex-col md:flex-row gap-2 animate-slide-up animation-delay-400">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-tiny-sm border border-transparent focus-within:border-green-light focus-within:bg-white transition-all group">
              <MapPin className="text-gray-400 group-focus-within:text-green-light w-5 h-5" />
              <input 
                type="text" 
                placeholder="City, state, or zip code..." 
                className="bg-transparent border-none outline-none w-full text-charcoal font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 bg-gray-50 rounded-tiny-sm border border-transparent md:w-48 group">
              <Tag className="text-gray-400 w-5 h-5" />
              <select 
                className="bg-transparent border-none outline-none w-full text-charcoal font-semibold text-sm h-full py-3"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">Buy or Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary h-auto px-8 justify-center shadow-lg group">
              <Search className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
              Search Homes
            </button>
          </form>

          <div className="mt-12 flex gap-12 text-white/70 animate-fade-in animation-delay-600">
            <div>
              <div className="font-serif text-3xl font-bold text-white mb-1">12,400+</div>
              <div className="text-xs font-bold tracking-widest uppercase opacity-60">Active Listings</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-xs font-bold tracking-widest uppercase opacity-60">Homes Sold</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-white mb-1">15M</div>
              <div className="text-xs font-bold tracking-widest uppercase opacity-60">Monthly Visitors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
