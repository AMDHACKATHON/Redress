import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Complaint from '@/lib/models/Complaint';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const payload = await getAuthUser(authHeader);

    if (!payload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Delete all complaints associated with this user
    await Complaint.deleteMany({ userId: payload.userId });

    // Delete the user
    const result = await User.findByIdAndDelete(payload.userId);

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Profile/delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
