import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

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
    
    // Check if Cloudinary configuration is missing
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here') {
      return NextResponse.json({ error: 'Cloudinary API is not configured yet. Missing environment keys.' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Wire the binary payload stream seamlessly into Cloudinary's uploader system directly
    const imageUrl = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'tinynest-marketplace' }, 
            (error: any, result: any) => {
                if (error || !result) reject(error);
                else resolve(result.secure_url);
            }
        ).end(buffer);
    });

    console.log('--- CLOUDINARY UPLOAD SUCCESS:', imageUrl);
    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    console.error('--- CLOUDINARY UPLOAD ERROR:', error);
    return NextResponse.json({ 
      error: 'Cloudinary Image Upload Failed', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 });
  }
}
