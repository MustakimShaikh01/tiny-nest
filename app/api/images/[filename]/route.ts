import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  try {
    // Dynamically resolve the absolute storage directory matching your Render Disk mounts
    const uploadDir = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production'
      ? '/opt/render/project/src/public/uploads' 
      : join(process.cwd(), 'public', 'uploads');

    const filePath = join(uploadDir, params.filename);
    
    const fileBuffer = await readFile(filePath);
    
    // Resolve dynamic Mime Types for browser decoding
    const ext = params.filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
       png: 'image/png',
       jpg: 'image/jpeg',
       jpeg: 'image/jpeg',
       gif: 'image/gif',
       webp: 'image/webp'
    };
    const contentType = mimeTypes[ext!] || 'application/octet-stream';

    // Stream out the binary manually bypassing Next.js static caching limits
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (err) {
    return NextResponse.json({ error: 'Image not found natively on disk.' }, { status: 404 });
  }
}
