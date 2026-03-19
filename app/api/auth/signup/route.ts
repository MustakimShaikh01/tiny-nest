import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models';
import { encrypt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    await connectDB();
    
    // Check if user exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = new User({
      name,
      email,
      password, // In a real app, hash this!
      role: role || 'buyer'
    });

    await newUser.save();

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: newUser._id, name, email, role: newUser.role }, expires });
    (await cookies()).set('session', session, { expires, httpOnly: true });

    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
