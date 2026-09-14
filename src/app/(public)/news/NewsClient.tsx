'use client';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Grid, Card, Chip, Button, Stack, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, IconButton, Divider, Paper, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import FactoryIcon from '@mui/icons-material/Factory';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import { useLanguage } from '@/lib/LanguageContext';

export interface NewsFile { label: string; file: string; type: 'PDF'|'XLSX'; size: string; tag?: string; }
export interface NewsCategory { id: string; icon: React.ReactNode; accent: string; soft: string; badge: string; titleEn: string; titleId: string; descEn: string; descId: string; pitchEn: string; pitchId: string; files: NewsFile[]; }

const FALLBACK_CATEGORIES: NewsCategory[] = [
{ id:'general-waste', icon:<DeleteOutlinedIcon sx={{fontSize:30,color:'#fff'}}/>, accent:'linear-gradient(135deg,#018730 0%,#00a63e 100%)', soft:'#e8f6ed', badge:'Waste \u2022 3R \u2022 Circular',
titleEn:'Waste Management Summary Report', titleId:'Laporan Ringkasan Pengelolaan Sampah',
descEn:'Traceable general-waste volumes with segregation discipline \u2014 verified documentation demonstrating responsible manufacturing practices.',
descId:'Volume sampah umum yang terdokumentasi dengan disiplin pemilahan terpadu \u2014 bukti tata kelola manufaktur yang bertanggung jawab.',
pitchEn:'Compliant segregation data aligned with waste-diversion standards and environmental audits.', pitchId:'Data pemilahan terverifikasi sesuai standar reduksi limbah dan audit kepatuhan lingkungan.',
files:[{label:'Amount General Waste',file:'/news/amount-general-waste.pdf',type:'PDF',size:'418 KB',tag:'Summary'}]},
{ id:'ghg', icon:<CloudQueueIcon sx={{fontSize:30,color:'#fff'}}/>, accent:'linear-gradient(135deg,#0B1320 0%,#16442b 55%,#018730 100%)', soft:'#eaf4ee', badge:'GHG \u2022 Carbon \u2022 Scope 1 & 2',
titleEn:'Greenhouse Gas Emissions Report', titleId:'Laporan Emisi Gas Rumah Kaca',
descEn:'Three-year GHG inventory dashboards (2023-2025) and standard calculation methodologies for Scope 1 & 2 emissions.',
descId:'Dashboard inventarisasi GRK tiga tahun (2023-2025) beserta metodologi perhitungan baku emisi Scope 1 & 2.',
pitchEn:'Verified multi-year carbon accounting supporting partner Scope 3 decarbonization targets.', pitchId:'Perhitungan emisi multi-tahun terverifikasi untuk pemenuhan target dekarbonisasi Scope 3 mitra industri.',
files:[
{label:'DASHBOARD GHG INVENTORY 2023',file:'/news/dashboard-ghg-inventory-2023.pdf',type:'PDF',size:'995 KB',tag:'2023'},
{label:'DASHBOARD GHG INVENTORY 2024',file:'/news/dashboard-ghg-inventory-2024.pdf',type:'PDF',size:'997 KB',tag:'2024'},
{label:'DASHBOARD GHG INVENTORY 2025',file:'/news/dashboard-ghg-inventory-2025.pdf',type:'PDF',size:'1008 KB',tag:'2025 \u2022 Latest'},
{label:'Q6.2 Establish GHG Inventory',file:'/news/q62-establish-ghg-inventory.pdf',type:'PDF',size:'369 KB',tag:'Methodology'}]},
{ id:'b3', icon:<WarningAmberIcon sx={{fontSize:30,color:'#fff'}}/>, accent:'linear-gradient(135deg,#fc4509 0%,#ff7a3d 100%)', soft:'#fff1ed', badge:'B3 \u2022 Hazardous \u2022 Compliant',
titleEn:'Hazardous Waste Management Report', titleId:'Laporan Pengelolaan Limbah B3',
descEn:'Full 2023-2025 hazardous-waste logbook recapitulation with licensed manifests and statutory environmental reporting.',
descId:'Rekapitulasi logbook limbah B3 2023-2025 lengkap dengan manifes berizin resmi dan kepatuhan pelaporan berkala.',
pitchEn:'Fully compliant manifest-ready hazardous waste handling by licensed environmental operators.', pitchId:'Pengelolaan limbah B3 sesuai regulasi ketat dengan manifest berizin resmi dan alur pengolahan bersertifikasi.',
files:[{label:'Rangkuman Pencatatan Limbah B3 2023-2025',file:'/news/rangkuman-pencatatan-limbah-b3-2023-2025.xlsx',type:'XLSX',size:'85 KB',tag:'2023-2025'}]},
{ id:'water', icon:<WaterDropIcon sx={{fontSize:30,color:'#fff'}}/>, accent:'linear-gradient(135deg,#0284c7 0%,#06b6d4 100%)', soft:'#ecfeff', badge:'Water \u2022 Wastewater \u2022 PROPER',
titleEn:'Water Consumption & Wastewater Management', titleId:'Konsumsi Air & Pengelolaan Air Limbah',
descEn:'Comprehensive water withdrawal, conservation metrics, and treated effluent discharge logs aligned with statutory thresholds.',
descId:'Neraca pemanfaatan air bersih, metrik konservasi, serta log pembuangan air limbah terolah sesuai baku mutu resmi.',
pitchEn:'Validated water stewardship metrics compliant with PROPER and ISO 14001 requirements.', pitchId:'Metrik tata kelola air tervalidasi sesuai standar baku mutu PROPER dan persyaratan ISO 14001.',
files:[{label:'Water Withdrawal and Waste Water Discharge Volume',file:'/news/water-withdrawal-and-wastewater-discharge-volume.pdf',type:'PDF',size:'1.34 MB',tag:'Volume Report'}]},
];

