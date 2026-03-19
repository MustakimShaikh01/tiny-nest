import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt, encrypt } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const payload = await decrypt(session.value);
    return NextResponse.json({ user: payload.user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const currentUser = payload.user;

    const data = await request.json();
    const db = getDb();
    
    const userIndex = db.users.findIndex((u: any) => u.id === currentUser.id || u.email === currentUser.email);
    if (userIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Update user in DB
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...data,
      // Ensure role/id/email don't change if not allowed
    };
    
    saveDb(db);

    // Update Session
    const updatedUser = { ...currentUser, ...data };
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: updatedUser, expires });

    cookieStore.set('session', session, { expires, httpOnly: true });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
