/**
 * Test First-Login & MFA Enforcement — web-perusahaan D.4
 *
 * Memanggil proxy() ASLI dari src/proxy.ts dan enforceSessionCompleteness()
 * ASLI dari src/lib/api-client.ts menggunakan ts-node register.
 *
 * Jalankan: node scripts/test_first_login_mfa_flow.js
 */

// Minimal env agar module tidak crash
process.env.NEXTAUTH_SECRET = 'test-secret-key-at-least-32-chars-long!!';
process.env.BACKEND_API_URL = 'http://localhost:8004/api/v1';
process.env.BACKEND_INTERNAL_SECRET = 'test-internal-secret';

const path = require('path');

// Register ts-node agar bisa require file .ts
require('ts-node').register({
  project: path.join(__dirname, '..', 'tsconfig.json'),
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    target: 'es2022',
    skipLibCheck: true,
    esModuleInterop: true,
    paths: {
      '@/*': [path.join(__dirname, '..', 'src', '*')],
    },
    baseUrl: path.join(__dirname, '..'),
  },
  transpileOnly: true,
});

// Resolve @/ alias for require
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(__dirname, '..', 'src', request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Import real modules
const { proxy } = require('../src/proxy');
const { enforceSessionCompleteness, SessionIncompleteError } = require('../src/lib/api-client');
const { SignJWT } = require('jose');
const { NextRequest } = require('next/dist/server/web/spec-extension/request');

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, name) {
  if (condition) {
    passed++;
    results.push(`  ✓ ${name}`);
  } else {
    failed++;
    results.push(`  ✗ FAIL: ${name}`);
  }
}

async function makeToken(claims, exp = '8h') {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(SECRET);
}

