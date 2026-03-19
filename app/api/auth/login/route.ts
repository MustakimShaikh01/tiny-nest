import { NextResponse } from 'next/server';
import { connectDB, getDb } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email: rawEmail, password: rawPassword } = await request.json();
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword.trim();
    
    await connectDB();
    const db = await getDb();
    
    let user;
    try {
      const { User } = require('@/lib/models');
      user = await User.findOne({ email }).lean();
    } catch (e) {
      // Fallback
      user = db.users.find((u: any) => u.email === email);
    }
    
    // Final check against JSON if mongo user not found
    if (!user) {
       user = db.users.find((u: any) => u.email === email);
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionToken = await encrypt({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    (await cookies()).set('session', sessionToken, { expires, httpOnly: true });

    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
