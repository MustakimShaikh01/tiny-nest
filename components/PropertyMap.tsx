'use client';

import { useEffect, useRef, useState } from 'react';

type TileMode = 'street' | 'satellite';

interface Props {
  listings?: any[];
  location?: string;
  title?: string;
  height?: string;
}

const TILES = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '© Esri | Earthstar Geographics',
  },
};

// Shared geocode cache — calls our server proxy (no cross-origin CSP issues)
const geoCache = new Map<string, { lat: number; lng: number } | null>();
async function geocode(q: string) {
  if (geoCache.has(q)) return geoCache.get(q)!;
  try {
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const v = await r.json();
    geoCache.set(q, v);
    return v as { lat: number; lng: number } | null;
  } catch {
    geoCache.set(q, null);
    return null;
  }
}

// Wait for window.L and window.L.markerClusterGroup to be ready
function waitForLeaflet(timeout = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    const L = (window as any).L;
    if (L?.markerClusterGroup) return resolve(L);
    const start = Date.now();
    const id = setInterval(() => {
      const Lp = (window as any).L;
      if (Lp?.markerClusterGroup) { clearInterval(id); resolve(Lp); }
      else if (Date.now() - start > timeout) {
        clearInterval(id);
        reject(new Error('Leaflet did not load within timeout. Check /leaflet.js and /leaflet.markercluster.js are in /public'));
      }
    }, 50);
  });
}

