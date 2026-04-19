'use client';

import { useState } from 'react';
import { Search, Plus, Globe, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import CreateCommunityModal from './CreateCommunityModal';

export default function CommunityList({ initialCommunities, user }: { initialCommunities: any[], user?: any }) {
  const [communities, setCommunities] = useState(initialCommunities);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCommunities = communities.filter(c => 
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())) &&
    (areaFilter === '' || c.area.toLowerCase().includes(areaFilter.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input
              type="text"
              placeholder="Filter by area..."
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green text-white font-bold rounded-2xl hover:bg-green-dark transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Create Community</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <Link 
            key={community._id} 
            href={`/community/${community._id}`}
            className="group block bg-white border border-gray-100 rounded-3xl p-6 shadow-tiny-sm hover:shadow-tiny hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-pale/30 rounded-2xl text-green group-hover:bg-green group-hover:text-white transition-colors duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                <Users className="w-3 h-3" /> Area Member
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-green transition-colors">{community.name}</h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-3 min-h-[60px]">{community.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                <MapPin className="w-4 h-4" /> {community.area}
              </div>
              <div className="text-green font-bold text-sm flex items-center gap-1">
                View Community <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-400">No communities found matching your criteria.</h3>
          <p className="text-gray-400 text-sm mt-1">Try a different search term or create one yourself!</p>
        </div>
      )}

      {isModalOpen && (
        <CreateCommunityModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          user={user}
        />
      )}
    </div>
  );
}
