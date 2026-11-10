import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

const ALLOWED_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/**
 * Mirror of the core security validation logic in src/app/uploads/[...path]/route.ts
 */
async function validateUploadRequest(segments, cwd = process.cwd()) {
  if (!segments || segments.length === 0) {
    return { status: 404, message: 'Not Found' };
  }

  // 1. Validasi karakter terlarang: null byte, backslash, segment '..'
  for (const segment of segments) {
    if (
      segment.includes('\0') ||
      segment.includes('\\') ||
      segment === '..' ||
      segment.includes('..')
    ) {
      return { status: 400, message: 'Invalid Path Segment' };
    }
  }

  const uploadsDir = path.resolve(cwd, 'public', 'uploads');
  const requestedPath = path.resolve(uploadsDir, ...segments);

  // 2. Strict boundary check with separator to prevent prefix collision (e.g. uploads_backup)
  const uploadsDirWithSep = uploadsDir.endsWith(path.sep) ? uploadsDir : uploadsDir + path.sep;
  if (!requestedPath.startsWith(uploadsDirWithSep)) {
    return { status: 403, message: 'Forbidden: Path Traversal Detected' };
  }

  // 3. Extension allowlist check
  const ext = path.extname(requestedPath).toLowerCase();
  if (!ext || !ALLOWED_MIME_TYPES[ext]) {
    return { status: 403, message: 'File Type Not Allowed' };
  }

  if (!existsSync(requestedPath)) {
    return { status: 404, message: 'File Not Found' };
  }

  // 4. Tangkal Symlink Escape via fs.realpath pada root dan target
  let realUploadsDir;
  let realTarget;
  try {
    realUploadsDir = await fs.realpath(uploadsDir);
    realTarget = await fs.realpath(requestedPath);
  } catch {
    return { status: 404, message: 'File Not Found' };
  }

  const realUploadsDirWithSep = realUploadsDir.endsWith(path.sep) ? realUploadsDir : realUploadsDir + path.sep;
  if (!realTarget.startsWith(realUploadsDirWithSep)) {
    return { status: 403, message: 'Forbidden: Symlink Escape Detected' };
  }

  const stat = await fs.stat(realTarget);
  if (!stat.isFile()) {
    return { status: 403, message: 'Forbidden' };
  }

  return {
    status: 200,
    path: realTarget,
    contentType: ALLOWED_MIME_TYPES[ext],
  };
}

async function runTests() {
  console.log('--- Running CAND-WP-07 Upload Path Traversal Security Tests ---');

  const baseDir = path.resolve('public', 'uploads');
  await fs.mkdir(baseDir, { recursive: true });

  // Create a genuine test file inside public/uploads
  const validFile = path.join(baseDir, 'test_image.jpg');
  await fs.writeFile(validFile, 'fake image data');

  // Create an outside secret file
  const outsideSecret = path.resolve('public', 'outside_secret.txt');
  await fs.writeFile(outsideSecret, 'SUPER_SECRET_TOKEN=12345');

  // Create a symlink inside uploads pointing to outside file (if OS permissions allow)
  const symlinkFile = path.join(baseDir, 'symlink_outside.jpg');
  let symlinkCreated = false;
  try {
    if (existsSync(symlinkFile)) await fs.unlink(symlinkFile);
    await fs.symlink(outsideSecret, symlinkFile);
    symlinkCreated = true;
  } catch (e) {
    console.log('Note: symlink creation skipped (unprivileged Windows environment):', e.message);
  }

  try {
    // Test 1: Simple .. path traversal
    const res1 = await validateUploadRequest(['..', 'outside_secret.txt']);
    assert.strictEqual(res1.status, 400, 'Segment with .. must be rejected with 400');
    console.log('PASS Test 1: .. path traversal rejected (400)');

    // Test 2: Nested .. path traversal
    const res2 = await validateUploadRequest(['subdir', '..', '..', 'outside_secret.txt']);
    assert.strictEqual(res2.status, 400, 'Nested .. must be rejected with 400');
    console.log('PASS Test 2: Nested .. path traversal rejected (400)');

    // Test 3: Null byte injection
    const res3 = await validateUploadRequest(['image\0.jpg']);
    assert.strictEqual(res3.status, 400, 'Null byte must be rejected with 400');
    console.log('PASS Test 3: Null byte injection rejected (400)');

    // Test 4: Backslash injection
    const res4 = await validateUploadRequest(['subdir\\image.jpg']);
    assert.strictEqual(res4.status, 400, 'Backslash must be rejected with 400');
    console.log('PASS Test 4: Backslash injection rejected (400)');

    // Test 5: Dangerous file extension (.env)
    const res5 = await validateUploadRequest(['.env']);
    assert.strictEqual(res5.status, 403, 'Disallowed extension must return 403');
    console.log('PASS Test 5: .env extension rejected (403)');

    // Test 6: Script extension (.sh)
    const res6 = await validateUploadRequest(['malicious.sh']);
    assert.strictEqual(res6.status, 403, 'Script extension must return 403');
    console.log('PASS Test 6: .sh script extension rejected (403)');

    // Test 7: Symlink escape detection
    if (symlinkCreated) {
      const res7 = await validateUploadRequest(['symlink_outside.jpg']);
      assert.strictEqual(res7.status, 403, 'Symlink outside uploadsDir must be rejected with 403');
      console.log('PASS Test 7: Symlink escape detected and rejected (403)');
    }

    // Test 8: Valid legitimate file inside public/uploads
    const res8 = await validateUploadRequest(['test_image.jpg']);
    assert.strictEqual(res8.status, 200, 'Legitimate file inside uploadsDir must return 200');
    assert.strictEqual(res8.contentType, 'image/jpeg');
    console.log('PASS Test 8: Valid file served correctly (200, image/jpeg)');

    console.log('--- All CAND-WP-07 Security Tests PASSED! ---');
  } finally {
    // Cleanup temporary test files
    try {
      if (existsSync(validFile)) await fs.unlink(validFile);
      if (existsSync(outsideSecret)) await fs.unlink(outsideSecret);
      if (symlinkCreated && existsSync(symlinkFile)) await fs.unlink(symlinkFile);
    } catch {}
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