export default function PropertyMap({ listings, location, title, height = '420px' }: Props) {
  const divRef    = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<any>(null);
  const tileRef   = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const didInit   = useRef(false);

  const [ready, setReady]   = useState(false);
  const [empty, setEmpty]   = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [mode, setMode]     = useState<TileMode>('street');

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    let destroyed = false;

    (async () => {
      try {
        const L = await waitForLeaflet();
        if (destroyed || !divRef.current) return;

        // Leaflet attaches _leaflet_id to the element when a map is created.
        // If it's already there, a map exists — skip.
        if ((divRef.current as any)._leaflet_id) return;

        // Fix the default broken icon path inside the bundled leaflet.js
        if (L.Icon?.Default?.prototype) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconUrl:       '/images/marker-icon.png',
            iconRetinaUrl: '/images/marker-icon-2x.png',
            shadowUrl:     '/images/marker-shadow.png',
          });
        }

        const map = L.map(divRef.current, {
          zoomControl:      false,
          preferCanvas:     true,
          attributionControl: true,
        });
        mapRef.current = map;

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        tileRef.current = L.tileLayer(TILES.street.url, {
          attribution: TILES.street.attr,
          maxZoom: 19,
        }).addTo(map);

        const cluster = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 60,
          iconCreateFunction: (c: any) => L.divIcon({
            className: '',
            html: `<div style="background:#2D6A4F;color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.3)">${c.getChildCount()}</div>`,
            iconSize: [38, 38], iconAnchor: [19, 19],
          }),
        });
        clusterRef.current = cluster;
        map.addLayer(cluster);

        const safeList = Array.isArray(listings) ? listings : [];

        if (safeList.length > 0) {
          const resolved = await Promise.all(
            safeList.map(async (item) => {
              if (!item?.location) return null;
              const pos = await geocode(item.location);
              return pos ? { ...item, ...pos } : null;
            })
          );
          if (destroyed) return;

          const valid = resolved.filter(Boolean) as any[];
          valid.forEach((item) => {
            const price =
              typeof item.price === 'number'
                ? item.price >= 1000 ? `$${(item.price / 1000).toFixed(0)}k` : `$${item.price}`
                : `${item.price || '—'}`;

            const icon = L.divIcon({
              className: '',
              html: `<div style="background:#2D6A4F;color:#fff;padding:5px 11px;border-radius:20px;font-weight:800;font-size:12px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.5);position:relative">${price}<div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #2D6A4F"></div></div>`,
              iconSize: [72, 32], iconAnchor: [36, 32],
            });
            const id = item.id || item._id;
            cluster.addLayer(
              L.marker([item.lat, item.lng], { icon }).bindPopup(
                `<div style="width:210px;font-family:inherit">
                  ${item.img ? `<img src="${item.img}" style="width:100%;height:120px;object-fit:cover;border-radius:10px 10px 0 0;display:block;margin:-14px -14px 10px">` : ''}
                  <div style="font-weight:800;font-size:14px;color:#1a1a1a">${item.title || 'Listing'}</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                    <span style="color:#2D6A4F;font-weight:800">${price}</span>
                    <a href="https://maps.google.com/?q=${encodeURIComponent(item.location)}" target="_blank" style="font-size:11px;color:#2D6A4F;font-weight:bold;background:#D8F3DC;padding:3px 9px;border-radius:20px;text-decoration:none">↗ Directions</a>
                  </div>
                  ${item.location ? `<div style="font-size:11px;color:#888;margin-top:5px">📍 ${item.location}</div>` : ''}
                  ${id ? `<a href="/listings/${id}" style="display:block;margin-top:8px;text-align:center;background:#2D6A4F;color:#fff;padding:6px;border-radius:8px;font-size:12px;font-weight:bold;text-decoration:none">View Listing</a>` : ''}
                </div>`,
                { className: 'leaflet-modern-popup', closeButton: false }
              )
            );
          });

          if (valid.length > 0) {
            map.fitBounds(L.latLngBounds(valid.map((v: any) => [v.lat, v.lng])), { padding: [60, 60], maxZoom: 14 });
          } else {
            map.setView([37.09, -95.71], 4);
            setEmpty(true);
          }
        } else if (location) {
          const pos = await geocode(location);
          if (destroyed) return;
          if (pos) {
            map.setView([pos.lat, pos.lng], 14);
            const pinIcon = L.divIcon({
              className: '',
              html: `<div style="font-size:36px;line-height:1;filter:drop-shadow(0 2px 8px rgba(0,0,0,.3))">📍</div>`,
              iconSize: [36, 36], iconAnchor: [18, 36],
            });
            L.marker([pos.lat, pos.lng], { icon: pinIcon })
              .addTo(map)
              .bindPopup(`<strong>${title || location}</strong>`, { closeButton: false })
              .openPopup();
          } else {
            map.setView([37.09, -95.71], 4);
          }
        } else {
          map.setView([37.09, -95.71], 4);
        }

        if (!destroyed) setReady(true);
      } catch (e: any) {
        console.error('[Map error]', e.message);
        if (!destroyed) { setErrMsg(e.message); setReady(true); }
      }
    })();

    return () => {
      destroyed = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      didInit.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (next: TileMode) => {
    const map = mapRef.current;
    const L = (window as any).L;
    if (!map || !L) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(TILES[next].url, { attribution: TILES[next].attr, maxZoom: 19 }).addTo(map);
    setMode(next);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100" style={{ height }}>

      {/* Leaflet container — must always be in DOM and sized */}
      <div ref={divRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }} />

      {/* Loading spinner */}
      {!ready && !errMsg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f3f4f6' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #2D6A4F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Loading map…</span>
        </div>
      )}

      {/* Error */}
      {errMsg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f3f4f6', padding: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 36 }}>🗺️</span>
          <p style={{ fontWeight: 700, color: '#6b7280', fontSize: 14 }}>Map failed to load</p>
          <p style={{ color: '#9ca3af', fontSize: 12 }}>{errMsg}</p>
        </div>
      )}

      {/* Empty notice */}
      {ready && !errMsg && empty && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(255,255,255,0.9)', borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#6b7280', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
          No listing locations found
        </div>
      )}

      {/* Street / Satellite toggle */}
      {ready && !errMsg && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 9999, display: 'flex', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 4, boxShadow: '0 2px 12px rgba(0,0,0,.15)', backdropFilter: 'blur(6px)' }}>
          {(['street', 'satellite'] as TileMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .15s',
                background: mode === m ? '#1a1a2e' : 'transparent',
                color: mode === m ? '#fff' : '#6b7280',
              }}
            >
              {m === 'street' ? '🗺 Street' : '🛰 Satellite'}
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
