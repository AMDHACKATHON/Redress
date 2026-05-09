import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';

export async function GET(req: NextRequest) {
  try {
    const userSession = await getSessionUser(req);
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const complaints = await Complaint.find({ userId: userSession.id })
      .sort({ createdAt: -1 });

    return NextResponse.json(complaints);
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
