import { NextResponse } from 'next/server';
import { connectDB, getDb, saveDb, generateId } from '../../../../../lib/db';
import { encrypt } from '../../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=Google authentication failed or was cancelled.`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error_description || 'Failed to exchange token');

    // 2. Fetch user profile from Google using the access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();
    if (!googleUser.email) throw new Error('No email returned from Google');

    // 3. System database logic: Check if user exists or create new
    await connectDB();
    const db = await getDb();
    
    let user;
    let fallbackUsed = false;
    
    try {
      const { User } = require('../../../../../lib/models');
      user = await User.findOne({ email: googleUser.email }).lean();
      
      if (!user) {
        // Create new user in Mongo
        const newUser = new User({
          name: googleUser.name,
          email: googleUser.email,
          password: generateId(), // OAuth users don't need a traditional password, generate random hash
          role: 'buyer', // Default to buyer
        });
        await newUser.save();
        user = { _id: newUser._id, name: newUser.name, email: newUser.email, role: 'buyer' };
      }
    } catch (e) {
      fallbackUsed = true;
      user = db.users.find((u: any) => u.email === googleUser.email);
      
      if (!user) {
        user = {
          id: generateId(),
          name: googleUser.name,
          email: googleUser.email,
          password: generateId(),
          role: 'buyer',
          joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
        db.users.push(user);
        await saveDb(db);
      }
    }

    // 4. Generate Session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionToken = await encrypt({ 
      user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role } 
    });
    
    (await cookies()).set('session', sessionToken, { expires, httpOnly: true });

    // 5. Redirect based on role
    if (user.role === 'admin') {
      return NextResponse.redirect(`${origin}/admin`);
    }
    return NextResponse.redirect(`${origin}/profile`);

  } catch (error: any) {
    console.error('[GOOGLE OAUTH ERROR]:', error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/login?error=Google login failed.`);
  }
}