const CATEGORY_STYLE: Record<string, { accent: string; soft: string }> = {
  'general-waste': { accent: 'linear-gradient(135deg,#018730 0%,#00a63e 100%)', soft: '#e8f6ed' },
  ghg: { accent: 'linear-gradient(135deg,#0B1320 0%,#16442b 55%,#018730 100%)', soft: '#eaf4ee' },
  b3: { accent: 'linear-gradient(135deg,#fc4509 0%,#ff7a3d 100%)', soft: '#fff1ed' },
  water: { accent: 'linear-gradient(135deg,#0284c7 0%,#06b6d4 100%)', soft: '#ecfeff' },
  general: { accent: 'linear-gradient(135deg,#0F172A 0%,#334155 100%)', soft: '#F1F5F9' },
};
function cmsIconFor(category: string) {
  if (category === 'ghg') return <CloudQueueIcon sx={{fontSize:30,color:'#fff'}}/>;
  if (category === 'b3') return <WarningAmberIcon sx={{fontSize:30,color:'#fff'}}/>;
  if (category === 'water') return <WaterDropIcon sx={{fontSize:30,color:'#fff'}}/>;
  if (category === 'general-waste') return <DeleteOutlinedIcon sx={{fontSize:30,color:'#fff'}}/>;
  return <VerifiedIcon sx={{fontSize:30,color:'#fff'}}/>;
}
interface CmsReportRow { id?: number; title?: string; category?: string; category_title_en?: string; category_title_id?: string; category_desc_en?: string; category_desc_id?: string; category_badge?: string; file_url?: string; fileUrl?: string; file_type?: string; fileType?: string; file_size?: string; fileSize?: string; tag?: string; sort_order?: number; sortOrder?: number; is_active?: boolean; isActive?: boolean; }
export function groupCmsReports(rows: CmsReportRow[]): NewsCategory[] {
  const active = (rows || []).filter((r) => (r.is_active ?? r.isActive ?? true) !== false);
  const byCat = new Map<string, CmsReportRow[]>();
  for (const r of active) {
    const cat = (r.category || 'general').toLowerCase();
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(r);
  }
  const order = ['general-waste', 'ghg', 'b3', 'water'];
  const sortedCats = [...byCat.keys()].sort((a, b) => {
    const ia = order.indexOf(a); const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return sortedCats.map((cat) => {
    const list = byCat.get(cat) || [];
    const files = [...list].sort((a, b) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0)).map((r) => ({
      label: r.title || 'Document',
      file: r.file_url || r.fileUrl || '#',
      type: ((((r.file_type || r.fileType || 'PDF').toUpperCase().includes('XLS')) || (r.file_url || r.fileUrl || '').toLowerCase().endsWith('.xlsx')) ? 'XLSX' : 'PDF') as 'PDF' | 'XLSX',
      size: r.file_size || r.fileSize || '',
      tag: r.tag || undefined,
    }));
    const first = list[0] || {} as CmsReportRow;
    const fb = FALLBACK_CATEGORIES.find((c) => c.id === cat);
    const style = CATEGORY_STYLE[cat] || CATEGORY_STYLE.general;
    return { id: cat, icon: cmsIconFor(cat), accent: style.accent, soft: style.soft, badge: first.category_badge || fb?.badge || cat.toUpperCase(), titleEn: first.category_title_en || fb?.titleEn || first.title || cat, titleId: first.category_title_id || fb?.titleId || first.title || cat, descEn: first.category_desc_en || fb?.descEn || '', descId: first.category_desc_id || fb?.descId || '', pitchEn: fb?.pitchEn || '', pitchId: fb?.pitchId || '', files };
  });
}
export default function NewsClient({ initialRows }: { initialRows?: CmsReportRow[] }){
const {language}=useLanguage();
const isEn=language!=='id';
const [query,setQuery]=useState('');
const [preview,setPreview]=useState<NewsFile|null>(null);
const [cmsCategories,setCmsCategories]=useState<NewsCategory[]|null>(()=>{
  try{
    if(initialRows && initialRows.length>0){
      const grouped=groupCmsReports(initialRows);
      if(grouped.length>0) return grouped;
    }
  }catch{}
  return null;
});
useEffect(()=>{
  if(cmsCategories) return;
  let cancelled=false;
  async function load(){
    try{
      const res=await fetch('/api/public/sustainability-reports',{cache:'no-store'});
      if(!res.ok) return;
      const rows=await res.json();
      if(!cancelled && Array.isArray(rows) && rows.length>0){
        const grouped=groupCmsReports(rows);
        if(grouped.length>0) setCmsCategories(grouped);
      }
    }catch{}
  }
  load();
  return ()=>{cancelled=true;};
},[]);
const CATEGORIES=cmsCategories && cmsCategories.length>0 ? cmsCategories : FALLBACK_CATEGORIES;
const filtered=useMemo(()=>{
const q=query.trim().toLowerCase();
if(!q) return CATEGORIES;
return CATEGORIES.map((c)=>({...c,files:c.files.filter((f)=>f.label.toLowerCase().includes(q)||(isEn?c.titleEn:c.titleId).toLowerCase().includes(q))})).filter((c)=>c.files.length>0||(isEn?c.titleEn:c.titleId).toLowerCase().includes(q));
},[query,isEn,CATEGORIES]);
const totalFiles=CATEGORIES.reduce((n,c)=>n+c.files.length,0);
return (<>
<Box sx={{py:{xs:8,md:11},color:'#fff',position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#071f11 0%,#015e21 48%,#018730 100%)',borderBottom:'4px solid #fc4509'}}>
<Box sx={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px)',backgroundSize:'26px 26px',opacity:0.35}}/>
<Box sx={{position:'absolute',top:-80,right:-60,width:420,height:420,borderRadius:'50%',background:'radial-gradient(circle, rgba(252,69,9,0.38) 0%, transparent 70%)'}}/>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<EnergySavingsLeafIcon sx={{ fontSize: '18px !important', color: '#fff !important' }} />}
            label={isEn ? 'Corporate Sustainability • ESG • Regulatory Compliance' : 'Keberlanjutan Perusahaan • ESG • Kepatuhan Regulasi'}
            sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 800, border: '1px solid rgba(255,255,255,0.28)' }}
          />
          <Chip
            label={isEn ? 'Audit & Due Diligence Ready' : 'Siap Audit & Uji Tuntas Mitra'}
            sx={{ bgcolor: '#fc4509', color: '#fff', fontWeight: 800 }}
          />
        </Stack>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, fontSize: { xs: '2.1rem', sm: '2.9rem', md: '3.5rem' }, lineHeight: 1.08, maxWidth: 860 }}>
          {isEn ? (
            <>Environmental Compliance & <Box component="span" sx={{ color: '#ffb59d' }}>Official Sustainability Reports.</Box></>
          ) : (
            <>Publikasi Kepatuhan Lingkungan & <Box component="span" sx={{ color: '#ffb59d' }}>Laporan ESG Resmi.</Box></>
          )}
        </Typography>
        <Typography sx={{ mt: 2, maxWidth: 780, color: 'rgba(255,255,255,0.88)', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.75 }}>
          {isEn
            ? 'Centralized transparency portal for verified environmental records, greenhouse gas inventory, water balance, and hazardous waste manifests of PT Indonesia Thai Summit Plastech for partner audits and statutory compliance.'
            : 'Pusat transparansi data lingkungan, inventarisasi emisi gas rumah kaca (GRK), neraca air, dan manifest limbah B3 PT Indonesia Thai Summit Plastech untuk audit kepatuhan mitra industri serta pemenuhan standar regulasi hijau.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
          <Button href="#reports" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: '#fff', color: '#015e21', fontWeight: 800, borderRadius: 25, px: 4, py: 1.5, '&:hover': { bgcolor: '#e8f6ed' } }}>
            {isEn ? 'Explore Official Reports' : 'Jelajahi Laporan Resmi'}
          </Button>
          <Button href="/contact" variant="outlined" startIcon={<SupportAgentIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontWeight: 800, borderRadius: 25, px: 4, py: 1.5, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
            {isEn ? 'Contact Compliance Team' : 'Hubungi Tim Kepatuhan'}
          </Button>
        </Stack>
        <Grid container spacing={2} sx={{ mt: 5 }}>
          {[
            { icon: <VerifiedIcon sx={{ color: '#4ade80' }} />, en: `${totalFiles} verified documents`, id: `${totalFiles} dokumen terverifikasi` },
            { icon: <TrendingDownIcon sx={{ color: '#4ade80' }} />, en: 'GHG tracked 2023 → 2025', id: 'GRK terpantau 2023 → 2025' },
            { icon: <AssuredWorkloadIcon sx={{ color: '#4ade80' }} />, en: 'PROPER • ISO 14001 • Audit ready', id: 'Siap PROPER • ISO 14001 • audit' },
            { icon: <FactoryIcon sx={{ color: '#4ade80' }} />, en: 'OEM-grade discipline', id: 'Disiplin standar OEM' },
          ].map((b, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, px: 2, py: 1.5 }}>
                {b.icon}
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>{isEn ? b.en : b.id}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E2E8F0' }}>
      <Container maxWidth="lg">
        <Grid container>
          {[
            { n: '4', en: 'Official report categories', id: 'Kategori laporan resmi' },
            { n: String(totalFiles), en: 'Downloadable public files', id: 'Berkas kepatuhan publik' },
            { n: '3', en: 'Years GHG inventory', id: 'Tahun inventarisasi GRK' },
            { n: '100%', en: 'Open access for partners', id: 'Akses terbuka untuk mitra' },
          ].map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Box sx={{ textAlign: 'center', py: 3.5, px: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#018730', lineHeight: 1 }}>{s.n}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>{isEn ? s.en : s.id}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
    <Box id="reports" sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip label={isEn ? 'Official EHS & ESG Documentation' : 'Dokumentasi Resmi Lingkungan & ESG'} sx={{ bgcolor: '#e8f6ed', color: '#018730', fontWeight: 800, border: '1px solid #a3dfb7', mb: 2 }} />
          <Typography variant="h3" component="h2" color="#0F172A" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            {isEn ? 'Integrated Environmental Compliance Reports' : 'Dokumentasi Kepatuhan Lingkungan Terpadu'}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 740, mx: 'auto', lineHeight: 1.75 }}>
            {isEn
              ? 'Official data and reporting packages accessible for partner audits, ESG questionnaires, and procurement due diligence. Preview in browser or download authorized copies.'
              : 'Paket data dan laporan resmi yang dapat diakses untuk kebutuhan audit kepatuhan mitra, kuesioner ESG, dan uji tuntas pengadaan rantai pasok industri. Pratinjau langsung di peramban atau unduh salinan dokumen.'}
          </Typography>
          <Box sx={{ maxWidth: 520, mx: 'auto', mt: 3 }}>
            <TextField fullWidth value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isEn ? 'Search reports or files... e.g. GHG, B3, water' : 'Cari laporan atau file... mis. GHG, B3, air'} slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#018730' }} /></InputAdornment>) } }} sx={{ bgcolor: '#fff', borderRadius: 3 }} />
          </Box>
        </Box>
        <Grid container spacing={3.5}>
          {filtered.map((cat) => (
            <Grid size={{ xs: 12, md: 6 }} key={cat.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 44px rgba(1,135,48,0.14)', borderColor: '#018730' }, transition: 'all .25s ease' }}>
                <Box sx={{ background: cat.accent, p: 3, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.14)' }} />
                  <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 58, height: 58, border: '1px solid rgba(255,255,255,0.35)' }}>{cat.icon}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Chip label={cat.badge} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: '0.68rem', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.25 }}>{isEn ? cat.titleEn : cat.titleId}</Typography>
                    </Box>
                    <Chip label={`${cat.files.length} file${cat.files.length > 1 ? 's' : ''}`} size="small" sx={{ bgcolor: '#fff', color: '#0F172A', fontWeight: 800 }} />
                  </Stack>
                </Box>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: '#fff' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, mb: 1.5 }}>{isEn ? cat.descEn : cat.descId}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, bgcolor: cat.soft, border: '1px dashed #94a3b8', borderRadius: 2, p: 1.5, mb: 2.5 }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 18, color: '#018730', mt: 0.2 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', lineHeight: 1.6 }}>
                      <Box component="span" sx={{ color: '#018730', fontWeight: 800 }}>{isEn ? 'Compliance Note: ' : 'Catatan Kepatuhan: '}</Box>
                      {isEn ? cat.pitchEn : cat.pitchId}
                    </Typography>
                  </Box>
