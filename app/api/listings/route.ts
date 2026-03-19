import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status') || 'approved';
  const location = searchParams.get('location');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  let listings = db.listings;
  
  if (status !== 'all') {
    listings = listings.filter((l: any) => l.status === status);
  }
  
  if (type && type !== 'all') {
    listings = listings.filter((l: any) => l.type === type);
  }

  if (location) {
    listings = listings.filter((l: any) => l.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (search) {
     const s = search.toLowerCase();
     listings = listings.filter((l: any) => 
       l.title.toLowerCase().includes(s) || 
       l.description.toLowerCase().includes(s) ||
       l.location.toLowerCase().includes(s)
     );
  }

  if (minPrice) {
    listings = listings.filter((l: any) => l.price >= Number(minPrice));
  }

  if (maxPrice) {
    listings = listings.filter((l: any) => l.price <= Number(maxPrice));
  }
  
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(session.value);
    const user = payload.user;
    
    const data = await request.json();
    const db = getDb();
    
    const newListing = {
      ...data,
      id: generateId(),
      status: 'pending',
      views: 0,
      favorites: 0,
      seller: user.email,
      sellerName: user.name,
      createdAt: new Date().toISOString()
    };
    
    db.listings.push(newListing);
    saveDb(db);
    
    return NextResponse.json({ listing: newListing });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
