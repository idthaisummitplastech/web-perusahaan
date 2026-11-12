import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET belum diisi via env (min 32 karakter). Isi file .env - lihat .env.example. Dilarang fallback hardcoded di code.');
  }
  return new TextEncoder().encode(secret);
}

export const COOKIE_NAME = 'cms_session';
export const TEMP_COOKIE_NAME = 'cms_temp_mfa';

/**
 * TTL sesi CMS = 8 jam, sinkron dengan ACCESS_TOKEN_EXPIRE_MINUTES=480 di backend.
 * Satu sumber kebenaran untuk maxAge cookie dan JWT expiration.
 */
export const CMS_SESSION_TTL_SECONDS = 8 * 60 * 60; // 28800

export interface UserSessionPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  mfaVerified: boolean;
  /** First-login enforcement: user harus ganti password dulu. */
  mustChangePassword?: boolean;
  /** First-login enforcement: MFA wajib tapi belum di-setup/verifikasi. */
  mfaRequired?: boolean;
  /** Session version untuk deteksi pencabutan (password change, admin reset). */
  sessionVersion?: number;
}

export interface TempMfaPayload {
  id: number;
  email: string;
  purpose: 'mfa_verify' | 'mfa_setup';
}

/**
 * Cookie options standar untuk cms_session. Konsisten di seluruh codebase.
 * maxAge = CMS_SESSION_TTL_SECONDS = 8 jam.
 */
export function getCmsCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: CMS_SESSION_TTL_SECONDS,
  };
}

export async function signSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CMS_SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function signTempToken(payload: TempMfaPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecretKey());
}

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
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
