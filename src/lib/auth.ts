import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'super-secret-key-portal-cms-enterprise-2025'
);

export const COOKIE_NAME = 'cms_session';
export const TEMP_COOKIE_NAME = 'cms_temp_mfa';

export interface UserSessionPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  mfaVerified: boolean;
}

export interface TempMfaPayload {
  id: number;
  email: string;
  purpose: 'mfa_verify' | 'mfa_setup';
}

export async function signSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function signTempToken(payload: TempMfaPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET_KEY);
}

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as T;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken<UserSessionPayload>(token);
  if (!payload || !payload.mfaVerified) return null;

  return payload;
}

export async function getTempUser(): Promise<TempMfaPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEMP_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyToken<TempMfaPayload>(token);
}
