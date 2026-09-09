import { NextResponse } from 'next/server';
import { cmsApi } from '@/lib/api-client';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nama, email, dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const submission = await cmsApi.submitContact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Pertanyaan Umum',
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Pesan Anda berhasil dikirim! Tim kami akan segera merespon pesan Anda.',
      id: submission.id,
    });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Gagal mengirim pesan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
