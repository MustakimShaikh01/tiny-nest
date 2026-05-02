import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Community } from '../../../../../lib/models';
import { getSession } from '../../../../../lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const community = await Community.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (status === 'approved') {
      try {
        const { SiteNotification } = require('../../../../../lib/models');
        if (SiteNotification) {
          await SiteNotification.create({
            title: 'New Community Alert! 🤝',
            body: `The ${community.name} community has just been approved! Join the conversation now.`,
            url: `/community/${community.id}`,
            type: 'community'
          });
        }
      } catch (err) { console.error('Notification failed:', err); }
    }

    return NextResponse.json(community);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const community = await Community.findByIdAndDelete(params.id);
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Community deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
