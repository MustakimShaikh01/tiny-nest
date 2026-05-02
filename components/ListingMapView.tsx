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
    <div className="flex flex-col h-screen h-[100svh] overflow-hidden bg-white">
      {/* Search Header Extension */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-20 flex-shrink-0">
        <div className="flex-1 w-full max-w-4xl">
           <ListingFilters />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button 
               onClick={() => setViewMode('grid')}
               className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-green shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Grid</span>
            </button>
            <button 
               onClick={() => setViewMode('map')}
               className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-green shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
            >
              <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Map</span>
            </button>
          </div>
          
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{initialListings.length} homes</span>
             <div className="h-1 w-8 bg-green rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Listings Sidebar (Only in map mode) */}
        {viewMode === 'map' && (
          <aside 
             className={`bg-white border-r transition-all duration-500 flex flex-col z-20 absolute inset-y-0 left-0 lg:relative ${sidebarOpen ? 'w-full sm:w-[400px] lg:w-[450px]' : 'w-0 overflow-hidden opacity-0 lg:opacity-100 -translate-x-full lg:translate-x-0'}`}
          >
             <div className="p-4 border-b border-gray-50 flex items-center justify-between lg:hidden">
                <span className="font-bold text-charcoal">{initialListings.length} Results</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
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
        <main className="flex-1 relative overflow-auto bg-gray-50 h-full">
          {viewMode === 'grid' ? (
            <div className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
               {initialListings.map(l => (
                 <ListingCard key={l.id} listing={l} />
               ))}
            </div>
          ) : (
            <div className="h-full w-full relative animate-fade-in">
               <PropertyMap listings={initialListings} height="100%" />
               
               {/* Mobile Switch Layer */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[25] flex items-center gap-2 lg:hidden">
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="px-6 py-3 bg-charcoal text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Show List
                  </button>
               </div>

               {/* Desktop Collapse Tab */}
               <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-gray-200 border-l-0 rounded-r-xl hidden lg:flex items-center justify-center shadow-xl z-[25] hover:bg-gray-50 transition-all hover:w-10 group"
               >
                  {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-charcoal group-hover:-translate-x-0.5 transition-transform" /> : <ChevronRight className="w-4 h-4 text-charcoal group-hover:translate-x-0.5 transition-transform" />}
               </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
