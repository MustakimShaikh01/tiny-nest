import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../../../lib/db';
import { CommunityPost } from '../../../../../../../lib/models';
import { getSession } from '../../../../../../../lib/auth';

const BANNED_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+\.[a-z]{2,}/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /(\+?[\d][\s.-]?){7,15}/g,
];

function hasBannedContent(text: string): boolean {
  return BANNED_PATTERNS.some(p => { p.lastIndex = 0; return p.test(text); });
}

// POST /api/communities/[id]/posts/[postId]/comments
export async function POST(req: NextRequest, { params }: { params: { id: string; postId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Comment text required' }, { status: 400 });

    if (hasBannedContent(text)) {
      return NextResponse.json({ error: 'Links, emails, and phone numbers are not allowed.' }, { status: 400 });
    }

    await connectDB();
    const post = await CommunityPost.findById(params.postId);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const comment = {
      _id: new (require('mongoose').Types.ObjectId)(),
      text,
      authorEmail: session.user.email,
      authorName: session.user.name,
      createdAt: new Date(),
    };
    post.comments = [...(post.comments || []), comment];
    await post.save();

    return NextResponse.json({ comments: post.comments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