<Stack spacing={1.5} sx={{flexGrow:1}}>
{cat.files.map((f)=>(
<Paper key={f.file+f.label} elevation={0} sx={{display:'flex',alignItems:'center',gap:1.5,p:1.5,borderRadius:2.5,border:'1px solid #E2E8F0',bgcolor:'#F8FAFC','&:hover':{borderColor:'#018730',bgcolor:'#fff'},transition:'all .2s'}}>
<Avatar sx={{bgcolor:f.type==='PDF'?'#fee2e2':'#dcfce7',width:42,height:42}}>{f.type==='PDF'?<PictureAsPdfIcon sx={{color:'#dc2626'}}/>:<TableChartIcon sx={{color:'#018730'}}/>}</Avatar>
<Box sx={{flex:1,minWidth:0}}><Typography variant="body2"  color="#0F172A" sx={{fontWeight:800}}>{f.label}</Typography><Box sx={{display:'flex',gap:1,mt:0.5,alignItems:'center',flexWrap:'wrap'}}><Chip label={f.type} size="small" sx={{height:20,fontSize:'0.65rem',fontWeight:800,bgcolor:f.type==='PDF'?'#dc2626':'#018730',color:'#fff'}}/><Typography variant="caption" color="text.secondary"  sx={{fontWeight:600}}>{f.size}</Typography>{f.tag&&<Chip label={f.tag} size="small" variant="outlined" sx={{height:20,fontSize:'0.65rem',fontWeight:700}}/>}</Box></Box>
<Stack direction="row" spacing={1}>
{f.type==='PDF'&&<IconButton size="small" onClick={()=>setPreview(f)} sx={{border:'1px solid #CBD5E1',color:'#018730','&:hover':{borderColor:'#018730',bgcolor:'#e8f6ed'}}}><VisibilityIcon fontSize="small"/></IconButton>}
<IconButton size="small" component="a" href={f.file} download sx={{bgcolor:'#018730',color:'#fff','&:hover':{bgcolor:'#016f27'}}}><DownloadIcon fontSize="small"/></IconButton>
</Stack>
</Paper>))}
</Stack>
<Divider sx={{my:2.5}}/>
<Stack direction="row" spacing={1.5}>
{cat.files[0]?.type==='PDF'&&<Button variant="outlined" size="small" startIcon={<VisibilityIcon/>} onClick={()=>setPreview(cat.files[0])} sx={{flex:1,borderColor:'#CBD5E1',color:'#334155',fontWeight:700,borderRadius:25,'&:hover':{borderColor:'#018730',color:'#018730'}}}>{isEn?'Quick Preview':'Pratinjau'}</Button>}
<Button variant="contained" size="small" startIcon={<DownloadIcon/>} component="a" href={cat.files[0]?.file} download sx={{flex:1,bgcolor:'#0F172A',fontWeight:700,borderRadius:25,'&:hover':{bgcolor:'#018730'}}}>{isEn?'Download File':'Unduh File'}</Button>
</Stack>
</Box>
</Card>
</Grid>))}
</Grid>
</Container>
</Box>
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip
              label={isEn ? 'ESG & COMPLIANCE TRANSPARENCY' : 'TRANSPARANSI KEPATUHAN & ESG'}
              sx={{
                bgcolor: 'rgba(1, 135, 48, 0.08)',
                color: '#018730',
                fontWeight: 800,
                border: '1px solid rgba(1, 135, 48, 0.25)',
                mb: 2,
              }}
            />
            <Typography variant="h3" color="#0F172A" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              {isEn ? 'Compliance & ESG Document Access for Industrial Partners' : 'Komitmen Kepatuhan & Akses Dokumen ESG bagi Mitra Industri'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 740, mx: 'auto', mt: 1.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              {isEn
                ? 'Providing seamless data transparency, audit-ready environmental documentation, and regulatory compliance for our industrial partners and stakeholders.'
                : 'Menyediakan transparansi data terpadu, kemudahan verifikasi audit mutu lingkungan, dan kesiapan pemenuhan regulasi industri hijau bagi mitra industri dan pemangku kepentingan.'}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              {
                n: '01',
                enT: 'Data Transparency & Direct Access',
                idT: 'Transparansi Data & Akses Mandiri',
                enD: 'Open access without administrative barriers to all environmental disclosures, streamlining routine data verification for industrial partners.',
                idD: 'Akses terbuka tanpa hambatan birokrasi terhadap seluruh dokumen dan laporan lingkungan, memudahkan verifikasi data berkala bagi mitra industri.',
              },
              {
                n: '02',
                enT: 'Streamlined Environmental Audit Verification',
                idT: 'Kemudahan Verifikasi Audit Mutu Lingkungan',
                enD: 'Standardized documentation covering water balance, hazardous waste manifests, and emission logs readily available for environmental quality audits.',
                idD: 'Dokumentasi terstandarisasi mencakup neraca air, manifest limbah B3, dan inventarisasi emisi yang selalu siap untuk verifikasi audit mutu lingkungan.',
              },
              {
                n: '03',
                enT: 'Green Industry Regulatory Readiness',
                idT: 'Kesiapan Pemenuhan Regulasi Industri Hijau',
                enD: 'Comprehensive compliance readiness for PROPER regulations, ISO 14001 certifications, and manufacturing supply chain sustainability disclosures (Scope 3).',
                idD: 'Kesiapan menyeluruh terhadap kepatuhan regulasi PROPER, sertifikasi ISO 14001, serta pelaporan keberlanjutan rantai pasok manufaktur (Scope 3).',
              },
            ].map((s, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Box
                  sx={{
                    p: 3.5,
                    borderRadius: 4,
                    border: '1px solid #E2E8F0',
                    bgcolor: '#F8FAFC',
                    height: '100%',
                    position: 'relative',
                    '&:hover': { borderColor: '#018730', bgcolor: '#fff' },
                    transition: 'all .25s',
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: '#e8f6ed',
                      position: 'absolute',
                      top: 8,
                      right: 16,
                      fontSize: '3.5rem',
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, position: 'relative' }}>
                    <CheckCircleIcon sx={{ color: '#018730' }} />
                    <Typography variant="h6" color="#0F172A" sx={{ fontWeight: 800 }}>
                      {isEn ? s.enT : s.idT}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ position: 'relative' }}>
                    {isEn ? s.enD : s.idD}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box
            sx={{
              mt: 5,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(135deg,#0B1320 0%,#1a3a2a 100%)',
              color: '#fff',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                <AssuredWorkloadIcon sx={{ color: '#4ade80' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {isEn ? 'Verified Environmental & Quality Compliance' : 'Kepatuhan Lingkungan & Manajemen Mutu Terverifikasi'}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                {isEn
                  ? 'Aligned with PROPER, ISO 14001, IATF 16949, ESG scorecard evaluations, and global automotive sustainability benchmarks.'
                  : 'Selaras dengan regulasi PROPER, ISO 14001, IATF 16949, evaluasi kartu skor ESG, dan tolak ukur keberlanjutan rantai pasok otomotif global.'}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
                {['PROPER', 'ISO 14001', 'Scope 3 GHG', 'B3 Manifest', 'Water Balance', 'IATF 16949'].map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                ))}
              </Stack>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
              <Button
                href="/contact"
                variant="contained"
                startIcon={<SupportAgentIcon />}
                sx={{ bgcolor: '#fc4509', fontWeight: 800, borderRadius: 25, px: 3.5, py: 1.4, '&:hover': { bgcolor: '#e03800' } }}
              >
                {isEn ? 'Request Stamped Copy' : 'Minta Dokumen Berstempel'}
              </Button>
              <Button
                href="/certifications"
                variant="outlined"
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  fontWeight: 700,
                  borderRadius: 25,
                  px: 3.5,
                  py: 1.4,
                  '&:hover': { borderColor: '#fff' },
                }}
              >
                {isEn ? 'View ISO Certificates' : 'Lihat Sertifikat ISO'}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Box sx={{ pb: { xs: 7, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="md">
          <Box
            sx={{
              borderRadius: 5,
              py: { xs: 5, md: 6 },
              px: { xs: 3, sm: 6 },
              background: 'linear-gradient(135deg,#018730 0%,#01752a 50%,#015e21 100%)',
              color: '#fff',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 45px rgba(1,135,48,0.28)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, position: 'relative', zIndex: 1 }}>
              {isEn ? 'Need Stamped Documents for Vendor Registration?' : 'Memerlukan Berkas Resmi untuk Registrasi Vendor?'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.92)', mb: 3.5, maxWidth: 560, mx: 'auto', position: 'relative', zIndex: 1 }}>
              {isEn
                ? 'Our compliance and corporate affairs team provides official stamped documentation and verified certificates within 1 business day.'
                : 'Tim kepatuhan dan manajemen korporat kami siap menyediakan paket dokumen resmi berstempel dan sertifikat dalam 1 hari kerja.'}
            </Typography>
            <Button
              href="/contact"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#fc4509',
                fontWeight: 800,
                borderRadius: 25,
                px: 5,
                py: 1.6,
                position: 'relative',
                zIndex: 1,
                '&:hover': { bgcolor: '#e03800' },
              }}
            >
              {isEn ? 'Contact Corporate Team' : 'Hubungi Tim Korporat'}
            </Button>
          </Box>
        </Container>
      </Box>
      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#0B1320', color: '#fff', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PictureAsPdfIcon sx={{ color: '#f87171' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {preview?.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {preview?.size} • PDF Preview
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {preview && (
              <Button
                component="a"
                href={preview.file}
                download
                size="small"
                startIcon={<DownloadIcon />}
                variant="contained"
                sx={{ bgcolor: '#018730', '&:hover': { bgcolor: '#016f27' } }}
              >
                Download
              </Button>
            )}
            <IconButton onClick={() => setPreview(null)} sx={{ color: '#94A3B8', '&:hover': { color: '#fff' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#334155', height: { xs: '70vh', md: '78vh' } }}>
          {preview && (
            <Box component="iframe" src={preview.file} title={preview.label} sx={{ width: '100%', height: '100%', border: 'none', bgcolor: '#fff' }} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
