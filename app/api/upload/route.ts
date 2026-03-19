import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { generateId } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.warn('--- UPLOAD: No file received');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uniqueName = `${generateId()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Use the persistent disk path if on Render, otherwise use local public/uploads
    const uploadDir = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production'
      ? '/opt/render/project/src/public/uploads' 
      : join(process.cwd(), 'public', 'uploads');
      
    console.log('--- UPLOAD ATTEMPT:', { dir: uploadDir, file: uniqueName });
    
    const filePath = join(uploadDir, uniqueName);
    
    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true });
    
    await writeFile(filePath, buffer);
    
    console.log('--- UPLOAD SUCCESS:', filePath);
    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (error: any) {
    console.error('--- UPLOAD ERROR:', error);
    return NextResponse.json({ 
      error: 'Upload Failed', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 });
  }
}
