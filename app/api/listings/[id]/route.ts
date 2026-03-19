import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';
import { decrypt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const listing = db.listings.find((l: any) => l.id === params.id);
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;

    const db = getDb();
    const listingIndex = db.listings.findIndex((l: any) => l.id === params.id);
    
    if (listingIndex === -1) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const data = await request.json();
    
    // Security: Only admins can approve/reject
    if (data.status && user.role !== 'admin' && data.status !== 'deleted') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    db.listings[listingIndex] = {
      ...db.listings[listingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    saveDb(db);
    
    return NextResponse.json({ listing: db.listings[listingIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
