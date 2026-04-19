import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth';
import { connectDB } from '../../../../../lib/db';
import { Community, User } from '../../../../../lib/models';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const community = await Community.findById(params.id);
  if (!community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 });
  }

  // Check if already a member
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
     return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.communities?.includes(params.id)) {
    return NextResponse.json({ message: 'Already a member' });
  }

  user.communities = [...(user.communities || []), params.id];
  await user.save();

  return NextResponse.json({ message: 'Joined successfully' });
}
