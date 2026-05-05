import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await api.post('/auth/token/refresh/', body);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal server error', code: 500 };
    return NextResponse.json(data, { status });
  }
}
