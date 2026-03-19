import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;
    
    const db = getDb();
    const messages = user.role === 'admin' 
      ? db.messages 
      : db.messages.filter((m: any) => m.from === user.email || m.to === user.email);
    
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;
    
    const data = await request.json();
    const db = getDb();
    
    const newMessage = {
      ...data,
      id: generateId(),
      from: user.email,
      fromName: user.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today'
    };
    
    db.messages.push(newMessage);
    saveDb(db);
    
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
