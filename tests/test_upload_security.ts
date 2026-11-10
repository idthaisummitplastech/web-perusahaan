import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { GET, ALLOWED_MIME_TYPES } from '../src/app/uploads/[...path]/route';

async function invokeRoute(segments: string[], search: string = '') {
  const url = `http://localhost:3008/uploads/${segments.join('/')}${search ? '?' + search : ''}`;
  const req = new NextRequest(url);
  const params = Promise.resolve({ path: segments });
  return await GET(req, { params });
}

async function runTests() {
  console.log('--- Running CAND-WP-07 Upload Path Traversal Tests (Actual Route Handler) ---');

  const baseDir = path.resolve('public', 'uploads');
  await fs.mkdir(baseDir, { recursive: true });

  const testFileJpg = path.join(baseDir, 'test_unit_banner.jpg');
  await fs.writeFile(testFileJpg, Buffer.from('fake-jpeg-data'));

  const testFileSvg = path.join(baseDir, 'test_unit_badge.svg');
  await fs.writeFile(testFileSvg, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

  const testFileDocx = path.join(baseDir, 'test_unit_report.docx');
  await fs.writeFile(testFileDocx, Buffer.from('fake-docx-data'));

  try {
    // 1. Path traversal dengan '..' langsung ditolak 400
    const res1 = await invokeRoute(['..', 'secret.txt']);
    assert.strictEqual(res1.status, 400, 'Segment dengan .. wajib ditolak 400');
    console.log('PASS Test 1: .. path traversal ditolak (400)');

    // 2. Path traversal bertingkat ['sub', '..', '..', 'etc', 'passwd'] ditolak 400
    const res2 = await invokeRoute(['sub', '..', '..', 'etc', 'passwd']);
    assert.strictEqual(res2.status, 400, 'Nested .. wajib ditolak 400');
    console.log('PASS Test 2: Nested .. path traversal ditolak (400)');

    // 3. Null byte injection ditolak 400
    const res3 = await invokeRoute(['image\0.jpg']);
    assert.strictEqual(res3.status, 400, 'Null byte injection wajib ditolak 400');
    console.log('PASS Test 3: Null byte injection ditolak (400)');

    // 4. Backslash injection ditolak 400
    const res4 = await invokeRoute(['folder\\malicious.jpg']);
    assert.strictEqual(res4.status, 400, 'Backslash injection wajib ditolak 400');
    console.log('PASS Test 4: Backslash injection ditolak (400)');

    // 5. Ekstensi berbahaya .env ditolak 403
    const res5 = await invokeRoute(['.env']);
    assert.strictEqual(res5.status, 403, '.env wajib ditolak 403');
    console.log('PASS Test 5: Ekstensi terlarang .env ditolak (403)');

    // 6. Ekstensi script executable (.sh, .php, .exe, .html) ditolak 403
    for (const dangerous of ['exploit.sh', 'shell.php', 'virus.exe', 'xss.html']) {
      const res = await invokeRoute([dangerous]);
      assert.strictEqual(res.status, 403, `${dangerous} wajib ditolak 403`);
    }
    console.log('PASS Test 6: Ekstensi berbahaya (.sh, .php, .exe, .html) ditolak (403)');

    // 7. Berkas tidak ditemukan (404)
    const res7 = await invokeRoute(['non_existent_file.jpg']);
    assert.strictEqual(res7.status, 404, 'Berkas tidak ada wajib return 404');
    console.log('PASS Test 7: Berkas tidak ditemukan return 404');

    // 8. Berkas sah .jpg disajikan dengan 200 dan MIME type benar
    const res8 = await invokeRoute(['test_unit_banner.jpg']);
    assert.strictEqual(res8.status, 200, 'Berkas sah .jpg wajib return 200');
    assert.strictEqual(res8.headers.get('content-type'), 'image/jpeg');
    assert.strictEqual(res8.headers.get('x-content-type-options'), 'nosniff');
    console.log('PASS Test 8: Berkas sah .jpg disajikan (200, image/jpeg, nosniff)');

    // 9. Berkas SVG sah disajikan dengan CSP pelindung XSS
    const res9 = await invokeRoute(['test_unit_badge.svg']);
    assert.strictEqual(res9.status, 200, 'Berkas SVG sah wajib return 200');
    assert.strictEqual(res9.headers.get('content-type'), 'image/svg+xml');
    assert.ok(res9.headers.get('content-security-policy')?.includes("default-src 'none'"));
    console.log('PASS Test 9: Berkas SVG disajikan dengan header CSP ketat');

    // 10. Berkas dokumen DOCX sah disajikan dengan MIME type benar
    const res10 = await invokeRoute(['test_unit_report.docx']);
    assert.strictEqual(res10.status, 200, 'Berkas DOCX sah wajib return 200');
    assert.strictEqual(res10.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    console.log('PASS Test 10: Dokumen DOCX disajikan dengan benar');

    // 11. Uji Symlink Escape:
    // Pada Windows non-elevated, fs.symlink menghasilkan EPERM.
    // Kita uji branch logika pencegahan symlink escape pada handler dengan memverifikasi
    // bahwa jika realpath target mengarah ke luar root uploads, handler mengembalikan 403.
    const origRealpath = fs.realpath;
    try {
      // Simulasikan target resolved ke /etc/shadow atau path di luar uploads
      (fs as any).realpath = async (p: string) => {
        if (p.includes('test_unit_banner.jpg')) {
          return path.resolve('..', 'outside_confidential.txt');
        }
        return origRealpath(p);
      };
      const res11 = await invokeRoute(['test_unit_banner.jpg']);
      assert.strictEqual(res11.status, 403, 'Target symlink di luar root wajib ditolak 403');
      const text11 = await res11.text();
      assert.ok(text11.includes('Symlink Escape Detected'));
      console.log('PASS Test 11: Deteksi dan penolakan Symlink Escape terbukti aktif (403)');
    } finally {
      (fs as any).realpath = origRealpath;
    }

    console.log('--- Seluruh 11 Pengujian Keamanan Handler Upload Selesai: 100% PASS! ---');
  } finally {
    // Teardown
    try {
      if (existsSync(testFileJpg)) await fs.unlink(testFileJpg);
      if (existsSync(testFileSvg)) await fs.unlink(testFileSvg);
      if (existsSync(testFileDocx)) await fs.unlink(testFileDocx);
    } catch {}
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
