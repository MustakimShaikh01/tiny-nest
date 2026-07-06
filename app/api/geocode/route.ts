import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json(null);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'Tiny Living Market/1.0' } }
    );
    const data = await res.json();
    if (!data?.[0]) return NextResponse.json(null);
    return NextResponse.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
  } catch {
    return NextResponse.json(null);
  }
}
