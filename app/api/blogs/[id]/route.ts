import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';
import { decrypt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const blog = db.blogs.find((b: any) => b.id === params.id);
  if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  return NextResponse.json({ blog });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Optional: check permissions
    
    const data = await request.json();
    const db = getDb();
    
    const blogIndex = db.blogs.findIndex((b: any) => b.id === params.id);
    if (blogIndex === -1) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    
    db.blogs[blogIndex] = {
      ...db.blogs[blogIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    saveDb(db);
    
    return NextResponse.json({ blog: db.blogs[blogIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
