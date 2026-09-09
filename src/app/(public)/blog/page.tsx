import * as React from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';
import { Box, Container, Grid, Typography, Card, Button, Chip, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const rawPosts = await cmsApi.getItems<any>('blog-posts').catch(() => []);
  const posts = rawPosts.filter((p: any) => (p.isPublished ?? p.is_published) !== false);


  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Wawasan & Berita Industri"
            sx={{
              bgcolor: '#e8f6ed',
              color: '#018730',
              fontWeight: 800,
              border: '1px solid #a3dfb7',
              mb: 2,
            }}
          />
          <Typography variant="h2" component="h1" fontWeight={900} color="#0F172A">
            Artikel & Publikasi Terkini
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, mx: 'auto' }}>
            Perkembangan teknologi manufaktur otomotif, inovasi elektrifikasi, dan standar mutu industri terkini.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid size={{ xs: 12, md: 6 }} key={post.id}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#018730',
                    boxShadow: '0 16px 32px rgba(1, 135, 48, 0.12)',
                  },
                }}
              >
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  {post.publishedAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                      <CalendarMonthIcon sx={{ fontSize: 16, color: '#018730' }} />
                      <Typography variant="caption">
                        {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  )}
                  {post.author && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                      <PersonOutlineIcon sx={{ fontSize: 16, color: '#fc4509' }} />
                      <Typography variant="caption">{post.author}</Typography>
                    </Box>
                  )}
                </Stack>

                <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                  {post.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3, lineHeight: 1.8 }}>
                  {post.excerpt}
                </Typography>

                <Button
                  component="a"
                  href={`/blog/${post.slug}`}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: '#018730',
                    fontWeight: 700,
                    alignSelf: 'flex-start',
                    p: 0,
                    '&:hover': { color: '#016f27', bgcolor: 'transparent' },
                  }}
                >
                  Baca Selengkapnya
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