function makeRequest(url, cookies = {}) {
  const req = new NextRequest(new URL(url, 'http://localhost:3008'));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

async function runTests() {
  console.log('\n=== Test First-Login & MFA Enforcement (web-perusahaan D.4) ===\n');

  // --- proxy() tests ---
  console.log('proxy() tests:');

  // 1. Unauthenticated → redirect to /login
  {
    const req = makeRequest('http://localhost:3008/admin');
    const res = await proxy(req);
    assert(res.status === 307 || res.status === 308, '1. /admin tanpa cookie → redirect login');
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/login'), '1b. redirect ke /login');
  }

  // 2. Authenticated, sesi lengkap → next()
  {
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: false, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin', { cms_session: token });
    const res = await proxy(req);
    assert(res.status === 200, '2. sesi lengkap → next (200)');
  }

  // 3. mustChangePassword + FIRST_LOGIN_ENFORCE=true → redirect /admin/change-password
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: true, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin', { cms_session: token });
    const res = await proxy(req);
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/admin/change-password'), '3. mustChangePassword → redirect change-password');
  }

  // 4. mfaRequired + !mfaVerified + enforce → redirect /admin/mfa-setup
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: false, mustChangePassword: false, mfaRequired: true, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin', { cms_session: token });
    const res = await proxy(req);
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/admin/mfa-setup'), '4. mfaRequired → redirect mfa-setup');
  }

  // 5. FIRST_LOGIN_ENFORCE=false → no redirect even with mustChangePassword
  {
    process.env.FIRST_LOGIN_ENFORCE = 'false';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: true, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin', { cms_session: token });
    const res = await proxy(req);
    assert(res.status === 200, '5. enforce=false → next (200) meski mustChangePassword');
  }

  // 6. Session completion route whitelisted
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: true, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin/change-password', { cms_session: token });
    const res = await proxy(req);
    assert(res.status === 200, '6. /admin/change-password → whitelisted, next (200)');
  }

  // 7. Non-admin role blocked from /admin/users
  {
    process.env.FIRST_LOGIN_ENFORCE = 'false';
    const token = await makeToken({ id: 2, email: 'mk@b.com', name: 'MK', role: 'marketing', mfaVerified: true, mustChangePassword: false, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin/users', { cms_session: token });
    const res = await proxy(req);
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/admin') && !loc.includes('/admin/users'), '7. marketing → redirect dari /admin/users');
  }

  // 8. Temp cookie mfa_setup → allowed to /admin/mfa-setup
  {
    const tempToken = await makeToken({ id: 1, email: 'a@b.com', purpose: 'mfa_setup' }, '15m');
    const req = makeRequest('http://localhost:3008/admin/mfa-setup', { cms_temp_mfa: tempToken });
    const res = await proxy(req);
    assert(res.status === 200, '8. temp mfa_setup → /admin/mfa-setup allowed (200)');
  }

  // 9. Temp cookie mfa_verify → redirect dari /admin/mfa-setup ke /login/verify-mfa
  {
    const tempToken = await makeToken({ id: 1, email: 'a@b.com', purpose: 'mfa_verify' }, '15m');
    const req = makeRequest('http://localhost:3008/admin/mfa-setup', { cms_temp_mfa: tempToken });
    const res = await proxy(req);
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/login/verify-mfa'), '9. temp mfa_verify → redirect ke /login/verify-mfa');
  }

  // 10. Login page with full session → redirect to /admin
  {
    process.env.FIRST_LOGIN_ENFORCE = 'false';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: false, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/login', { cms_session: token });
    const res = await proxy(req);
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/admin'), '10. /login + sesi lengkap → redirect /admin');
  }

  // 11. API route blocked with incomplete session
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: true, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/api/cms/blog-posts', { cms_session: token });
    const res = await proxy(req);
    assert(res.status === 403, '11. API /api/cms/* + mustChangePassword → 403');
  }

  // 12. API session completion route whitelisted
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';
    const token = await makeToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin', mfaVerified: true, mustChangePassword: true, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/api/admin/change-password', { cms_session: token });
    const res = await proxy(req);
    assert(res.status === 200, '12. /api/admin/change-password → whitelisted, next (200)');
  }

  // 13. /login/verify-mfa tanpa temp cookie → redirect /login
  {
    const req = makeRequest('http://localhost:3008/login/verify-mfa');
    const res = await proxy(req);
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/login'), '13. /login/verify-mfa tanpa cookie → redirect /login');
  }

  // 14. Marketing role can access /admin (content pages)
  {
    process.env.FIRST_LOGIN_ENFORCE = 'false';
    const token = await makeToken({ id: 3, email: 'mk@b.com', name: 'MK', role: 'marketing', mfaVerified: true, mustChangePassword: false, mfaRequired: false, sessionVersion: 1 });
    const req = makeRequest('http://localhost:3008/admin/blog-posts', { cms_session: token });
    const res = await proxy(req);
    assert(res.status === 200, '14. marketing → /admin/blog-posts allowed (200)');
  }

  // --- enforceSessionCompleteness() tests ---
  console.log('\nenforceSessionCompleteness() tests:');

  // 15. mustChangePassword → throw SessionIncompleteError
  {
    let threw = false;
    try {
      enforceSessionCompleteness({ mustChangePassword: true, mfaRequired: false, mfaVerified: true });
    } catch (e) {
      threw = e instanceof SessionIncompleteError && e.code === 'FIRST_LOGIN_REQUIRED';
    }
    assert(threw, '15. mustChangePassword → SessionIncompleteError FIRST_LOGIN_REQUIRED');
  }

  // 16. mfaRequired + !mfaVerified → throw
  {
    let threw = false;
    try {
      enforceSessionCompleteness({ mustChangePassword: false, mfaRequired: true, mfaVerified: false });
    } catch (e) {
      threw = e instanceof SessionIncompleteError && e.code === 'MFA_VERIFICATION_REQUIRED';
    }
    assert(threw, '16. mfaRequired + !mfaVerified → SessionIncompleteError MFA_VERIFICATION_REQUIRED');
  }

  // 17. Complete session → no throw
  {
    let threw = false;
    try {
      enforceSessionCompleteness({ mustChangePassword: false, mfaRequired: false, mfaVerified: true });
    } catch {
      threw = true;
    }
    assert(!threw, '17. sesi lengkap → tidak throw');
  }

  // 18. null session → no throw (handled elsewhere)
  {
    let threw = false;
    try {
      enforceSessionCompleteness(null);
    } catch {
      threw = true;
    }
    assert(!threw, '18. null session → tidak throw');
  }

  // Cleanup
  delete process.env.FIRST_LOGIN_ENFORCE;

  // Summary
  console.log('\n' + results.join('\n'));
  console.log(`\n=== Hasil: ${passed} lulus, ${failed} gagal dari ${passed + failed} test ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});

