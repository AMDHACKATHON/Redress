import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userSession = await getSessionUser(req);
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check ownership
    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
