import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { CommunityMessage } from '../../../../../lib/models';
import { getSession } from '../../../../../lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const messages = await CommunityMessage.find({ communityId: params.id })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    await connectDB();
    const message = await CommunityMessage.create({
      communityId: params.id,
      sender: session.user.email,
      senderName: session.user.name,
      text
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
