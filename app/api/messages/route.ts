import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Message } from '@/lib/models';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;
    
    await connectDB();
    
    // Admins see all for moderation, regular users only see their own
    const query = user.role === 'admin' 
      ? {} 
      : { $or: [{ from: user.email }, { to: user.email }] };
      
    const messages = await Message.find(query).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;
    
    const data = await request.json();
    await connectDB();
    
    const newMessage = new Message({
      ...data,
      from: user.email,
      fromName: user.name,
      status: 'unread'
    });
    
    await newMessage.save();
    
    return NextResponse.json({ message: newMessage });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    const user = payload.user;
    
    const { id, status } = await request.json();
    await connectDB();
    
    const message = await Message.findById(id);
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    
    // Only the receiver can mark as read
    if (message.to !== user.email && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    message.status = status;
    await message.save();
    
    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
