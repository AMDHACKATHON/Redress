import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';
import EscalationLetter from '@/lib/models/EscalationLetter';
import User from '@/lib/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check ownership
    if (complaint.userId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch messages
    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });

    return NextResponse.json({
      ...complaint.toObject(),
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check ownership
    const userId = (session.user as any).id;
    if (complaint.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete associated data
    await Promise.all([
      Message.deleteMany({ complaintId: id }),
      Letter.deleteOne({ complaintId: id }),
      EscalationLetter.deleteOne({ complaintId: id }),
      Complaint.findByIdAndDelete(id),
    ]);

    // Decrement user's complaint count
    await User.findByIdAndUpdate(userId, {
      $inc: { complaintCount: -1 },
    });

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
