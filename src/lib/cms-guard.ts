import { NextResponse } from 'next/server';
import type { UserSessionPayload } from '@/lib/auth';

/**
 * 16 Model konten CMS yang dapat ditulis oleh peran 'admin' dan 'marketing'.
 * Identik dengan CMS_CONTENT_MODELS di backend-api.
 */
export const CMS_CONTENT_MODELS: ReadonlySet<string> = new Set([
  'settings',
  'nav-menus',
  'hero-sections',
  'announcements',
  'partners',
  'features',
  'services',
  'products',
  'blog-posts',
  'testimonials',
  'faqs',
  'statistics',
  'certifications',
  'facilities',
  'sustainability-reports',
  'pages',
]);

/** Model sensitif CMS yang hanya boleh dikelola oleh Administrator. */
export const SENSITIVE_CMS_MODELS: ReadonlySet<string> = new Set([
  'users',
  'contacts',
  'admin-menus',
]);

/**
 * Daftar model CMS yang boleh diakses lewat route dinamis /api/cms/[model].
 * Pencocokan EXACT dan case-sensitive (jangan di-lowercase): backend memakai
 * slug.lower(), sehingga nama seperti "Users" tidak boleh lolos ke model sensitif.
 * Model "users" dan "admin-menus" sengaja TIDAK ada di sini: keduanya punya route
 * khusus dengan pemeriksaan role admin sendiri.
 */
export const ALLOWED_CMS_MODELS: ReadonlySet<string> = new Set([
  ...CMS_CONTENT_MODELS,
  'contacts',
]);

/** Role yang boleh menulis (POST/PUT/DELETE) konten CMS. Ubah di sini bila ingin admin saja. */
export const CMS_CONTENT_WRITE_ROLES: readonly string[] = ['admin', 'marketing'];

export function isAllowedCmsModel(model: string): boolean {
  return ALLOWED_CMS_MODELS.has(model);
}

/**
 * Cek otorisasi tulis spesifik per model:
 * - Model sensitif ('contacts', 'users', 'admin-menus') HANYA untuk role 'admin'.
 * - Model konten ('CMS_CONTENT_MODELS') diizinkan untuk 'admin' dan 'marketing'.
 */
export function canWriteCmsModel(user: UserSessionPayload | null | undefined, model: string): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  if (SENSITIVE_CMS_MODELS.has(model)) {
    return role === 'admin';
  }
  if (CMS_CONTENT_MODELS.has(model)) {
    return role === 'admin' || role === 'marketing';
  }
  return role === 'admin';
}

export function canWriteCmsContent(user: UserSessionPayload | null | undefined): boolean {
  return !!user && CMS_CONTENT_WRITE_ROLES.includes(user.role);
}

/** ID record harus bilangan bulat non-negatif; mencegah path injection ke URL backend. */
export function parseRecordId(value: unknown): string | null {
  const s = String(value ?? '').trim();
  return /^\d{1,12}$/.test(s) ? s : null;
}

/**
 * Pesan error aman untuk klien.
 * - Error 4xx dari backend (validasi, duplikat, dll.) diteruskan: pesannya memang ditujukan ke pengguna.
 * - Selain itu (5xx, jaringan, exception internal) diganti pesan generik; detail hanya masuk log server.
 */
export function publicErrorMessage(error: any, fallback: string): string {
  const status = typeof error?.status === 'number' ? error.status : 0;
  if (status >= 400 && status < 500 && typeof error?.message === 'string' && error.message) {
    return error.message;
  }
  return fallback;
}

export function errorResponse(error: any, fallback: string, defaultStatus = 500) {
  const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 500
    ? error.status
    : defaultStatus;
  return NextResponse.json({ error: publicErrorMessage(error, fallback) }, { status });
}
