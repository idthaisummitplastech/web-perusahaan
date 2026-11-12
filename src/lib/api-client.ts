/**
 * Central Enterprise API Client for PT Indonesia Thai Summit Plastech (Company Profile)
 * Routes all data access to Python FastAPI Backend (Zero Direct DB Touch)
 * URL 100% via env (lihat src/lib/urls.ts) — tanpa hardcoded localhost/domain.
 */
import { getBackendBaseUrl } from './urls';

function getInternalSecret(): string {
  const s = process.env.BACKEND_INTERNAL_SECRET;
  if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env. Isi file .env - lihat .env.example.');
  return s;
}

/**
 * Normalise backend base URL (100% via env):
 * - trim whitespace, remove trailing slashes
 * - always ensure single `/api/v1` suffix (no double prefix)
 * Ganti backend cukup via env BACKEND_API_URL — tanpa ubah code.
 */
function getBackendBase(): string {
  return getBackendBaseUrl();
}

/** Lazy getter (fail-fast via env, tanpa evaluasi saat import). */
export function getBackendApiUrl(): string {
  return getBackendBase();
}

/** Build full backend URL consistently (handles trailing slash + optional /api/v1 prefix). */
export function buildBackendUrl(endpoint: string): string {
  const base = getBackendBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const path = cleanEndpoint.startsWith('/api/v1') ? cleanEndpoint.slice('/api/v1'.length) : cleanEndpoint;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// Selalu ternormalisasi (tanpa trailing slash, termasuk /api/v1) — lazy via getter.
// Gunakan getBackendApiUrl() agar `next build` tanpa env tidak crash saat import.

// Recursively ensures both camelCase and snake_case properties are available
function dualCaseObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(dualCaseObject);
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = dualCaseObject(obj[key]);
      result[key] = val;

      // Convert snake_case to camelCase
      if (key.includes('_')) {
        const camelKey = key.replace(/_([a-z0-9])/g, (_, l) => l.toUpperCase());
        result[camelKey] = val;
      }
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey !== key) {
        result[snakeKey] = val;
      }
    }
    return result;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Session enforcement — penegakan sesi first-login & MFA di level helper
// ---------------------------------------------------------------------------

/**
 * Error khusus saat sesi belum lengkap (first-login belum selesai / MFA belum
 * terverifikasi). Dilempar oleh enforceSessionCompleteness() sehingga caller
 * (route handler) bisa mengembalikan SESSION_INCOMPLETE ke klien.
 */
export class SessionIncompleteError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'SessionIncompleteError';
    this.code = code;
  }
}

/**
 * Cek klaim sesi CMS sebelum menghubungi backend. Jika sesi belum lengkap
 * (mustChangePassword=true atau mfaVerified=false dengan mfaRequired=true),
 * lempar SessionIncompleteError.
 *
 * Route penyelesaian sesi (change-password, MFA, logout, session) memanggil
 * fetchFromBackend / fetchCmsBackend dengan bypassEnforcement: true.
 */
export function enforceSessionCompleteness(session: {
  mustChangePassword?: boolean;
  mfaRequired?: boolean;
  mfaVerified?: boolean;
} | null): void {
  if (!session) return; // no session = handled by auth check elsewhere
  if (session.mustChangePassword) {
    throw new SessionIncompleteError(
      'FIRST_LOGIN_REQUIRED',
      'Sesi belum lengkap: harus mengganti password terlebih dahulu.'
    );
  }
  if (session.mfaRequired && !session.mfaVerified) {
    throw new SessionIncompleteError(
      'MFA_VERIFICATION_REQUIRED',
      'Sesi belum lengkap: verifikasi MFA diperlukan.'
    );
  }
}

/**
 * Tangani kode error sesi dari backend (403). Kembalikan kode yang sesuai
 * agar proxy / UI bisa redirect ke halaman yang tepat.
 */
export function handleBackendSessionErrors(
  status: number,
  errorJson: any
): SessionIncompleteError | null {
  if (status !== 403) return null;
  const code = errorJson?.code || errorJson?.detail?.code || '';
  const sessionCodes = [
    'FIRST_LOGIN_REQUIRED',
    'MFA_SETUP_REQUIRED',
    'MFA_VERIFICATION_REQUIRED',
    'MFA_SESSION_EXPIRED',
  ];
  if (sessionCodes.includes(code)) {
    return new SessionIncompleteError(code, errorJson?.detail?.message || errorJson?.detail || code);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core fetch helpers
// ---------------------------------------------------------------------------

export interface FetchCmsOptions extends RequestInit {
  /** Skip session completeness enforcement (untuk route penyelesaian sesi). */
  bypassEnforcement?: boolean;
  /** Klaim sesi CMS dari cookie (diisi oleh caller route handler). */
  session?: {
    id?: number;
    mustChangePassword?: boolean;
    mfaRequired?: boolean;
    mfaVerified?: boolean;
    sessionVersion?: number;
  } | null;
}

export async function fetchFromBackend<T = any>(
  endpoint: string,
  options?: FetchCmsOptions
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = buildBackendUrl(cleanEndpoint);

  // Enforce session completeness (kecuali bypass)
  if (options?.session && !options.bypassEnforcement) {
    enforceSessionCompleteness(options.session);
  }

  try {
    const internalSecret = getInternalSecret();
    const extraHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Internal-Secret': internalSecret,
    };

    // Kirim X-CMS-User-Id dari session (BUKAN X-Admin-Id)
    if (options?.session?.id) {
      extraHeaders['X-CMS-User-Id'] = String(options.session.id);
    }

    // Kirim X-Session-Version untuk validasi pencabutan sesi
    if (options?.session?.sessionVersion != null) {
      extraHeaders['X-Session-Version'] = String(options.session.sessionVersion);
    }

    const { bypassEnforcement, session, ...fetchOptions } = options || {};

    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...extraHeaders,
        ...fetchOptions?.headers,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));

      // Cek error sesi dari backend
      const sessionErr = handleBackendSessionErrors(res.status, errorJson);
      if (sessionErr) throw sessionErr;

      const apiError: any = new Error(errorJson.detail || errorJson.error || errorJson.message || `Backend API error (HTTP ${res.status})`);
      apiError.status = res.status;
      throw apiError;
    }

    const json = await res.json();
    const data = json.data !== undefined ? json.data : json;
    return dualCaseObject(data) as T;
  } catch (err: any) {
    // Re-throw SessionIncompleteError tanpa log noise
    if (err instanceof SessionIncompleteError) throw err;
    console.error(`[API-CLIENT ERROR] ${cleanEndpoint}:`, err.message);
    throw err;
  }
}

export const cmsApi = {
  getItems: <T = any>(model: string) => fetchFromBackend<T[]>(`/cms/${model}`),
  getItem: <T = any>(model: string, id: number | string) => fetchFromBackend<T>(`/cms/${model}/${id}`),
  createItem: <T = any>(model: string, data: any, token?: string) =>
    fetchFromBackend<T>(`/cms/${model}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    }),
  updateItem: <T = any>(model: string, id: number | string, data: any, token?: string) =>
    fetchFromBackend<T>(`/cms/${model}/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    }),
  deleteItem: (model: string, id: number | string, token?: string) =>
    fetchFromBackend(`/cms/${model}/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  submitContact: (data: any) =>
    fetchFromBackend('/cms/contact-us', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
