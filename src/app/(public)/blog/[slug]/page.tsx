import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Typography, Button, Paper, Stack, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';

export const dynamic = 'force-dynamic';

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawPosts = await cmsApi.getItems<any>('blog-posts').catch(() => []);
  const post = rawPosts.find((p: any) => p.slug === slug);

  if (!post || (post.isPublished ?? post.is_published) === false) {
    notFound();
  }


  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="md">
        <Button
          component="a"
          href="/blog"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 4, color: '#64748B', fontWeight: 600, '&:hover': { color: '#018730' } }}
        >
          Kembali ke Semua Artikel
        </Button>

        <Paper elevation={2} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Chip
            label="Artikel & Publikasi"
            sx={{
              bgcolor: '#e8f6ed',
              color: '#018730',
              fontWeight: 800,
              border: '1px solid #a3dfb7',
              mb: 2,
            }}
          />
          <Typography variant="h3" component="h1" fontWeight={900} color="#0F172A" sx={{ mb: 3, lineHeight: 1.3 }}>
            {post.title}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mb: 4, color: '#64748B' }}>
            {post.publishedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarMonthIcon sx={{ fontSize: 18, color: '#018730' }} />
                <Typography variant="body2">
                  {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            )}
            {post.author && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <PersonOutlineIcon sx={{ fontSize: 18, color: '#fc4509' }} />
                <Typography variant="body2">Ditulis oleh {post.author}</Typography>
              </Box>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {post.excerpt && (
            <Typography variant="h6" sx={{ color: '#475569', fontStyle: 'italic', mb: 4, lineHeight: 1.7, fontWeight: 500 }}>
              {post.excerpt}
            </Typography>
          )}

          {/* Render Rich Text Content */}
          <Box
            sx={{
              color: '#1E293B',
              lineHeight: 1.9,
              fontSize: '1.05rem',
              '& h2': {
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#0F172A',
                mt: 4,
                mb: 2,
              },
              '& h3': {
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#0F172A',
                mt: 3,
                mb: 1.5,
              },
              '& p': {
                mb: 2.5,
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2.5,
              },
              '& li': {
                mb: 1,
              },
              '& blockquote': {
                borderLeft: '4px solid #018730',
                bgcolor: '#e8f6ed',
                p: 2,
                borderRadius: '0 8px 8px 0',
                fontStyle: 'italic',
                color: '#018730',
                my: 3,
              },
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Divider sx={{ my: 5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bagikan artikel ini ke rekan tim Anda.
            </Typography>
            <Button
              component="a"
              href="/contact"
              variant="contained"
              sx={{
                bgcolor: '#018730',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: 25,
                px: 3,
                boxShadow: '0 4px 14px rgba(1, 135, 48, 0.3)',
                '&:hover': { bgcolor: '#016f27' },
              }}
            >
              Hubungi Kami
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
