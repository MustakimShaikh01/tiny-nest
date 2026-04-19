import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Community, CommunityPost } from '../../../../../lib/models';
import { getSession } from '../../../../../lib/auth';

const BANNED_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+\.[a-z]{2,}/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /(\+?[\d][\s.-]?){7,15}/g,
];
function hasBannedContent(text: string): boolean {
  return BANNED_PATTERNS.some(p => { p.lastIndex = 0; return p.test(text); });
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const posts = await CommunityPost.find({ communityId: params.id, status: 'approved' })
      .sort({ isAnnouncement: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, area, location, isAnnouncement, type, photos } = await request.json();
    if (!title || !content || !area) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    if (hasBannedContent(title + ' ' + content)) {
      return NextResponse.json({ error: 'Links, emails, and phone numbers are not allowed.' }, { status: 400 });
    }

    await connectDB();
    const community = await Community.findById(params.id);
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const finalIsAnnouncement = (isAnnouncement && session.user.email === community.createdBy) || false;

    const post = await CommunityPost.create({
      communityId: params.id,
      communityName: community.name,
      title, content, area,
      location: location || '',
      author: session.user.email,
      authorEmail: session.user.email,
      authorName: session.user.name,
      isAnnouncement: finalIsAnnouncement,
      type: type || 'post',
      photos: photos || [],
      ratings: [],
      comments: [],
      status: 'pending',
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
