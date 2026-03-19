import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { generateId } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uniqueName = `${generateId()}-${file.name.replace(/\s+/g, '-')}`;
    const path = join(process.cwd(), 'public', 'uploads', uniqueName);
    
    await writeFile(path, buffer);
    
    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
