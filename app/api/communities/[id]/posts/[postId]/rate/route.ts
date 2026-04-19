import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../../../lib/db';
import { CommunityPost } from '../../../../../../../lib/models';
import { getSession } from '../../../../../../../lib/auth';

// POST /api/communities/[id]/posts/[postId]/rate
export async function POST(req: NextRequest, { params }: { params: { id: string; postId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { value } = await req.json();
    if (!value || value < 1 || value > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });

    await connectDB();
    const post = await CommunityPost.findById(params.postId);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // Remove existing rating from this user
    post.ratings = (post.ratings || []).filter((r: any) => r.user !== session.user.email);
    post.ratings.push({ user: session.user.email, value });
    await post.save();

    return NextResponse.json({ ratings: post.ratings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
