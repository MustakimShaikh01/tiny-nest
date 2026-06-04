import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';
import { decrypt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  const listing = db.listings.find((l: any) => String(l.id) === params.id || String(l._id) === params.id || l.slug === params.id);
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

    const data = await request.json();
    
    // Security: Only admins can perform raw modifications, except soft-deletions which are restricted
    if (data.status && user.role !== 'admin' && data.status !== 'deleted') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const models = require('../../../../lib/models');
      const Listing = models.Listing;
      if (Listing) {
         const mongoose = require('mongoose');
         const isObjectId = mongoose.Types.ObjectId.isValid(params.id);
         const query = isObjectId ? { _id: params.id } : { slug: params.id };
         const updated = await Listing.findOneAndUpdate(query, data, { new: true });
         if (updated) {
            if (data.status === 'approved') {
               const { SiteNotification } = require('../../../../lib/models');
               if (SiteNotification) {
                  await SiteNotification.create({
                     title: 'New Home Listed! 🏠',
                     body: `${updated.title} just hit the market in ${updated.location}.`,
                     url: `/listings/${updated.slug || updated.id}`,
                     type: 'listing'
                  });
               }
            }
            return NextResponse.json({ listing: updated });
         }
      }
    } catch(e) { /* ignore mongo err */ }

    // Fallback JSON Update
    const db = await getDb();
    const listingIndex = db.listings.findIndex((l: any) => String(l.id) === params.id || String(l._id) === params.id || l.slug === params.id);
    
    if (listingIndex === -1) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    db.listings[listingIndex] = {
      ...db.listings[listingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await saveDb(db);
    return NextResponse.json({ listing: db.listings[listingIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    if (payload.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Try MongoDB
    try {
      const models = require('../../../../lib/models');
      const Listing = models.Listing;
      if (Listing) {
        // Soft delete
        const mongoose = require('mongoose');
        const isObjectId = mongoose.Types.ObjectId.isValid(params.id);
        const query = isObjectId ? { _id: params.id } : { slug: params.id };
        const updated = await Listing.findOneAndUpdate(query, { status: 'deleted' }, { new: true });
        if (updated) return NextResponse.json({ success: true, softDeleted: true });
      }
    } catch(e) { /* ignore mongo err */ }

    // Fallback JSON Update
    const db = await getDb();
    const listingIndex = db.listings.findIndex((l: any) => String(l.id) === params.id || String(l._id) === params.id || l.slug === params.id);
    
    if (listingIndex === -1) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    db.listings[listingIndex].status = 'deleted';
    await saveDb(db);
    
    return NextResponse.json({ success: true, softDeleted: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
