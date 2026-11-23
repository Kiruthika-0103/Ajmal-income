import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Bike, CalendarDays,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Cloud, Download, Edit3,
  FileText, Home, IndianRupee, LogOut, Menu, Plus, RefreshCw, Search, Settings,
  ShieldCheck, Trash2, TrendingUp, Wallet, X, RotateCcw, Fuel, UserRound, Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { isSupabaseConfigured, supabase } from './supabase';

const platforms = [
  { id:'Rapido', name:'Rapido', mark:'R', color:'#f5c400', ink:'#171717' },
  { id:'Zomato', name:'Zomato', mark:'z', color:'#e23744', ink:'#fff' },
  { id:'Swiggy', name:'Swiggy', mark:'S', color:'#f58220', ink:'#fff' },
  { id:'Uber', name:'Uber', mark:'U', color:'#111827', ink:'#fff' },
  { id:'Other', name:'Other', mark:'+', color:'#64748b', ink:'#fff' }
];
const categories = ['Petrol','Maintenance','Food','Mobile recharge','Parking','Other'];
const today = () => format(new Date(), 'yyyy-MM-dd');
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n||0));
const platform = id => platforms.find(p=>p.id===id) || platforms[4];

function Brand({small=false}) {
  return <div className="brand"><div className="brand-mark">🛵</div><div><b>AJMALL</b><small>Track · Earn · Grow</small></div></div>;
}
function PlatformMark({id}) {
  const p=platform(id); return <span className="platform-mark" style={{background:p.color,color:p.ink}}>{p.mark}</span>;
}
function Auth({onReady}) {
  const [mode,setMode]=useState('login'), [email,setEmail]=useState(''), [password,setPassword]=useState('');
  const [name,setName]=useState(''), [busy,setBusy]=useState(false), [error,setError]=useState('');
  async function submit(e){
    e.preventDefault(); setBusy(true); setError('');
    try {
      if(!isSupabaseConfigured) throw new Error('Cloud setup is not complete. Add your Supabase URL and publishable key in the .env file first.');
      if(mode==='signup'){
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
        if(error) throw error;
        if(data.session) onReady(data.session.user);
        else setError('Account created. Check your email to confirm, then sign in.');
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error; onReady(data.user);
      }
    } catch(err){setError(err.message || 'Something went wrong.');}
    finally{setBusy(false);}
  }
  return <div className="auth-wrap"><div className="auth-card"><Brand/><div className="auth-copy"><h1>{mode==='login'?'Welcome back':'Create your AJMALL account'}</h1><p>Your delivery earnings, safely saved in the cloud.</p></div>
    <form onSubmit={submit} className="form-stack">
      {mode==='signup'&&<label>Your name<input value={name} onChange={e=>setName(e.target.value)} required placeholder="Name"/></label>}
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6" placeholder="At least 6 characters"/></label>
      {error&&<div className="error">{error}</div>}
      <button className="primary full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}</button>
    </form>
    <p className="auth-switch">{mode==='login'?"New to AJMALL?":"Already have an account?"} <button className="text-button" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>{mode==='login'?'Create account':'Sign in'}</button></p>
    <div className="secure-note"><ShieldCheck size={15}/> Your records are private to your account.</div>
  </div></div>;
}

