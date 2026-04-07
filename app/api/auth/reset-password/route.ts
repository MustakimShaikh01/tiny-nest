import { NextResponse } from 'next/server';
import { connectDB, getDb, saveDb } from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const { email, newPassword, currentPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await connectDB();
    const db = await getDb();
    
    let user;
    let User;
    
    try {
      const models = require('../../../../lib/models');
      User = models.User;
      user = await User.findOne({ email });
    } catch (e) {
      // JSON fallback
      user = db.users.find((u: any) => u.email === email);
    }

    if (!user) {
       // Search purely local backup json
       const fs = require('fs');
       const path = require('path');
       const DB_PATH = path.resolve(process.cwd(), 'db/db.json');
       if (fs.existsSync(DB_PATH)) {
         const fallbackData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
         user = fallbackData.users.find((u: any) => u.email === email);
       }
    }

    if (!user) {
      return NextResponse.json({ error: 'Account not found for this email' }, { status: 404 });
    }

    if (currentPassword && user.password !== currentPassword) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }
    
    // Update Password logic
    try {
        if (User && typeof user.save === 'function') {
           user.password = newPassword;
           await user.save();
        } else {
           // JSON Fallback
           const userIndex = db.users.findIndex((u: any) => u.email === email);
           if (userIndex !== -1) {
              db.users[userIndex].password = newPassword;
              saveDb(db);
           }
        }
    } catch (saveErr) {
        return NextResponse.json({ error: 'Failed to commit password change' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
