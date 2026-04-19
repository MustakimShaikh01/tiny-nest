import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../../../lib/db';
import { CommunityPost } from '../../../../../../../lib/models';
import { getSession } from '../../../../../../../lib/auth';

// PATCH /api/communities/[id]/posts/[postId]/pin
// Only the post author can pin/unpin an answer
export async function PATCH(req: NextRequest, { params }: { params: { id: string; postId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { commentId } = await req.json();

    await connectDB();
    const post = await CommunityPost.findById(params.postId);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // Only author can pin
    if (post.author !== session.user.email) {
      return NextResponse.json({ error: 'Only the question author can pin an answer.' }, { status: 403 });
    }

    // Toggle pin
    post.pinnedAnswer = post.pinnedAnswer?.toString() === commentId ? null : commentId;
    await post.save();

    return NextResponse.json({ pinnedAnswer: post.pinnedAnswer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
