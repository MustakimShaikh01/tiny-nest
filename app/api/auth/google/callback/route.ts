import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { User } from '../../../../../lib/models';
import { encrypt } from '../../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Base URL detected automatically from the request — works on localhost AND production
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=OAuth+failed`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        // callback URI must match what Google has registered AND what we sent in the initial redirect
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) {
      console.error('[Google OAuth] Token error:', tokens);
      throw new Error(tokens.error_description || tokens.error);
    }

    // 2. Get user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) throw new Error('No email returned from Google');

    // 3. Find or create user
    await connectDB();
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email }] });

    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        googleId: profile.sub,
        avatar: profile.picture || '',
        role: 'buyer',
        status: 'active',
      });
    } else {
      // Link Google ID if signed up with email before
      if (!user.googleId) { user.googleId = profile.sub; }
      if (!user.avatar && profile.picture) { user.avatar = profile.picture; }
      await user.save();
    }

    // 4. Create session JWT cookie
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionToken = await encrypt({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.redirect(`${baseUrl}/profile`);
  } catch (error: any) {
    console.error('[Google OAuth Callback] Error:', error.message);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('Google login failed: ' + error.message)}`);
  }
}
