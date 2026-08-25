import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DocumentEditor from '../components/DocumentEditor'

interface Driver {
  id: string; name: string; phone: string; email?: string
  branch: 'eldoret'|'kisumu'; national_id?: string
  photo_url?: string; licence_number?: string; licence_class?: string
  licence_expiry?: string; psv_badge_number?: string; psv_expiry?: string
  good_conduct_expiry?: string; medical_expiry?: string
  status: 'available'|'on_trip'|'on_safari'|'off_duty'
  emergency_contact?: string; emergency_phone?: string
  date_joined?: string; notes?: string; created_at: string
}

const STATUS: Record<string,{label:string;color:string;bg:string;border:string}> = {
  available: { label:'Available',  color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  on_trip:   { label:'On trip',    color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  on_safari: { label:'On safari',  color:'rgba(206,147,216,0.95)', bg:'rgba(206,147,216,0.08)', border:'rgba(206,147,216,0.25)' },
  off_duty:  { label:'Off duty',   color:'rgba(150,150,150,0.85)', bg:'rgba(150,150,150,0.07)', border:'rgba(150,150,150,0.20)' },
}
const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

function docDot(expiry?: string) {
  if (!expiry) return 'rgba(150,150,150,0.40)'
  const d = Math.floor((new Date(expiry).getTime()-Date.now())/86400000)
  return d < 0 ? 'rgba(239,154,154,0.95)' : d<=30 ? 'rgba(239,154,154,0.95)' : d<=60 ? 'rgba(255,183,77,0.95)' : 'rgba(129,199,132,0.95)'
}
function docLabel(expiry?: string) {
  if (!expiry) return '—'
  const d = Math.floor((new Date(expiry).getTime()-Date.now())/86400000)
  if (d<0) return `Expired ${Math.abs(d)}d ago`
  if (d===0) return 'Expires today'
  if (d<=30) return `${d}d left`
  return new Date(expiry).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
}

export default function Drivers() {
  const navigate = useNavigate()
  const [drivers, setDrivers]   = useState<Driver[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [showAdd, setShowAdd]   = useState(false)
  const [selected, setSelected] = useState<Driver|null>(null)
  const [photo, setPhoto]       = useState('')
  const [editingPhoto, setEditingPhoto] = useState(false)
  const camRef = useRef<HTMLInputElement>(null)
  const uplRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:'', phone:'', email:'', branch:'eldoret',
    national_id:'', licence_number:'', licence_class:'BCE',
    licence_expiry:'', psv_badge_number:'', psv_expiry:'',
    good_conduct_expiry:'', medical_expiry:'',
    emergency_contact:'', emergency_phone:'',
    date_joined: new Date().toISOString().split('T')[0], notes:''
  })

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('drivers').select('*').order('name')
    if (data) setDrivers(data as Driver[])
    setLoading(false)
  }

  async function save() {
    if (!form.name || !form.phone) { alert('Name and phone required'); return }
    setSaving(true)
    const { error } = await supabase.from('drivers').insert([{
      ...form, photo_url: photo||null, status:'available',
      email:form.email||null, national_id:form.national_id||null,
      licence_number:form.licence_number||null, licence_expiry:form.licence_expiry||null,
      psv_badge_number:form.psv_badge_number||null, psv_expiry:form.psv_expiry||null,
      good_conduct_expiry:form.good_conduct_expiry||null, medical_expiry:form.medical_expiry||null,
      emergency_contact:form.emergency_contact||null, emergency_phone:form.emergency_phone||null,
      date_joined:form.date_joined||null, notes:form.notes||null,
    }])
    setSaving(false)
    if (!error) { setShowAdd(false); setPhoto(''); load() } else alert(error.message)
  }

  async function updateStatus(id:string, status:string) {
    await supabase.from('drivers').update({status}).eq('id',id)
    setSelected(s => s ? {...s, status:status as any} : null)
    load()
  }

  async function deleteDriver(id:string) {
    if (!confirm('Delete this driver permanently?')) return
    await supabase.from('drivers').delete().eq('id',id)
    setSelected(null); load()
  }

  const printDriver = (d: Driver) => {
    const win = window.open('','_blank'); if (!win) return
    win.document.write(`<html><head><title>PSK — Driver Profile — ${d.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a;}.header{background:#FFD700;padding:20px;display:flex;align-items:center;gap:16px;}.stripe{height:5px;background:linear-gradient(90deg,#FF9500,#FFD700,#2D5F3F,#1B4D5C);}.banner{background:#2D5F3F;padding:10px 20px;color:#FFD700;font-size:18px;font-weight:700;}.body{padding:24px;background:#FFFDF7;}table{width:100%;border-collapse:collapse;}td{padding:10px;border-bottom:1px solid #E0D5C0;font-size:13px;}.label{color:#777;width:40%;}.footer{background:#2D5F3F;padding:10px;text-align:center;color:#FFD700;font-size:11px;}</style>
    </head><body>
    <div class="header"><img src="${window.location.origin}/branding/psk-logo.png" style="width:60px;height:60px;border-radius:50%;"><div><div style="font-size:20px;font-weight:800;">PSK Safaris & Car Rentals</div><div style="font-size:11px;">${d.branch==='eldoret'?'64 Plaza, Eldoret | Tel: +254 751 855 180':'174 Pamba Road, Kisumu | Tel: +254 741 186 538'}</div></div></div>
    <div class="stripe"></div><div class="banner">DRIVER PROFILE</div>
    <div class="body"><table>
    <tr><td class="label">Full Name</td><td><strong>${d.name}</strong></td></tr>
    <tr><td class="label">Phone</td><td>${d.phone}</td></tr>
    ${d.email?`<tr><td class="label">Email</td><td>${d.email}</td></tr>`:''}
    ${d.national_id?`<tr><td class="label">National ID</td><td>${d.national_id}</td></tr>`:''}
    <tr><td class="label">Branch</td><td>${d.branch==='eldoret'?'Eldoret HQ':'Kisumu Branch'}</td></tr>
    <tr><td class="label">Status</td><td>${STATUS[d.status]?.label||d.status}</td></tr>
    ${d.licence_number?`<tr><td class="label">Licence No.</td><td>${d.licence_number} (${d.licence_class})</td></tr>`:''}
    ${d.licence_expiry?`<tr><td class="label">Licence Expiry</td><td>${d.licence_expiry}</td></tr>`:''}
    ${d.psv_badge_number?`<tr><td class="label">PSV Badge</td><td>${d.psv_badge_number}</td></tr>`:''}
    ${d.psv_expiry?`<tr><td class="label">PSV Expiry</td><td>${d.psv_expiry}</td></tr>`:''}
    ${d.good_conduct_expiry?`<tr><td class="label">Good Conduct Expiry</td><td>${d.good_conduct_expiry}</td></tr>`:''}
    ${d.medical_expiry?`<tr><td class="label">Medical Expiry</td><td>${d.medical_expiry}</td></tr>`:''}
    ${d.emergency_contact?`<tr><td class="label">Emergency Contact</td><td>${d.emergency_contact} — ${d.emergency_phone||''}</td></tr>`:''}
    ${d.date_joined?`<tr><td class="label">Date Joined</td><td>${d.date_joined}</td></tr>`:''}
    ${d.notes?`<tr><td class="label">Notes</td><td>${d.notes}</td></tr>`:''}
    </table></div>
    <div class="footer">PSK Safaris & Car Rentals | Easy car rentals · Self drive · Airport transfers · Safaris</div>
    </body></html>`)
    win.document.close(); win.print()
  }

  const filtered = drivers.filter(d => {
    const ms = filterStatus==='all' || d.status===filterStatus
    const mq = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search)
    return ms && mq
  })

  const fld = (label:string, children:React.ReactNode, req=false) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>
        {label}{req&&<span style={{ color:'rgba(239,154,154,0.80)', marginLeft:'3px' }}>*</span>}
      </div>
      {children}
    </div>
  )
  const inp = (key:string, type='text', placeholder='') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]}
      onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>navigate('/partners')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Partners</div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          <button onClick={()=>setFilter('all')} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:filterStatus==='all'?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${filterStatus==='all'?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:filterStatus==='all'?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>All ({drivers.length})</button>
          {Object.entries(STATUS).map(([k,v])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:filterStatus===k?v.bg:'rgba(255,255,255,0.04)', border:`1px solid ${filterStatus===k?v.border:'rgba(255,255,255,0.09)'}`, color:filterStatus===k?v.color:'rgba(255,255,255,0.38)' }}>{v.label} ({drivers.filter(d=>d.status===k).length})</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'190px' }} />
          <button onClick={()=>setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add driver</button>
        </div>
      </div>

      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
        : filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>🧑‍✈️</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>{drivers.length===0?'No drivers registered yet':'No drivers match your filter'}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Add your first driver to get started</div>
            <button onClick={()=>setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first driver</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Driver','Status','Branch','Phone','Licence','PSV','Good Conduct','Medical','Action'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 10px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const sc = STATUS[d.status]||STATUS.available
                return (
                  <tr key={d.id} onClick={()=>setSelected(d)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'11px 10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        {d.photo_url
                          ? <img src={d.photo_url} alt="" style={{ width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover', border:'1px solid rgba(255,255,255,0.12)', flexShrink:0 }} />
                          : <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>🧑‍✈️</div>
                        }
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.90)' }}>{d.name}</div>
                          {d.date_joined && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)', marginTop:'1px' }}>Joined {new Date(d.date_joined).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 10px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 8px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}`, whiteSpace:'nowrap' }}>{sc.label}</span></td>
                    <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{d.branch==='eldoret'?'Eldoret':'Kisumu'}</div></td>
                    <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{d.phone}</div></td>
                    {[d.licence_expiry, d.psv_expiry, d.good_conduct_expiry, d.medical_expiry].map((exp,i)=>(
                      <td key={i} style={{ padding:'11px 10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:docDot(exp), flexShrink:0 }} />
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.50)' }}>{docLabel(exp)}</div>
                        </div>
                      </td>
                    ))}
                    <td style={{ padding:'11px 10px' }}>
                      <div style={{ display:'flex', gap:'5px' }}>
                        <button onClick={e=>{e.stopPropagation();setSelected(d)}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                        <button onClick={e=>{e.stopPropagation();window.open(`https://wa.me/${d.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi '+d.name+', this is PSK Safaris.')}`,'_blank')}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.22)', color:'rgba(37,211,102,0.80)', cursor:'pointer', fontFamily:'inherit' }}>📱</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* DRIVER DETAIL SLIDE-OVER */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={()=>setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'440px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <button onClick={()=>setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>

            {/* Photo + name */}
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
              {selected.photo_url
                ? <img src={selected.photo_url} alt="" style={{ width:'70px', height:'70px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,215,0,0.30)' }} />
                : <div style={{ width:'70px', height:'70px', borderRadius:'50%', background:'rgba(255,215,0,0.10)', border:'2px solid rgba(255,215,0,0.20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>🧑‍✈️</div>
              }
              <div>
                <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.95)' }}>{selected.name}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginTop:'2px' }}>{selected.branch==='eldoret'?'Eldoret HQ':'Kisumu Branch'}</div>
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom:'18px' }}>
              <div style={{ ...gl.label, marginBottom:'8px' }}>Status</div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {Object.entries(STATUS).map(([k,v])=>(
                  <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{ padding:'5px 12px', borderRadius:'8px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:selected.status===k?v.bg:'rgba(255,255,255,0.04)', border:`1px solid ${selected.status===k?v.border:'rgba(255,255,255,0.09)'}`, color:selected.status===k?v.color:'rgba(255,255,255,0.35)' }}>{v.label}</button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom:'18px' }}>
              <button onClick={()=>window.open(`https://wa.me/${selected.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi '+selected.name+', this is PSK Safaris.')}`,'_blank')} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', color:'rgba(37,211,102,0.90)' }}>📱 WhatsApp</button>
              {selected.email && <button onClick={()=>window.open(`mailto:${selected.email}`,'_blank')} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)' }}>✉️ Email</button>}
              <button onClick={()=>window.open(`tel:${selected.phone}`)} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(129,199,132,0.10)', border:'1px solid rgba(129,199,132,0.25)', color:'rgba(129,199,132,0.88)' }}>📞 Call</button>
              <button onClick={()=>printDriver(selected)} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>🖨 Print</button>
              <button onClick={()=>startEditDriver(selected)} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.30)', color:'rgba(255,215,0,0.90)' }}>✏️ Edit</button>
              <button onClick={()=>navigate('/bookings',{state:{openAdd:true,driverId:selected.id}})} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'linear-gradient(135deg,rgba(255,215,0,0.14),rgba(255,149,0,0.08))', border:'1px solid rgba(255,215,0,0.28)', color:'rgba(255,215,0,0.90)' }}>+ Assign booking</button>
            </div>

            {/* Inline Edit Form */}
            {editingD && (
              <div style={{ background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.20)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'12px' }}>Edit Driver Details</div>
                {[['Name','name'],['Phone','phone'],['Email','email'],['National ID','national_id'],['Licence No.','licence_number'],['Licence Class','licence_class'],['Licence Expiry','licence_expiry'],['PSV Badge No.','psv_badge_number'],['PSV Expiry','psv_expiry'],['Good Conduct Expiry','good_conduct_expiry'],['Medical Expiry','medical_expiry'],['Emergency Contact','emergency_contact'],['Emergency Phone','emergency_phone']].map(([label,key])=>(
                  <div key={key} style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.40)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
                    <input value={editDForm[key]} onChange={e=>setEditDForm((f:any)=>({...f,[key]:e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', fontSize:'13px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.90)', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
                  </div>
                ))}
                <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
                  <button onClick={saveEditDriver} disabled={editDSaving} style={{ flex:1, padding:'9px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>{editDSaving?'Saving...':'Save Changes'}</button>
                  <button onClick={()=>setEditingD(false)} style={{ padding:'9px 16px', borderRadius:'9px', fontSize:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.40)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              {[
                { label:'Phone',             value:selected.phone },
                { label:'Email',             value:selected.email||'—' },
                { label:'National ID',       value:selected.national_id||'—' },
                { label:'Licence no.',       value:selected.licence_number ? `${selected.licence_number} (${selected.licence_class})` : '—' },
                { label:'PSV badge',         value:selected.psv_badge_number||'—' },
                { label:'Emergency contact', value:selected.emergency_contact ? `${selected.emergency_contact} — ${selected.emergency_phone||''}` : '—' },
                { label:'Date joined',       value:selected.date_joined||'—' },
              ].map((r,i,arr)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none', gap:'12px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)', textAlign:'right' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Document compliance */}
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              <div style={{ ...gl.label, marginBottom:'12px' }}>Document Compliance</div>
              {[
                { label:'Driving Licence', expiry:selected.licence_expiry },
                { label:'PSV Badge',       expiry:selected.psv_expiry },
                { label:'Good Conduct',    expiry:selected.good_conduct_expiry },
                { label:'Medical',         expiry:selected.medical_expiry },
              ].map((d,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<3?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{d.label}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:docDot(d.expiry) }} />
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.65)' }}>{docLabel(d.expiry)}</span>
                  </div>
                </div>
              ))}
            </div>

            {selected.notes && <div style={{ ...gl.panel, padding:'14px', marginBottom:'16px' }}><div style={{ ...gl.label, marginBottom:'8px' }}>Notes</div><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6' }}>{selected.notes}</div></div>}
            <button onClick={()=>deleteDriver(selected.id)} style={{ width:'100%', padding:'10px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.70)' }}>🗑 Delete driver</button>
          </div>
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'580px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'20px 26px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>🧑‍✈️ Add Driver</div>
              <button onClick={()=>{setShowAdd(false);setPhoto('')}} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'22px 26px' }}>
              {/* Photo */}
              <div style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'72px', height:'72px', borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,0.06)', border:'2px solid rgba(255,215,0,0.20)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>
                  {photo ? <img src={photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧑‍✈️'}
                </div>
                <div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', marginBottom:'8px' }}>Driver photo (optional)</div>
                  <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={e=>{if(e.target.files?.[0]){const r=new FileReader();r.onload=ev=>{setPhoto(ev.target?.result as string);setEditingPhoto(true)};r.readAsDataURL(e.target.files![0])}}} style={{ display:'none' }} />
                  <input type="file" accept="image/*" ref={uplRef} onChange={e=>{if(e.target.files?.[0]){const r=new FileReader();r.onload=ev=>{setPhoto(ev.target?.result as string);setEditingPhoto(true)};r.readAsDataURL(e.target.files![0])}}} style={{ display:'none' }} />
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button type="button" onClick={()=>camRef.current?.click()} style={{ padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>📷 Camera</button>
                    <button type="button" onClick={()=>uplRef.current?.click()} style={{ padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' }}>📁 Upload</button>
                    {photo && <button type="button" onClick={()=>setEditingPhoto(true)} style={{ padding:'6px 10px', borderRadius:'8px', fontSize:'11px', cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.20)', color:'rgba(255,215,0,0.75)' }}>✏️ Edit</button>}
                    {photo && <button type="button" onClick={()=>setPhoto('')} style={{ padding:'6px 10px', borderRadius:'8px', fontSize:'11px', cursor:'pointer', fontFamily:'inherit', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.70)' }}>✕</button>}
                  </div>
                </div>
              </div>

              <div style={{ ...gl.label, marginBottom:'12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Basic Info</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Full name *', inp('name','text','e.g. James Kipchoge'), true)}
                {fld('Branch', <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option></select>)}
                {fld('Phone *', inp('phone','tel','+254...'), true)}
                {fld('Email (optional)', inp('email','email',''))}
                {fld('National ID', inp('national_id','text','e.g. 12345678'))}
                {fld('Date joined', inp('date_joined','date'))}
              </div>

              <div style={{ ...gl.label, margin:'14px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Driving Documents</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Licence number', inp('licence_number','text','e.g. DL123456'))}
                {fld('Licence class', <select value={form.licence_class} onChange={e=>setForm(f=>({...f,licence_class:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option>BCE</option><option>B</option><option>C</option><option>D</option><option>E</option></select>)}
                {fld('Licence expiry', inp('licence_expiry','date'))}
                {fld('PSV badge number', inp('psv_badge_number','text','e.g. PSV12345'))}
                {fld('PSV expiry', inp('psv_expiry','date'))}
                {fld('Good conduct expiry', inp('good_conduct_expiry','date'))}
                {fld('Medical certificate expiry', inp('medical_expiry','date'))}
              </div>

              <div style={{ ...gl.label, margin:'14px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Emergency Contact</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Emergency contact name', inp('emergency_contact','text','e.g. Mary Kipchoge'))}
                {fld('Emergency phone', inp('emergency_phone','tel','+254...'))}
              </div>

              {fld('Notes', <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes about this driver..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'60px', resize:'none' }} />)}

              <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                <button onClick={()=>{setShowAdd(false);setPhoto('')}} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Driver'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPhoto && photo && (
        <DocumentEditor
          fileUrl={photo}
          fileName="driver-photo"
          onClose={() => setEditingPhoto(false)}
          onSave={(edited) => { setPhoto(edited); setEditingPhoto(false) }}
        />
      )}
    </div>
  )
}
