import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { SiteNotification } from '../../../../lib/models';
import { getSession } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    const userEmail = session?.user?.email;

    // Get notifications from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find notifications that are either for everyone (empty targetEmails) or specifically for this user
    const notifications = await SiteNotification.find({
      createdAt: { $gte: yesterday },
      $or: [
        { targetEmails: { $size: 0 } },
        { targetEmails: userEmail }
      ]
    }).sort({ createdAt: -1 }).limit(10).lean();

    return NextResponse.json({ notifications });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
