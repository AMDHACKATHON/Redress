import { NextResponse } from 'next/server';

export async function POST() {
  // Client-side logout handles token removal from localStorage.
  // This endpoint exists for completeness — could be extended 
  // for token blacklisting if needed.
  return NextResponse.json({ message: 'Logged out successfully' });
}
