'use client';

import { useState } from 'react';
import { ListingCard } from './ListingCard';
import PropertyMap from './PropertyMap';
import { LayoutGrid, Map as MapIcon, SlidersHorizontal, ChevronRight, ChevronLeft } from 'lucide-react';

import { ListingFilters } from './ListingFilters';

export default function ListingMapView({ initialListings }: { initialListings: any[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Search Header Extension */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
        <div className="flex-1 w-full max-w-4xl">
           <ListingFilters />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button 
               onClick={() => setViewMode('grid')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-green shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button 
               onClick={() => setViewMode('map')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-green shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
          
          <div className="hidden lg:flex flex-col items-end">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{initialListings.length} homes found</span>
             <div className="h-1 w-12 bg-green rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Listings Sidebar (Only in map mode) */}
        {viewMode === 'map' && (
          <aside 
             className={`bg-white border-r transition-all duration-500 flex flex-col z-10 ${sidebarOpen ? 'w-[450px]' : 'w-0'}`}
          >
             <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
               {initialListings.map(l => (
                 <ListingCard key={l.id} listing={l} horizontal={true} />
               ))}
               {initialListings.length === 0 && (
                 <div className="py-20 text-center">
                    <div className="text-4xl mb-4 grayscale opacity-30">🏠</div>
                    <p className="text-gray-400 font-medium italic text-sm">No results in this area</p>
                 </div>
               )}
             </div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 relative overflow-auto bg-gray-50">
          {viewMode === 'grid' ? (
            <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
               {initialListings.map(l => (
                 <ListingCard key={l.id} listing={l} />
               ))}
            </div>
          ) : (
            <div className="h-full w-full relative animate-fade-in" style={{ minHeight: 'calc(100vh - 160px)' }}>
               <PropertyMap listings={initialListings} height="100%" />
               {/* Collapse Tab */}
               <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-xl z-[25] hover:bg-gray-50 transition-all"
               >
                  {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-charcoal" /> : <ChevronRight className="w-4 h-4 text-charcoal" />}
               </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
