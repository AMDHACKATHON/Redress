import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Complaint from '@/lib/models/Complaint';
import Letter from '@/lib/models/Letter';
import EscalationLetter from '@/lib/models/EscalationLetter';

const ADMIN_EMAIL = 'hello@samkiel.dev';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const [totalUsers, totalComplaints, totalLetters, totalEscalations, users] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Letter.countDocuments(),
      EscalationLetter.countDocuments(),
      User.find({}, 'name email complaintCount createdAt').sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalComplaints,
        totalLetters,
        totalEscalations,
      },
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        complaintCount: u.complaintCount,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
