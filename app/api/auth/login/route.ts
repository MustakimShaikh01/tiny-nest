import { NextResponse } from 'next/server';
import { connectDB, getDb } from '../../../../lib/db';
import { encrypt } from '../../../../lib/auth';
import { verifyPassword } from '../../../../lib/hash';
import { cookies } from 'next/headers';

// Memory store for tracking brute force attack attempts
const loginAttempts = new Map<string, { count: number, lockedUntil: number }>();

export async function POST(request: Request) {
  try {
    const { email: rawEmail, password: rawPassword } = await request.json();
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword.trim();
    
    // Security check: Verify if the user is currently under a Security Lockout
    const lockData = loginAttempts.get(email);
    if (lockData && lockData.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((lockData.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Security alert: Critical brute force attack prevented. Account locked for ${remainingMinutes} more minutes.` }, 
        { status: 423 }
      );
    }

    await connectDB();
    const db = await getDb();
    
    let user;
    try {
      const { User } = require('../../../../lib/models');
      user = await User.findOne({ email }).lean();
    } catch (e) {
      // Fallback
      user = db.users.find((u: any) => u.email === email);
    }
    
    // Final check against JSON if mongo user not found
    if (!user) {
       const fs = require('fs');
       const path = require('path');
       const DB_PATH = path.resolve(process.cwd(), 'db/db.json');
       if (fs.existsSync(DB_PATH)) {
         const fallbackData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
         user = fallbackData.users.find((u: any) => u.email === email);
       }
    }
    
    if (!user || !verifyPassword(password, user.password)) {
      // Log Failure & Lockout tracking
      const current = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      
      if (current.count >= 5) {
        current.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins IP lock
        loginAttempts.set(email, current);
        console.warn(`[SECURITY] Account ${email} locked out due to continuous password failure attacks.`);
      } else {
        loginAttempts.set(email, current);
      }
      
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Success: Clear any security flags
    loginAttempts.delete(email);

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionToken = await encrypt({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    (await cookies()).set('session', sessionToken, { expires, httpOnly: true });

    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
