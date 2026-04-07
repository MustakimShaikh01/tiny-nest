import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';
import { decrypt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    if (payload.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    try {
      const models = require('../../../../lib/models');
      const User = models.User;
      if (User) {
         const updated = await User.findByIdAndUpdate(params.id, data, { new: true });
         if (updated) return NextResponse.json({ success: true, user: updated });
      }
    } catch(e) { /* ignore mongo err */ }

    // JSON Fallback
    const db = await getDb();
    const userIndex = db.users.findIndex((u: any) => String(u._id) === params.id || String(u.id) === params.id);
    
    if (userIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    db.users[userIndex] = {
      ...db.users[userIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await saveDb(db);
    return NextResponse.json({ success: true, user: db.users[userIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await decrypt(sessionToken.value);
    if (payload.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const models = require('../../../../lib/models');
      const User = models.User;
      if (User) {
         // Soft delete
         const updated = await User.findByIdAndUpdate(params.id, { status: 'deleted' }, { new: true });
         if (updated) return NextResponse.json({ success: true, softDeleted: true });
      }
    } catch(e) { /* ignore mongo err */ }

    // JSON Fallback
    const db = await getDb();
    const userIndex = db.users.findIndex((u: any) => String(u._id) === params.id || String(u.id) === params.id);
    
    if (userIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    db.users[userIndex].status = 'deleted';
    await saveDb(db);
    
    return NextResponse.json({ success: true, softDeleted: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
