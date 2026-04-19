import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Community } from '../../../../lib/models';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const community = await Community.findById(params.id).lean();
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }
    return NextResponse.json(community);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
