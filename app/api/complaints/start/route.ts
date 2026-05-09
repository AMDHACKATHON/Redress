import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { summary } = await req.json();
    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    await connectDB();

    // Create new complaint
    const complaint = await Complaint.create({
      userId: (session.user as any).id,
      summary,
      stage: 'understand',
      letterGenerated: false,
      escalationGenerated: false,
    });

    // Increment user's complaint count
    await User.findByIdAndUpdate((session.user as any).id, {
      $inc: { complaintCount: 1 },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    console.error('Error starting complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
