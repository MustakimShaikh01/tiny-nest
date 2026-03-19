import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email: rawEmail, password } = await request.json();
    const email = rawEmail.trim().toLowerCase();
    const db = getDb();
    
    console.log('Login attempt:', email);
    const user = db.users.find((u: any) => u.email.toLowerCase() === email && u.password === password);
    
    if (!user) {
      console.log('User not found or password mismatch for:', email);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionToken = await encrypt({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, { expires, httpOnly: true });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
