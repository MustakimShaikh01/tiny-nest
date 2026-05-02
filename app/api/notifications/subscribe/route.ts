import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { PushSubscriptionModel } from '../../../../lib/models';
import { getSession } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const subscription = await req.json();
    const session = await getSession();
    const userEmail = session?.user?.email;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Save or update subscription
    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      { ...subscription, userEmail },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push subscription error:', err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
