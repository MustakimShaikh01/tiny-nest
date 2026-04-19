import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Community } from '../../../lib/models';
import { getSession } from '../../../lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    
    const query: any = { status: 'approved' };
    if (area) {
      query.area = { $regex: area, $options: 'i' };
    }
    
    const communities = await Community.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(communities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, area, rules } = await request.json();
    
    if (!name || !description || !area) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const community = await Community.create({
      name,
      description,
      area,
      rules,
      status: 'pending',
      createdBy: session.user.email,
      creatorName: session.user.name
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
