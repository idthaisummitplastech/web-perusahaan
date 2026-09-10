/**
 * Sentral URL runtime via env — ganti domain cukup sentuh .env.
 * Tanpa hardcoded localhost/domain di code (fail-fast bila dipakai & kosong).
 *
 * Env yang dipakai (lihat .env.example):
 *  - BACKEND_API_URL            (wajib, server-only, contoh http://localhost:8004/api/v1)
 *  - NEXT_PUBLIC_CAREER_URL     (wajib untuk link publik karir, contoh http://localhost:3009)
 *  - CAREER_SITE_URL            (alias server-side untuk NEXT_PUBLIC_CAREER_URL, dipakai di compose)
 *  - NEXT_PUBLIC_COMPANY_URL    (opsional, canonical company, contoh http://localhost:3008)
 *  - NEXTAUTH_URL / COMPANY_SITE_URL (alias server-side untuk company URL)
 */

function readEnv(name: string): string {
  const v = process.env[name];
  return (v ?? '').trim();
}

function requiredEnv(name: string, altNames: string[] = []): string {
  const primary = readEnv(name);
  if (primary) return primary;
  for (const alt of altNames) {
    const v = readEnv(alt);
    if (v) return v;
  }
  throw new Error(
    `${name} belum diisi via env. Isi file .env — lihat .env.example. ` +
      `Ganti URL cukup via env, tanpa ubah code.`
  );
}

function stripTrailingSlash(v: string): string {
  return v.replace(/\/+$/, '');
}

/** Backend base tanpa trailing slash, selalu berakhiran /api/v1. */
export function getBackendBaseUrl(): string {
  const raw = stripTrailingSlash(requiredEnv('BACKEND_API_URL'));
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

/** URL publik portal karir (dipakai halaman Careers gateway). */
export function getCareerUrl(): string {
  // Dukung dua nama agar fleksibel: NEXT_PUBLIC_* (client) & CAREER_SITE_URL (compose/server).
  return stripTrailingSlash(requiredEnv('NEXT_PUBLIC_CAREER_URL', ['CAREER_SITE_URL']));
}

/** URL publik company profile (untuk canonical / email). */
export function getCompanyUrl(): string {
  return stripTrailingSlash(requiredEnv('NEXT_PUBLIC_COMPANY_URL', ['NEXTAUTH_URL', 'COMPANY_SITE_URL']));
}

