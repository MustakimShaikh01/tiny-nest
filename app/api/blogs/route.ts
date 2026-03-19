import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '../../../lib/db';
import { decrypt } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const db = await getDb();
  return NextResponse.json({ blogs: db.blogs });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;
    
    const data = await request.json();
    const db = await getDb();
    
    const newBlog = {
      ...data,
      id: generateId(),
      author: user.email,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: data.readTime || '5 min read'
    };
    
    db.blogs.push(newBlog);
    await saveDb(db);
    
    return NextResponse.json({ blog: newBlog });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
