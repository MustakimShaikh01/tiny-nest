import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  
  // Basic security headers
  const response = NextResponse.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // In-memory rate limiting against basic spam bots
  const now = Date.now();
  const windowTime = 10000; // 10 seconds tracking window
  const maxRequests = 20;   // 20 requests per 10 seconds limit API
  
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

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
