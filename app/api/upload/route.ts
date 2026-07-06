import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { generateId } from '../../../lib/db';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Check if Cloudinary configuration is missing or completely default
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Attempt Cloudinary if configured
    if (isCloudinaryConfigured) {
        try {
            const imageUrl = await new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'tinyliving-market' }, 
                    (error: any, result: any) => {
                        if (error || !result) reject(error);
                        else resolve(result.secure_url);
                    }
                ).end(buffer);
            });
            console.log('--- CLOUDINARY UPLOAD SUCCESS:', imageUrl);
            return NextResponse.json({ url: imageUrl });
        } catch (cloudError: any) {
            console.warn('--- CLOUDINARY UPLOAD FAILED, FALLING BACK TO LOCAL STORAGE:', cloudError?.message);
            // Don't return error yet, let it fall through to local storage fallback below!
        }
    }

    // ─── LOCAL STORAGE FALLBACK ENGINE ────────────────────────────────
    const uniqueName = Date.now() + '-' + file.name.replace(/\s+/g, '-');
    
    const uploadDir = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production'
      ? '/opt/render/project/src/public/uploads' 
      : join(process.cwd(), 'public', 'uploads');
      
    const filePath = join(uploadDir, uniqueName);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
    
    console.log('--- LOCAL UPLOAD SUCCESS (Fallback Driven):', filePath);
    return NextResponse.json({ url: `/api/images/${uniqueName}` });

  } catch (error: any) {
    console.error('--- UPLOAD ERROR CRASH:', error);
    return NextResponse.json({ 
      error: 'Image Upload Completely Failed', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 });
  }
}
