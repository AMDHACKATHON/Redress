import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get('Authorization');
    const response = await api.get(`/complaints/${id}/letter/`, {
      headers: { Authorization: token ?? '' }
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal server error', code: 500 };
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get('Authorization');
    const response = await api.post(`/complaints/${id}/letter/generate/`, {}, {
      headers: { Authorization: token ?? '' }
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal server error', code: 500 };
    return NextResponse.json(data, { status });
  }
}
