import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, avatar, country } = body;

    // Update fields if provided
    if (name !== undefined) {
      user.name = name.trim();
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    if (country !== undefined) {
      user.country = country;
    }

    await user.save();

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      country: user.country,
      complaint_count: user.complaintCount,
      created_at: user.createdAt,
    });
  } catch (error: unknown) {
    console.error('Profile/update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