function EntryModal({entry,onClose,onSave}) {
  const [form,setForm]=useState(entry||{kind:'income',platform:'Rapido',category:'Petrol',amount:'',rides:'',date:today(),notes:''});
  const [busy,setBusy]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  async function submit(e){e.preventDefault();setBusy(true);await onSave({...form,amount:Number(form.amount),rides:Number(form.rides||0)});setBusy(false);}
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="modal-head"><div><span className="eyebrow">{entry?'UPDATE RECORD':'NEW RECORD'}</span><h2>{entry?'Edit entry':'Add income or expense'}</h2></div><button className="icon-button" onClick={onClose}><X/></button></div>
    <form onSubmit={submit} className="form-stack">
      <div className="segmented"><button type="button" className={form.kind==='income'?'active':''} onClick={()=>set('kind','income')}>＋ Income</button><button type="button" className={form.kind==='expense'?'active expense-active':''} onClick={()=>set('kind','expense')}>− Expense</button></div>
      {form.kind==='income'?<label>Platform<select value={form.platform} onChange={e=>set('platform',e.target.value)}>{platforms.map(p=><option key={p.id}>{p.id}</option>)}</select></label>:<label>Expense category<select value={form.category} onChange={e=>set('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>}
      <div className="two-col"><label>Amount (₹)<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0"/></label><label>Date<input type="date" required value={form.date} onChange={e=>set('date',e.target.value)}/></label></div>
      {form.kind==='income'&&<label>Rides / orders<input type="number" min="0" value={form.rides} onChange={e=>set('rides',e.target.value)} placeholder="0"/></label>}
      <label>Notes (optional)<input value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="e.g. Evening rides, fuel refill"/></label>
      <button className="primary full" disabled={busy}>{busy?'Saving…':'Save record'}</button>
    </form>
  </div></div>;
}

export default function App(){
  const [user,setUser]=useState(null), [checking,setChecking]=useState(true), [tab,setTab]=useState('Dashboard');
  const [records,setRecords]=useState([]), [trash,setTrash]=useState([]), [loading,setLoading]=useState(false);
  const [modal,setModal]=useState(null), [range,setRange]=useState('This Month'), [query,setQuery]=useState('');
  const [notice,setNotice]=useState(''), [mobileNav,setMobileNav]=useState(false);
  useEffect(()=>{
    if(!isSupabaseConfigured){setChecking(false);return;}
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setChecking(false)});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));
    return ()=>subscription.unsubscribe();
  },[]);
  async function load(){
    if(!user||!supabase)return;setLoading(true);
    const [{data:a,error:e1},{data:b,error:e2}]=await Promise.all([
      supabase.from('transactions').select('*').eq('user_id',user.id).is('deleted_at',null).order('date',{ascending:false}).order('created_at',{ascending:false}),
      supabase.from('transactions').select('*').eq('user_id',user.id).not('deleted_at','is',null).order('deleted_at',{ascending:false})
    ]);
    if(e1||e2)setNotice((e1||e2).message);else{setRecords(a||[]);setTrash(b||[]);}
    setLoading(false);
  }
  useEffect(()=>{load()},[user]);
  async function saveRecord(item){
    const payload={kind:item.kind,platform:item.kind==='income'?item.platform:null,category:item.kind==='expense'?item.category:null,amount:item.amount,rides:item.kind==='income'?item.rides:0,date:item.date,notes:item.notes||'',user_id:user.id};
    const result=item.id?await supabase.from('transactions').update(payload).eq('id',item.id).eq('user_id',user.id):await supabase.from('transactions').insert(payload);
    if(result.error)setNotice(result.error.message);else{setNotice('Record saved successfully.');setModal(null);await load();}
  }
  async function softDelete(item){
    if(!confirm('Move this record to Recently Deleted? You can restore it later.'))return;
    const {error}=await supabase.from('transactions').update({deleted_at:new Date().toISOString()}).eq('id',item.id).eq('user_id',user.id);
    if(error)setNotice(error.message);else{setNotice('Moved to Recently Deleted.');await load();}
  }
  async function restore(item){
    const {error}=await supabase.from('transactions').update({deleted_at:null}).eq('id',item.id).eq('user_id',user.id);
    if(error)setNotice(error.message);else{setNotice('Record restored.');await load();}
  }
  async function permanentDelete(item){
    if(!confirm('Permanently delete this record? This cannot be undone.'))return;
    const {error}=await supabase.from('transactions').delete().eq('id',item.id).eq('user_id',user.id);
    if(error)setNotice(error.message);else{setNotice('Permanently deleted.');await load();}
  }
  async function emptyTrash(){
    if(!trash.length||!confirm('Permanently delete every item in Recently Deleted? This cannot be undone.'))return;
    const {error}=await supabase.from('transactions').delete().eq('user_id',user.id).not('deleted_at','is',null);
    if(error)setNotice(error.message);else{setNotice('Recently Deleted is now empty.');await load();}
  }
  const periodRecords=useMemo(()=>{
    const now=new Date();
    return records.filter(r=>{
      const d=parseISO(r.date);
      if(range==='Today')return r.date===today();
      if(range==='This Week')return isWithinInterval(d,{start:startOfWeek(now,{weekStartsOn:1}),end:endOfWeek(now,{weekStartsOn:1})});
      if(range==='This Month')return isWithinInterval(d,{start:startOfMonth(now),end:endOfMonth(now)});
      return true;
    });
  },[records,range]);
  const income=periodRecords.filter(r=>r.kind==='income').reduce((s,r)=>s+Number(r.amount),0);
  const expenses=periodRecords.filter(r=>r.kind==='expense').reduce((s,r)=>s+Number(r.amount),0);
  const rides=periodRecords.reduce((s,r)=>s+Number(r.rides||0),0);
  const net=income-expenses;
  const platformTotals=platforms.slice(0,4).map(p=>({...p,total:periodRecords.filter(r=>r.kind==='income'&&r.platform===p.id).reduce((s,r)=>s+Number(r.amount),0)}));
  const visible=periodRecords.filter(r=>(tab==='Income'?r.kind==='income':tab==='Expenses'?r.kind==='expense':true)).filter(r=>[r.platform,r.category,r.notes,r.date].join(' ').toLowerCase().includes(query.toLowerCase()));
  const nav=[['Dashboard',Home],['Income',ArrowUpRight],['Expenses',Wallet],['Reports',BarChart3],['Recently Deleted',Trash2],['Profile',UserRound]];
  if(checking)return <div className="loading-screen"><div className="spinner"/>Loading AJMALL…</div>;
  if(!user)return <Auth onReady={setUser}/>;
  if(!isSupabaseConfigured)return <Auth onReady={setUser}/>;
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'open':''}`}><div className="side-top"><Brand/><button className="close-nav icon-button" onClick={()=>setMobileNav(false)}><X/></button></div>
      <div className="nav-label">WORKSPACE</div>{nav.map(([label,Icon])=><button key={label} className={`nav-item ${tab===label?'selected':''}`} onClick={()=>{setTab(label);setMobileNav(false);setQuery('')}}><Icon size={18}/><span>{label}</span>{label==='Recently Deleted'&&trash.length>0&&<em>{trash.length}</em>}</button>)}
      <div className="side-bottom"><div className="cloud-status"><Cloud size={17}/><div><b>Cloud sync active</b><small>Your data is backed up</small></div><span className="online-dot"/></div><div className="profile-mini"><div className="avatar">{(user.user_metadata?.full_name||user.email||'A')[0].toUpperCase()}</div><div className="profile-text"><b>{user.user_metadata?.full_name||'My account'}</b><small>{user.email}</small></div><button className="icon-button" title="Sign out" onClick={()=>supabase.auth.signOut()}><LogOut size={17}/></button></div></div>
    </aside>
    {mobileNav&&<div className="nav-scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button menu-toggle" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><b>{tab}</b></div><div className="top-actions"><span className="sync-label"><Cloud size={15}/> Synced</span><div className="avatar">{(user.user_metadata?.full_name||user.email||'A')[0].toUpperCase()}</div></div></header>
      <div className="content">
        <section className="welcome-banner"><div><span className="eyebrow">YOUR MONEY, IN ONE PLACE</span><h1>Welcome back, {user.user_metadata?.full_name?.split(' ')[0]||'Partner'}! 👋</h1><p>Every ride counts. Keep your earnings and expenses in control.</p></div><div className="banner-art">🛵</div></section>
        {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {tab==='Recently Deleted'?<section className="panel page-panel"><div className="section-head"><div><span className="eyebrow">RECOVERY CENTER</span><h2>Recently Deleted</h2><p>Restore records or permanently remove them.</p></div>{trash.length>0&&<button className="danger-outline" onClick={emptyTrash}><Trash2 size={16}/> Empty trash</button>}</div>
          <RecordTable rows={trash} onEdit={()=>{}} onDelete={permanentDelete} onRestore={restore} trash/></section>
        :tab==='Profile'?<section className="panel page-panel"><span className="eyebrow">ACCOUNT</span><h2>Profile & security</h2><p className="muted">Signed in as <b>{user.email}</b></p><div className="profile-info"><ShieldCheck/><div><b>Your records are protected</b><p>Each account can only read and change its own transactions through database security policies.</p></div></div><button className="danger-outline" onClick={()=>supabase.auth.signOut()}><LogOut size={16}/> Sign out</button></section>
        :<>
          {tab==='Dashboard'&&<><div className="stat-grid">
            <Stat icon={<Wallet/>} label="Total Income" value={money(income)} tone="green" sub={`${periodRecords.filter(r=>r.kind==='income').length} income entries`}/>
            <Stat icon={<ArrowDownRight/>} label="Total Expenses" value={money(expenses)} tone="red" sub={`${periodRecords.filter(r=>r.kind==='expense').length} expense entries`}/>
            <Stat icon={<TrendingUp/>} label="Net Income" value={money(net)} tone="mint" sub="Income minus expenses"/>
            <Stat icon={<Bike/>} label="Rides / Orders" value={rides.toLocaleString('en-IN')} tone="blue" sub="Recorded rides and orders"/>
          </div><div className="dashboard-grid"><section className="panel chart-panel"><div className="section-head"><div><h2><BarChart3 size={19}/> Income vs Expenses</h2><p>Based on selected period</p></div><select className="small-select" value={range} onChange={e=>setRange(e.target.value)}><option>Today</option><option>This Week</option><option>This Month</option><option>All Time</option></select></div><div className="chart-wrap"><MiniBars income={income} expenses={expenses}/></div></section>
          <section className="panel platform-panel"><div className="section-head"><div><h2>Platform-wise Income</h2><p>See which app earns more</p></div></div>{platformTotals.map(p=><div className="platform-row" key={p.id}><PlatformMark id={p.id}/><span>{p.name}</span><b>{money(p.total)}</b><div className="bar-track"><i style={{width:`${income?Math.max(2,p.total/income*100):0}%`,background:p.color}}/></div></div>)}</section></div>
          <div className="bottom-grid"><section className="panel"><div className="section-head"><div><h2>Recent Activity</h2><p>Your latest saved records</p></div><button className="text-button" onClick={()=>setTab('History')}>View records <ChevronRight size={15}/></button></div><RecordTable rows={records.slice(0,5)} onEdit={r=>setModal(r)} onDelete={softDelete}/></section>
          <section className="panel quick-panel"><div className="section-head"><h2>Quick actions</h2></div><button className="quick-btn income-btn" onClick={()=>setModal({kind:'income',platform:'Rapido',amount:'',rides:'',date:today(),notes:''})}><Plus/> Add income</button><button className="quick-btn expense-btn" onClick={()=>setModal({kind:'expense',category:'Petrol',amount:'',date:today(),notes:''})}><Plus/> Add expense</button><div className="tip-box">💡 <span>Small daily entries make your monthly income clear.</span></div></section></div></>}
          {tab!=='Dashboard'&&<section className="panel page-panel"><div className="section-head"><div><span className="eyebrow">YOUR RECORDS</span><h2>{tab==='History'?'All transactions':tab}</h2><p>Review and manage your saved records.</p></div><button className="primary" onClick={()=>setModal({kind:tab==='Expenses'?'expense':'income',platform:'Rapido',category:'Petrol',amount:'',rides:'',date:today(),notes:''})}><Plus size={17}/> Add {tab==='Expenses'?'expense':'income'}</button></div><div className="table-tools"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platform, note or date…"/></div><select className="small-select" value={range} onChange={e=>setRange(e.target.value)}><option>Today</option><option>This Week</option><option>This Month</option><option>All Time</option></select></div><RecordTable rows={visible} onEdit={r=>setModal(r)} onDelete={softDelete}/></section>}
        </>}
        <footer className="footer"><span>© {new Date().getFullYear()} AJMALL · Ride Tracker</span><span><ShieldCheck size={14}/> Your data is securely synced to your account</span></footer>
      </div>
    </main>
    {modal&&<EntryModal entry={modal.id?modal:null} onClose={()=>setModal(null)} onSave={saveRecord}/>}
  </div>;
}

function Stat({icon,label,value,tone,sub}){return <div className={`stat-card ${tone}`}><div className="stat-icon">{icon}</div><div className="stat-info"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>}
function MiniBars({income,expenses}){const max=Math.max(income,expenses,1);return <div className="mini-chart"><div className="axis-labels"><span>{money(max)}</span><span>{money(max/2)}</span><span>₹0</span></div><div className="bar-area"><div className="grid-lines"><i/><i/><i/></div><div className="bar-group"><div className="bar-column"><div className="bar income-bar" style={{height:`${income/max*100}%`}}/><small>Income</small></div><div className="bar-column"><div className="bar expense-bar" style={{height:`${expenses/max*100}%`}}/><small>Expenses</small></div></div></div></div>}
function RecordTable({rows,onEdit,onDelete,onRestore,trash=false}){
  if(!rows.length)return <div className="empty-state"><div>📒</div><b>{trash?'Trash is empty':'No records yet'}</b><p>{trash?'Deleted records will appear here.':'Add your first income or expense to get started.'}</p></div>;
  return <div className="table-scroll"><table><thead><tr><th>Date</th><th>Type</th><th>Platform / Category</th><th>Amount</th><th>Notes</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{format(parseISO(r.date),'dd MMM yyyy')}</td><td><span className={`type-pill ${r.kind}`}>{r.kind==='income'?'● Income':'● Expense'}</span></td><td><span className="platform-cell">{r.kind==='income'?<PlatformMark id={r.platform}/>:<span className="category-mark"><Fuel size={14}/></span>}{r.platform||r.category}</span></td><td className={`amount ${r.kind}`}>{r.kind==='income'?'+':'−'}{money(r.amount)}</td><td className="note-cell">{r.notes||'—'}</td><td><div className="row-actions">{trash?<><button className="restore-btn" title="Restore" onClick={()=>onRestore(r)}><RotateCcw size={16}/></button><button className="delete-btn" title="Permanently delete" onClick={()=>onDelete(r)}><Trash2 size={16}/></button></>:<><button className="edit-btn" title="Edit" onClick={()=>onEdit(r)}><Edit3 size={16}/></button><button className="delete-btn" title="Move to recently deleted" onClick={()=>onDelete(r)}><Trash2 size={16}/></button></>}</div></td></tr>)}</tbody></table></div>;
}
