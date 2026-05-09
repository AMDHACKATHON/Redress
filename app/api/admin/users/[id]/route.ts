import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Complaint from '@/lib/models/Complaint';
import Letter from '@/lib/models/Letter';
import EscalationLetter from '@/lib/models/EscalationLetter';
import Message from '@/lib/models/Message';

const ADMIN_EMAIL = 'hello@samkiel.dev';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const complaints = await Complaint.find({ userId: id }).sort({ createdAt: -1 });
    
    const enrichedComplaints = await Promise.all(
      complaints.map(async (c) => {
        const [letter, escalationLetter] = await Promise.all([
          Letter.findOne({ complaintId: c._id }),
          EscalationLetter.findOne({ complaintId: c._id }),
        ]);

        return {
          complaintId: c._id,
          summary: c.summary,
          stage: c.stage,
          letterGenerated: c.letterGenerated,
          escalationGenerated: c.escalationGenerated,
          createdAt: c.createdAt,
          letter,
          escalationLetter,
        };
      })
    );

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        complaintCount: user.complaintCount,
        createdAt: user.createdAt,
      },
      complaints: enrichedComplaints,
    });
  } catch (error: any) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // 1. Find all complaints for this user to get their IDs
    const complaints = await Complaint.find({ userId: id });
    const complaintIds = complaints.map((c) => c._id);

    // 2. Delete related data for all complaints
    await Promise.all([
      EscalationLetter.deleteMany({ complaintId: { $in: complaintIds } }),
      Letter.deleteMany({ complaintId: { $in: complaintIds } }),
      Message.deleteMany({ complaintId: { $in: complaintIds } }),
      Complaint.deleteMany({ userId: id }),
      User.findByIdAndDelete(id),
    ]);

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error: any) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
