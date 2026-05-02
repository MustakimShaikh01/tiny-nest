import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Support } from '../../../../../lib/models';
import { getSession } from '../../../../../lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { status } = await req.json();

    const updated = await Support.findByIdAndUpdate(params.id, { status }, { new: true }).lean();
    
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating support status:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
