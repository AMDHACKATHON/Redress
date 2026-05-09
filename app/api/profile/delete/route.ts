import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';
import EscalationLetter from '@/lib/models/EscalationLetter';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all complaints owned by the user
    const userComplaints = await Complaint.find({ userId: sessionUser.id });
    const complaintIds = userComplaints.map(c => c._id);

    // Cascade delete everything related to those complaints
    if (complaintIds.length > 0) {
      await Promise.all([
        Message.deleteMany({ complaintId: { $in: complaintIds } }),
        Letter.deleteMany({ complaintId: { $in: complaintIds } }),
        EscalationLetter.deleteMany({ complaintId: { $in: complaintIds } }),
        Complaint.deleteMany({ userId: sessionUser.id })
      ]);
    }

    // Finally, delete the user account
    const deletedUser = await User.findByIdAndDelete(sessionUser.id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
