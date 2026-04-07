import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../../../lib/auth';

// In-memory presence store (resets on server restart — good for dev/small scale)
// For production use Redis or a DB with TTL
const presenceStore: Map<string, number> = new Map();
const ONLINE_THRESHOLD_MS = 45_000; // 45 seconds

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await decrypt(sessionToken.value);
    const email = payload.user?.email;
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

    // Update heartbeat timestamp
    presenceStore.set(email, Date.now());

    return NextResponse.json({ ok: true, email, timestamp: Date.now() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailsParam = searchParams.get('emails');
    if (!emailsParam) return NextResponse.json({ presence: {} });

    const emails = emailsParam.split(',').filter(Boolean);
    const now = Date.now();

    const presence: Record<string, 'online' | 'away' | 'offline'> = {};
    for (const email of emails) {
      const lastSeen = presenceStore.get(email);
      if (!lastSeen) {
        presence[email] = 'offline';
      } else {
        const elapsed = now - lastSeen;
        if (elapsed < ONLINE_THRESHOLD_MS) {
          presence[email] = 'online';
        } else if (elapsed < 5 * 60 * 1000) { // 5 minutes = away
          presence[email] = 'away';
        } else {
          presence[email] = 'offline';
        }
      }
    }

    return NextResponse.json({ presence });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
