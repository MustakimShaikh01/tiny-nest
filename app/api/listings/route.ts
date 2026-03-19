import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Listing } from '../../../lib/models';
import { decrypt } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'approved';
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    if (status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ listings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(session.value);
    const user = payload.user;
    
    const data = await request.json();
    await connectDB();
    
    const newListing = new Listing({
      ...data,
      status: 'pending',
      views: 0,
      favorites: 0,
      seller: user.email,
      sellerName: user.name
    });
    
    await newListing.save();
    
    return NextResponse.json({ listing: newListing });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
