import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';

export function createTotp(email: string, secret?: string) {
  // Normalisasi secret di satu tempat: buang whitespace, uppercase
  // (Base32 case-insensitive, lib juga buang spasi & padding sendiri).
  const cleanSecret = secret?.trim().replace(/\s+/g, '').toUpperCase();
  const secretObj = cleanSecret
    ? OTPAuth.Secret.fromBase32(cleanSecret)
    : new OTPAuth.Secret({ size: 20 });

  const totp = new OTPAuth.TOTP({
    issuer: 'PT ITSP',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secretObj,
  });

  return { totp, secretObj };
}

export async function generateMfaSetup(email: string, existingSecret?: string) {
  const { totp, secretObj } = createTotp(email, existingSecret);
  const otpAuthUrl = totp.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 260,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });

  return {
    secret: secretObj.base32,
    otpAuthUrl,
    qrCodeDataUrl,
  };
}

export function getCurrentTotp(secret: string): string {
  try {
    const { totp } = createTotp('verify', secret);
    return totp.generate();
  } catch {
    return '';
  }
}

export function verifyMfaToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim().replace(/\s+/g, '');

  // Hanya terima 6 digit angka (TOTP standar). Kode darurat sudah dihapus
  // agar tidak menjadi backdoor.
  if (!/^\d{6}$/.test(cleanToken)) return false;

  try {
    // Normalisasi secret: buang spasi, paksa uppercase (Base32 case-insensitive)
    const cleanSecret = secret.trim().replace(/\s+/g, '').toUpperCase();
    const { totp } = createTotp('verify', cleanSecret);

    // TOTP memakai Unix epoch (UTC), jadi perbedaan zona waktu TIDAK perlu
    // offset manual ±7 jam / ±1 tahun seperti sebelumnya. Offset besar itu
    // justru membuka jendela replay (kode tahun lalu bisa dipakai lagi)
    // dan melemahkan keamanan tanpa memperbaiki clock-drift.
    const rawWindow = Number(process.env.MFA_WINDOW_STEPS ?? 12);
    const windowSteps =
      Number.isFinite(rawWindow) && rawWindow >= 1 && rawWindow <= 20
        ? Math.floor(rawWindow)
        : 12;

    const delta = totp.validate({
      token: cleanToken,
      timestamp: Date.now(),
      window: windowSteps,
    });
    return delta !== null;
  } catch (error) {
    console.error('MFA validation error:', error);
    return false;
  }
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}
