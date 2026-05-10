import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (complaint.stage === 'understand') {
      return NextResponse.json(
        { error: 'You can only mark a complaint as resolved after a letter has been drafted.', code: 409 },
        { status: 409 }
      );
    }
    if (complaint.stage === 'resolved') {
      return NextResponse.json(complaint);
    }

    complaint.stage = 'resolved';
    complaint.resolvedAt = new Date();
    await complaint.save();

    // Drop a system note into the chat so the timeline reflects the change
    try {
      await Message.create({
        complaintId: id,
        role: 'agent',
        content: 'Complaint marked as resolved. Glad it worked out — you can always start a fresh complaint from the dashboard if anything else comes up.',
      });
    } catch (e) {
      console.error('Failed to log resolution message:', e);
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Error resolving complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Reopen — flip back to whichever stage makes sense
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
    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (complaint.stage !== 'resolved') {
      return NextResponse.json(complaint);
    }

    complaint.stage = complaint.escalationGenerated ? 'escalate' : 'draft';
    complaint.resolvedAt = null;
    await complaint.save();

    try {
      await Message.create({
        complaintId: id,
        role: 'agent',
        content: 'Complaint reopened. What would you like to do next?',
      });
    } catch (e) {
      console.error('Failed to log reopen message:', e);
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Error reopening complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
