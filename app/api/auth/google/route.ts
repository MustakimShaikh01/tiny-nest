import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId || clientId === 'add_your_client_id_here') {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Missing GOOGLE_CLIENT_ID in environment." }, 
      { status: 500 }
    );
  }

  // Dynamically resolve the callback URL whether on localhost or production
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
