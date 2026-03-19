'use client';

import { useEffect, useRef, useState } from 'react';

// This component uses Leaflet from CDN to avoid npm installation issues
export function PropertyMap({ location, title }: { location: string; title: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let map: any = null;

    const initMap = async () => {
      try {
        // Geocode location using Nominatim (Free OpenStreetMap API)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const geoData = await geoRes.json();
        
        if (!geoData || geoData.length === 0) {
           setError(true);
           setLoading(false);
           return;
        }

        const { lat, lon } = geoData[0];

        // Ensure Leaflet is loaded
        if (!(window as any).L) {
           const script = document.createElement('script');
           script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
           const link = document.createElement('link');
           link.rel = 'stylesheet';
           link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
           document.head.appendChild(link);
           document.head.appendChild(script);

           script.onload = () => {
             setupMap(lat, lon);
           };
        } else {
           setupMap(lat, lon);
        }
      } catch (err) {
        console.error('Map error:', err);
        setError(true);
        setLoading(false);
      }
    };

    const setupMap = (lat: string, lon: string) => {
       const L = (window as any).L;
       if (mapRef.current && !map) {
          map = L.map(mapRef.current).setView([lat, lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          L.marker([lat, lon]).addTo(map)
            .bindPopup(title)
            .openPopup();
            
          setLoading(false);
       }
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [location, title]);

  return (
    <div className="relative w-full h-96 rounded-3xl overflow-hidden border border-gray-100 shadow-tiny-sm">
      <div ref={mapRef} className="w-full h-full z-10" />
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-4 z-20">
           <div className="w-10 h-10 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Map...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-50 flex border-2 border-dashed border-gray-200 items-center justify-center p-8 text-center z-20">
           <div>
              <div className="text-4xl mb-4">📍</div>
              <p className="text-sm font-bold text-gray-400">Map unavailable for this location.<br/>{location}</p>
           </div>
        </div>
      )}
    </div>
  );
}
