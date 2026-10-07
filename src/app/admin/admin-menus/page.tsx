'use client';
import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Switch, Alert, CircularProgress, Stack, FormControlLabel, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
type M={id:number;title:string;url:string;portal:string;location:string;icon?:string|null;sortOrder:number;isActive:boolean;allowedRoles?:string|null};
export default function AdminMenusPage(){
  const [items,setItems]=useState<M[]>([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState<'perusahaan'|'karir'>('perusahaan');
  const [open,setOpen]=useState(false);
  const [edit,setEdit]=useState<M|null>(null);
  const [form,setForm]=useState({title:'',url:'/admin',portal:'perusahaan',location:'admin_sidebar',icon:'',sortOrder:0,isActive:true,allowedRoles:''});
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');
  const load=async()=>{
    setLoading(true);
    try{
      const r=await fetch('/api/cms/admin-menus?portal='+tab,{cache:'no-store'});
      const j=await r.json();
      const arr=Array.isArray(j)?j:(j.data||j.admin_menus||[]);
      setItems((arr||[]).map((x:any)=>({id:x.id,title:x.title,url:x.url,portal:x.portal,location:x.location,icon:x.icon,sortOrder:x.sortOrder??x.sort_order??0,isActive:x.isActive??x.is_active??true,allowedRoles:x.allowedRoles??x.allowed_roles??null})));
    }catch(e:any){setErr(e.message)} finally{setLoading(false)}
  };
  useEffect(()=>{load()},[tab]);
  const add=()=>{ setEdit(null); setForm({title:'',url:'/admin',portal:tab,location:tab==='karir'?'admin_top':'admin_sidebar',icon:'',sortOrder:items.length,isActive:true,allowedRoles:''}); setOpen(true); };
  const editIt=(m:M)=>{ setEdit(m); setForm({title:m.title,url:m.url,portal:m.portal,location:m.location,icon:m.icon||'',sortOrder:m.sortOrder,isActive:m.isActive,allowedRoles:m.allowedRoles||''}); setOpen(true); };
  const save=async()=>{
    setSaving(true); setErr('');
    try{
      const p:any={title:form.title,url:form.url,portal:form.portal,location:form.location,icon:form.icon||null,sort_order:form.sortOrder,is_active:form.isActive,allowed_roles:form.allowedRoles||null};
      const method=edit?'PUT':'POST';
      const body=edit?{id:edit.id,...p}:p;
      const r=await fetch('/api/cms/admin-menus',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||'Gagal');
      setMsg('Tersimpan'); setOpen(false); load();
    }catch(e:any){setErr(e.message)} finally{setSaving(false)}
  };
  const del=async(id:number)=>{
    if(!confirm('Hapus menu?')) return;
    try{ const r=await fetch('/api/cms/admin-menus?id='+id,{method:'DELETE'}); const j=await r.json(); if(!r.ok) throw new Error(j.error); load(); }catch(e:any){setErr(e.message)}
  };
  const tog=async(m:M)=>{
    try{ const r=await fetch('/api/cms/admin-menus',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:m.id,is_active:!m.isActive})}); if(!r.ok) throw new Error((await r.json()).error); load(); }catch(e:any){setErr(e.message)}
  };
  return(<Box>
    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:3,flexWrap:'wrap',gap:2}}>
      <Box><Typography variant="h5" fontWeight={900} color="#0F172A">Menu Admin Dinamis</Typography><Typography variant="body2" color="text.secondary">Kelola sidebar Company & top-nav Karir. Filter portal & role.</Typography></Box>
      <Button variant="contained" startIcon={<AddIcon/>} onClick={add} sx={{bgcolor:'#018730',fontWeight:700}}>Tambah Menu</Button>
    </Box>
    {msg&&<Alert severity="success" sx={{mb:2}} onClose={()=>setMsg('')}>{msg}</Alert>}
    {err&&<Alert severity="error" sx={{mb:2}} onClose={()=>setErr('')}>{err}</Alert>}
    <Stack direction="row" spacing={1} sx={{mb:2}}>
      <Button variant={tab==='perusahaan'?'contained':'outlined'} onClick={()=>setTab('perusahaan')} sx={{fontWeight:700}}>Company (Sidebar)</Button>
      <Button variant={tab==='karir'?'contained':'outlined'} onClick={()=>setTab('karir')} sx={{fontWeight:700}}>Karir (Top Nav)</Button>
    </Stack>
    {loading?<Box sx={{p:6,display:'flex',justifyContent:'center'}}><CircularProgress sx={{color:'#018730'}}/></Box>:(
      <TableContainer component={Paper} sx={{borderRadius:3,border:'1px solid #E2E8F0'}}>
        <Table>
          <TableHead sx={{bgcolor:'#F8FAFC'}}><TableRow><TableCell sx={{fontWeight:700}}>Judul</TableCell><TableCell sx={{fontWeight:700}}>URL</TableCell><TableCell sx={{fontWeight:700}}>Lokasi</TableCell><TableCell sx={{fontWeight:700}}>Role</TableCell><TableCell sx={{fontWeight:700}}>Aktif</TableCell><TableCell align="right" sx={{fontWeight:700}}>Aksi</TableCell></TableRow></TableHead>
          <TableBody>
            {items.length===0?<TableRow><TableCell colSpan={6} sx={{textAlign:'center',py:6,color:'text.secondary'}}>Belum ada menu. Klik Tambah Menu.</TableCell></TableRow>:items.sort((a,b)=>a.sortOrder-b.sortOrder).map(m=>(
              <TableRow key={m.id} hover>
                <TableCell sx={{fontWeight:700}}>{m.title}<Typography variant="caption" color="text.secondary" sx={{display:'block'}}>{m.icon||'-'}</Typography></TableCell>
                <TableCell sx={{fontFamily:'monospace',fontSize:'0.8rem'}}>{m.url}</TableCell>
                <TableCell><Chip label={m.location} size="small" /></TableCell>
                <TableCell sx={{fontSize:'0.75rem'}}>{m.allowedRoles||'Semua'}</TableCell>
                <TableCell><Switch checked={m.isActive} onChange={()=>tog(m)} color="success" size="small"/></TableCell>
                <TableCell align="right"><IconButton size="small" onClick={()=>editIt(m)}><EditIcon fontSize="small"/></IconButton><IconButton size="small" color="error" onClick={()=>del(m.id)}><DeleteIcon fontSize="small"/></IconButton></TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>)}
    <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{fontWeight:800}}>{edit?'Edit':'Tambah'} Menu</DialogTitle>
      <DialogContent sx={{display:'grid',gap:2,pt:2}}>
        <TextField label="Judul" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} fullWidth required sx={{mt:2}}/>
        <TextField label="URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} fullWidth required helperText="/admin/..." />
        <TextField select label="Portal" value={form.portal} onChange={e=>setForm({...form,portal:e.target.value})} fullWidth><MenuItem value="perusahaan">perusahaan</MenuItem><MenuItem value="karir">karir</MenuItem><MenuItem value="both">both</MenuItem></TextField>
        <TextField select label="Lokasi" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} fullWidth><MenuItem value="admin_sidebar">admin_sidebar</MenuItem><MenuItem value="admin_top">admin_top</MenuItem></TextField>
        <TextField label="Icon (MUI)" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} fullWidth placeholder="DashboardIcon"/>
        <TextField label="Sort Order" type="number" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})} fullWidth/>
        <TextField label="allowed_roles CSV" value={form.allowedRoles} onChange={e=>setForm({...form,allowedRoles:e.target.value})} fullWidth placeholder="admin,hr atau kosong=semua"/>
        <FormControlLabel control={<Switch checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} color="success"/>} label="Aktif"/>
      </DialogContent>
      <DialogActions><Button onClick={()=>setOpen(false)}>Batal</Button><Button variant="contained" onClick={save} disabled={saving} sx={{bgcolor:'#018730'}}>{saving?'Saving...':'Simpan'}</Button></DialogActions>
    </Dialog>
  </Box>);
}
