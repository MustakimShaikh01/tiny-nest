import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';

const rateLimitMap = new Map();

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  
  // Basic security headers
  const response = NextResponse.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src * data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss: ws:; form-action 'self'; frame-src 'self' https://accounts.google.com;");
  // API Security System (Only runs on API paths)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowTime = 10000;
    const maxRequests = 20;   
    
    if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    const data = rateLimitMap.get(ip);
    if (now - data.startTime > windowTime) {
      data.count = 1;
      data.startTime = now;
    } else {
      data.count++;
      if (data.count > maxRequests) {
        // Attack detected, blocking gracefully
        console.warn(`[SECURITY] Blocked potential bot/DDOS from IP: ${ip}`);
        return new NextResponse(
          JSON.stringify({ error: 'Security Firewall: Suspicious traffic load detected. You have been temporarily blocked.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Cross-Site Scripting & SQL Injection basic boundary detection
  const decodedUrl = decodeURIComponent(request.url).toLowerCase();
  const suspiciousKeywords = ['<script>', 'select * from', 'drop table', 'union select', 'javascript:'];
  if (suspiciousKeywords.some(kw => decodedUrl.includes(kw))) {
      console.warn(`[SECURITY] Blocked malicious payload attempt from IP: ${ip}`);
      return new NextResponse(
          JSON.stringify({ error: 'Security Firewall: Malicious query payload detected and terminated.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Frontend Authentication Route Protector
  const protectedRoutes = ['/profile', '/admin', '/messages', '/my-listings', '/list-home'];
  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  if (isProtected) {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      // Reject and bounce directly to the login gate for any protected UI access attempting bypass
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify JWT signature to ensure it is authentic and hasn't expired.
      // We import jwtVerify dynamically or directly use jose.
      const secretKey = process.env.JWT_SECRET || 'tinyliving-secret-key-donotuseinprod';
      const key = new TextEncoder().encode(secretKey);
      await jwtVerify(sessionCookie.value, key);
    } catch (e) {
      // If signature is invalid or token expired, redirect to login
      console.warn(`[SECURITY] Invalid JWT token detected from IP: ${ip}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|og-image).*)'],
};
