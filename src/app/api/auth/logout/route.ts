import { NextResponse } from 'next/server';
import { COOKIE_NAME, TEMP_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete(TEMP_COOKIE_NAME);
  return response;
}
