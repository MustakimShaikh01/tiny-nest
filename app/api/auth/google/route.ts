import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  // Auto-detect base URL: works on localhost:3000, localhost:10000, or any production domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${baseUrl}/login?error=Google+OAuth+not+configured`);
  }

  const callbackUrl = `${baseUrl}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid profile email');

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline&` +
    `prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
