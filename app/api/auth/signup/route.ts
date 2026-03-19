import { NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    const db = getDb();
    
    if (db.users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      id: generateId(),
      name,
      email,
      password, // In a real app, hash this with bcrypt/argon2
      role: role || 'buyer',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      listings: 0,
      status: 'active'
    };

    db.users.push(newUser);
    saveDb(db);

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, expires });

    const cookieStore = await cookies();
    cookieStore.set('session', session, { expires, httpOnly: true });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
