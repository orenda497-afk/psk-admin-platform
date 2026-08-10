import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type ClientType = 'individual' | 'corporate' | 'agency' | 'government'

interface Client {
  id: string
  type: ClientType
  name: string
  phone: string
  secondary_phone?: string
  email?: string
  id_type?: string
  id_number?: string
  id_photo_url?: string
  address?: string
  city?: string
  kra_pin?: string
  contact_person?: string
  contact_title?: string
  credit_limit?: number
  payment_terms?: number
  branch: 'eldoret' | 'kisumu'
  notes?: string
  created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const TYPE_COLORS: Record<ClientType,{color:string;bg:string;border:string;label:string}> = {
  individual: { color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)', label:'Individual' },
  corporate:  { color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)', label:'Corporate' },
  agency:     { color:'rgba(206,147,216,0.95)', bg:'rgba(206,147,216,0.08)', border:'rgba(206,147,216,0.25)', label:'Agency' },
  government: { color:'rgba(255,183,77,0.95)',  bg:'rgba(255,183,77,0.08)',  border:'rgba(255,183,77,0.25)',  label:'Government' },
}

const TYPE_FIELDS: Record<ClientType, { showIdFields:boolean; showKRA:boolean; showContact:boolean; showCredit:boolean }> = {
  individual: { showIdFields:true,  showKRA:false, showContact:false, showCredit:false },
  corporate:  { showIdFields:false, showKRA:true,  showContact:true,  showCredit:true  },
  agency:     { showIdFields:false, showKRA:true,  showContact:true,  showCredit:true  },
  government: { showIdFields:false, showKRA:true,  showContact:true,  showCredit:false },
}

export default function Clients({ defaultTab = 'all' }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const [clients, setClients]     = useState<Client[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [tab, setTab]             = useState(defaultTab)
  const [search, setSearch]       = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [selected, setSelected]   = useState<Client | null>(null)
  const [clientType, setClientType] = useState<ClientType>('individual')
  const [idPhoto, setIdPhoto]     = useState<string>('')
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:'', phone:'', secondary_phone:'', email:'',
    id_type:'National ID', id_number:'',
    address:'', city:'',
    kra_pin:'', contact_person:'', contact_title:'',
    credit_limit:0, payment_terms:30,
    branch:'eldoret', notes:''
  })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('name', { ascending: true })
    if (data) setClients(data as Client[])
    setLoading(false)
  }

  async function saveClient() {
    if (!form.name || !form.phone) { alert('Name and phone are required'); return }
    setSaving(true)
    const fields = TYPE_FIELDS[clientType]
    const { error } = await supabase.from('clients').insert([{
      type: clientType,
      name: form.name.trim(),
      phone: form.phone.trim(),
      secondary_phone: form.secondary_phone || null,
      email: form.email || null,
      id_type:   fields.showIdFields ? form.id_type : null,
      id_number: fields.showIdFields ? form.id_number || null : null,
      id_photo_url: idPhoto || null,
      address: form.address || null,
      city: form.city || null,
      kra_pin:       fields.showKRA     ? form.kra_pin || null : null,
      contact_person:fields.showContact ? form.contact_person || null : null,
      contact_title: fields.showContact ? form.contact_title || null : null,
      credit_limit:  fields.showCredit  ? form.credit_limit || 0 : 0,
      payment_terms: fields.showCredit  ? form.payment_terms || 0 : 0,
      branch: form.branch,
      notes: form.notes || null,
    }])
    setSaving(false)
    if (!error) {
      setShowAdd(false)
      setIdPhoto('')
      setForm({ name:'', phone:'', secondary_phone:'', email:'', id_type:'National ID', id_number:'', address:'', city:'', kra_pin:'', contact_person:'', contact_title:'', credit_limit:0, payment_terms:30, branch:'eldoret', notes:'' })
      load()
    } else alert('Error: ' + error.message)
  }

  async function deleteClient(id: string) {
    if (!confirm('Delete this client permanently?')) return
    await supabase.from('clients').delete().eq('id', id)
    setSelected(null)
    load()
  }

  function handlePhoto(file: File) {
    const reader = new FileReader()
    reader.onload = e => setIdPhoto(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const filtered = clients.filter(c => {
    const mt = tab === 'all' || c.type === tab
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || (c.email||'').toLowerCase().includes(search.toLowerCase())
    return mt && ms
  })

  const fld = (label:string, children:React.ReactNode, req=false) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>
        {label}{req && <span style={{ color:'rgba(239,154,154,0.80)', marginLeft:'3px' }}>*</span>}
      </div>
      {children}
    </div>
  )
  const inp = (key:string, type='text', placeholder='') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]}
      onChange={e => setForm(f=>({...f,[key]: type==='number'?Number(e.target.value):e.target.value}))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )

  const fields = TYPE_FIELDS[clientType]

  // Client profile print
  const printClient = (c: Client) => {
    const win = window.open('','_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>PSK — Client Profile — ${c.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a;} .header{background:#FFD700;padding:20px;display:flex;align-items:center;gap:16px;} .stripe{height:5px;background:linear-gradient(90deg,#FF9500,#FFD700,#2D5F3F,#1B4D5C);} .banner{background:#2D5F3F;padding:10px 20px;color:#FFD700;font-size:18px;font-weight:700;} .body{padding:24px;background:#FFFDF7;} table{width:100%;border-collapse:collapse;} td{padding:10px;border-bottom:1px solid #E0D5C0;font-size:13px;} .label{color:#777;width:40%;} .footer{background:#2D5F3F;padding:10px;text-align:center;color:#FFD700;font-size:11px;}</style>
      </head><body>
      <div class="header"><img src="${window.location.origin}/branding/psk-logo.png" style="width:60px;height:60px;border-radius:50%;"><div><div style="font-size:20px;font-weight:800;">PSK Safaris & Car Rentals</div><div style="font-size:11px;">${c.branch==='eldoret'?'64 Plaza, Eldoret | Tel: +254 751 855 180':'174 Pamba Road, Kisumu | Tel: +254 741 186 538'}</div></div></div>
      <div class="stripe"></div>
      <div class="banner">CLIENT PROFILE — ${c.type.toUpperCase()}</div>
      <div class="body">
        <table>
          <tr><td class="label">Full Name</td><td><strong>${c.name}</strong></td></tr>
          <tr><td class="label">Phone</td><td>${c.phone}</td></tr>
          ${c.secondary_phone?`<tr><td class="label">Secondary Phone</td><td>${c.secondary_phone}</td></tr>`:''}
          ${c.email?`<tr><td class="label">Email</td><td>${c.email}</td></tr>`:''}
          ${c.id_number?`<tr><td class="label">${c.id_type||'ID'}</td><td>${c.id_number}</td></tr>`:''}
          ${c.kra_pin?`<tr><td class="label">KRA PIN</td><td>${c.kra_pin}</td></tr>`:''}
          ${c.contact_person?`<tr><td class="label">Contact Person</td><td>${c.contact_person}${c.contact_title?' ('+c.contact_title+')':''}</td></tr>`:''}
          ${c.address?`<tr><td class="label">Address</td><td>${c.address}${c.city?', '+c.city:''}</td></tr>`:''}
          <tr><td class="label">Branch</td><td>${c.branch==='eldoret'?'Eldoret HQ':'Kisumu Branch'}</td></tr>
          ${c.credit_limit?`<tr><td class="label">Credit Limit</td><td>KES ${c.credit_limit.toLocaleString()}</td></tr>`:''}
          ${c.notes?`<tr><td class="label">Notes</td><td>${c.notes}</td></tr>`:''}
        </table>
      </div>
      <div class="footer">PSK Safaris & Car Rentals | Easy car rentals · Self drive · Airport transfers · Safaris</div>
      </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>

      {/* Tabs + toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {(['all','individual','corporate','agency','government'] as const).map(t => {
            const count = t === 'all' ? clients.length : clients.filter(c=>c.type===t).length
            const tc = t !== 'all' ? TYPE_COLORS[t] : null
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:'6px 14px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                background: tab===t ? (tc ? tc.bg : 'rgba(255,215,0,0.12)') : 'rgba(255,255,255,0.05)',
                border:`1px solid ${tab===t ? (tc ? tc.border : 'rgba(255,215,0,0.35)') : 'rgba(255,255,255,0.10)'}`,
                color: tab===t ? (tc ? tc.color : 'rgba(255,215,0,0.90)') : 'rgba(255,255,255,0.40)',
              }}>
                {t === 'all' ? `All (${count})` : `${TYPE_COLORS[t].label} (${count})`}
              </button>
            )
          })}
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, email..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'210px' }} />
          <button onClick={() => setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ New client</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading clients...</div>
        : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>👥</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>{clients.length === 0 ? 'No clients yet' : 'No clients match your search'}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Add your first client to get started</div>
            <button onClick={()=>setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first client</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Name','Type','Phone','Email','City','Branch','Action'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const tc = TYPE_COLORS[c.type]
                return (
                  <tr key={c.id} onClick={()=>setSelected(c)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.92)' }}>{c.name}</div>
                      {c.contact_person && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>c/o {c.contact_person}</div>}
                    </td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:tc.color, background:tc.bg, border:`1px solid ${tc.border}` }}>{tc.label}</span></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{c.phone}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>{c.email || '—'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{c.city || '—'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{c.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div></td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:'5px' }}>
                        <button onClick={e=>{e.stopPropagation();setSelected(c)}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                        <button onClick={e=>{e.stopPropagation(); const msg=`Hi ${c.name}, this is PSK Safaris. How can we assist you today?`; window.open(`https://wa.me/${c.phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`,'_blank')}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.22)', color:'rgba(37,211,102,0.80)', cursor:'pointer', fontFamily:'inherit' }}>📱</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CLIENT PROFILE SLIDE-OVER */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={()=>setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'440px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1 }}>
            <div style={{ padding:'24px' }}>
              <button onClick={()=>setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>

              <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:TYPE_COLORS[selected.type].color, background:TYPE_COLORS[selected.type].bg, border:`1px solid ${TYPE_COLORS[selected.type].border}` }}>{TYPE_COLORS[selected.type].label}</span>
              <div style={{ fontSize:'22px', fontWeight:800, color:'rgba(255,255,255,0.95)', margin:'12px 0 2px' }}>{selected.name}</div>
              {selected.contact_person && <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginBottom:'2px' }}>c/o {selected.contact_person}{selected.contact_title ? ` — ${selected.contact_title}` : ''}</div>}
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>{selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'}</div>

              {/* Quick action buttons */}
              <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom:'20px' }}>
                <button onClick={()=>{ navigate('/bookings', { state:{ openAdd:true, clientId:selected.id, clientName:selected.name } }) }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)' }}>+ New booking</button>
                <button onClick={()=>{ navigate('/documents', { state:{ openAdd:true, clientName:selected.name, clientPhone:selected.phone } }) }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)' }}>📄 New quote</button>
                <button onClick={()=>{ navigate('/documents', { state:{ openAdd:true, docType:'invoice', clientName:selected.name, clientPhone:selected.phone } }) }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.60)' }}>🧾 Invoice</button>
              </div>

              {/* Share actions */}
              <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom:'20px' }}>
                <button onClick={()=>{ const msg=`Hi ${selected.name}, this is PSK Safaris & Car Rentals. How can we assist you today? Tel: +254 751 855 180`; window.open(`https://wa.me/${selected.phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`,'_blank') }} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', color:'rgba(37,211,102,0.90)' }}>📱 WhatsApp</button>
                {selected.email && <button onClick={()=>{ window.open(`mailto:${selected.email}?subject=PSK Safaris — Hello ${selected.name}`,'_blank') }} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)' }}>✉️ Email</button>}
                <button onClick={()=>printClient(selected)} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>🖨 Print profile</button>
                <button onClick={()=>{ const tel=`tel:${selected.phone}`; window.open(tel) }} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(129,199,132,0.10)', border:'1px solid rgba(129,199,132,0.25)', color:'rgba(129,199,132,0.88)' }}>📞 Call</button>
              </div>

              {/* Details */}
              <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
                {[
                  { label:'Phone',          value: selected.phone },
                  { label:'Secondary phone',value: selected.secondary_phone || '—' },
                  { label:'Email',          value: selected.email || '—' },
                  { label:'ID type',        value: selected.id_type || '—', show: !!selected.id_number },
                  { label:'ID number',      value: selected.id_number || '—', show: !!selected.id_number },
                  { label:'KRA PIN',        value: selected.kra_pin || '—', show: !!selected.kra_pin },
                  { label:'Contact person', value: selected.contact_person ? `${selected.contact_person}${selected.contact_title?' ('+selected.contact_title+')':''}` : '—' },
                  { label:'Address',        value: selected.address ? `${selected.address}${selected.city?', '+selected.city:''}` : '—' },
                  { label:'Credit limit',   value: selected.credit_limit && selected.credit_limit > 0 ? `KES ${selected.credit_limit.toLocaleString()}` : '—', show: !!selected.credit_limit },
                  { label:'Payment terms',  value: selected.payment_terms && selected.payment_terms > 0 ? `${selected.payment_terms} days` : '—', show: !!selected.payment_terms },
                ].filter(r => r.show !== false).map((row,i,arr) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none', gap:'16px' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{row.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)', textAlign:'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* ID photo if exists */}
              {selected.id_photo_url && (
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ ...gl.label, marginBottom:'8px' }}>ID / Document Photo</div>
                  <img src={selected.id_photo_url} alt="ID" style={{ width:'100%', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.10)' }} />
                </div>
              )}

              {selected.notes && (
                <div style={{ ...gl.panel, padding:'14px', marginBottom:'16px' }}>
                  <div style={{ ...gl.label, marginBottom:'8px' }}>Notes</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6' }}>{selected.notes}</div>
                </div>
              )}

              {/* Delete */}
              <button onClick={()=>deleteClient(selected.id)} style={{ width:'100%', padding:'10px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.70)', marginTop:'8px' }}>🗑 Delete client</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CLIENT MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'560px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'20px 26px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>New Client</div>
              <button onClick={()=>setShowAdd(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>

            <div style={{ padding:'22px 26px' }}>
              {/* Client type */}
              <div style={{ marginBottom:'20px' }}>
                <div style={{ ...gl.label, marginBottom:'10px' }}>Client type</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
                  {(['individual','corporate','agency','government'] as ClientType[]).map(t => (
                    <button key={t} onClick={()=>setClientType(t)} style={{ padding:'9px 6px', borderRadius:'9px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                      background: clientType===t ? TYPE_COLORS[t].bg : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${clientType===t ? TYPE_COLORS[t].border : 'rgba(255,255,255,0.09)'}`,
                      color: clientType===t ? TYPE_COLORS[t].color : 'rgba(255,255,255,0.35)',
                    }}>{TYPE_COLORS[t].label}</button>
                  ))}
                </div>
              </div>

              <div style={{ ...gl.label, marginBottom:'12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Basic Info</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Full name *', inp('name','text','e.g. Sarah Mutai'), true)}
                {fld('Branch', <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option></select>)}
                {fld('Phone number *', inp('phone','tel','+254...'), true)}
                {fld('Secondary phone', inp('secondary_phone','tel','+254...'))}
                {fld('Email (optional)', inp('email','email','client@email.com'))}
                {fld('City / Town', inp('city','text','e.g. Eldoret'))}
              </div>
              {fld('Address', inp('address','text','Physical address'))}

              {/* Individual fields */}
              {fields.showIdFields && <>
                <div style={{ ...gl.label, margin:'14px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>ID Document</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {fld('ID type', <select value={form.id_type} onChange={e=>setForm(f=>({...f,id_type:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option>National ID</option><option>Passport</option><option>Driving Licence</option></select>)}
                  {fld('ID number', inp('id_number','text','e.g. 12345678'))}
                </div>

                {/* Photo capture */}
                <div style={{ marginBottom:'14px' }}>
                  <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'8px', textTransform:'uppercase' }}>ID photo (optional)</div>
                  <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={e=>e.target.files?.[0]&&handlePhoto(e.target.files[0])} style={{ display:'none' }} />
                  <input type="file" accept="image/*,application/pdf" ref={uploadRef} onChange={e=>e.target.files?.[0]&&handlePhoto(e.target.files[0])} style={{ display:'none' }} />
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <button type="button" onClick={()=>cameraRef.current?.click()} style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>📷 Take photo</button>
                    <button type="button" onClick={()=>uploadRef.current?.click()} style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' }}>📁 Upload file</button>
                    {idPhoto && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.90)' }}>✓ Photo captured</span>}
                  </div>
                  {idPhoto && <img src={idPhoto} alt="ID preview" style={{ width:'100%', maxHeight:'140px', objectFit:'cover', borderRadius:'8px', marginTop:'10px', border:'1px solid rgba(255,255,255,0.10)' }} />}
                </div>
              </>}

              {/* Corporate/Agency/Government fields */}
              {fields.showKRA && <>
                <div style={{ ...gl.label, margin:'14px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Organisation Details</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {fld('KRA PIN', inp('kra_pin','text','e.g. P051234567A'))}
                  {fields.showContact && fld('Contact person', inp('contact_person','text','e.g. John Kamau'))}
                  {fields.showContact && fld('Title / Role', inp('contact_title','text','e.g. Procurement Manager'))}
                  {fields.showCredit && fld('Credit limit (KES)', inp('credit_limit','number','0'))}
                  {fields.showCredit && fld('Payment terms (days)', inp('payment_terms','number','30'))}
                </div>
              </>}

              <div style={{ marginBottom:'13px', marginTop:'8px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>Notes</div>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes about this client..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'60px', resize:'none' }} />
              </div>

              <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveClient} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Client'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
