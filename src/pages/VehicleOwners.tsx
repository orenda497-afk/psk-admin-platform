import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DocumentEditor from '../components/DocumentEditor'

interface Owner {
  id: string; name: string; phone: string; email?: string
  branch: 'eldoret'|'kisumu'; national_id?: string
  photo_url?: string; mpesa_number?: string
  bank_name?: string; bank_account?: string
  address?: string; city?: string
  date_joined?: string; notes?: string; created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

export default function VehicleOwners({ defaultTab = 'owners' }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(defaultTab)
  const [owners, setOwners]     = useState<Owner[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showAdd, setShowAdd]   = useState(false)
  const [selected, setSelected] = useState<Owner|null>(null)
  const [search, setSearch]     = useState('')
  const [photo, setPhoto]       = useState('')
  const [editingPhoto, setEditingPhoto] = useState(false)
  const camRef = useRef<HTMLInputElement>(null)
  const uplRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:'', phone:'', email:'', branch:'eldoret',
    national_id:'', mpesa_number:'', bank_name:'', bank_account:'',
    address:'', city:'', date_joined: new Date().toISOString().split('T')[0], notes:''
  })

  useEffect(() => { loadAll() }, [])
  function startEditOwner(o: any) {
    setEditOForm({ name:o.name||'', phone:o.phone||'', email:o.email||'', national_id:o.national_id||'', mpesa_number:o.mpesa_number||'', bank_name:o.bank_name||'', bank_account:o.bank_account||'', address:o.address||'', city:o.city||'', notes:o.notes||'' })
    setEditingO(true)
  }

  async function saveEditOwner() {
    if (!selected) return
    setEditOSaving(true)
    const { error } = await supabase.from('vehicle_owners').update(editOForm).eq('id', selected.id)
    setEditOSaving(false)
    if (!error) { setEditingO(false); loadAll() }
    else alert('Error: ' + error.message)
  }

  async function loadAll() {
    setLoading(true)
    const [o, v] = await Promise.all([
      supabase.from('vehicle_owners').select('*').order('name'),
      supabase.from('vehicles').select('id, reg, make, model, status, branch, owner_name').order('reg'),
    ])
    if (o.data) setOwners(o.data as Owner[])
    if (v.data) setVehicles(v.data)
    setLoading(false)
  }

  async function save() {
    if (!form.name || !form.phone) { alert('Name and phone required'); return }
    setSaving(true)
    const { error } = await supabase.from('vehicle_owners').insert([{
      ...form, photo_url:photo||null,
      email:form.email||null, national_id:form.national_id||null,
      mpesa_number:form.mpesa_number||null, bank_name:form.bank_name||null,
      bank_account:form.bank_account||null, address:form.address||null,
      city:form.city||null, date_joined:form.date_joined||null, notes:form.notes||null,
    }])
    setSaving(false)
    if (!error) { setShowAdd(false); setPhoto(''); loadAll() } else alert(error.message)
  }

  async function deleteOwner(id:string) {
    if (!confirm('Delete this vehicle owner permanently?')) return
    await supabase.from('vehicle_owners').delete().eq('id',id)
    setSelected(null); loadAll()
  }

  const ownerVehicles = (o: Owner) => vehicles.filter(v => v.owner_name === o.name)

  const printOwner = (o: Owner) => {
    const win = window.open('','_blank'); if (!win) return
    const oveh = ownerVehicles(o)
    win.document.write(`<html><head><title>PSK — Vehicle Owner — ${o.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a;}.header{background:#FFD700;padding:20px;display:flex;align-items:center;gap:16px;}.stripe{height:5px;background:linear-gradient(90deg,#FF9500,#FFD700,#2D5F3F,#1B4D5C);}.banner{background:#2D5F3F;padding:10px 20px;color:#FFD700;font-size:18px;font-weight:700;}.body{padding:24px;background:#FFFDF7;}table{width:100%;border-collapse:collapse;}td{padding:10px;border-bottom:1px solid #E0D5C0;font-size:13px;}.label{color:#777;width:40%;}.footer{background:#2D5F3F;padding:10px;text-align:center;color:#FFD700;font-size:11px;}.note{background:#FFF8E0;border:1px solid #FFD700;padding:12px;border-radius:6px;margin-top:20px;font-size:12px;}</style>
    </head><body>
    <div class="header"><img src="${window.location.origin}/branding/psk-logo.png" style="width:60px;height:60px;border-radius:50%;"><div><div style="font-size:20px;font-weight:800;">PSK Safaris & Car Rentals</div><div style="font-size:11px;">${o.branch==='eldoret'?'64 Plaza, Eldoret | Tel: +254 751 855 180':'174 Pamba Road, Kisumu | Tel: +254 741 186 538'}</div></div></div>
    <div class="stripe"></div><div class="banner">VEHICLE OWNER PARTNER PROFILE</div>
    <div class="body"><table>
    <tr><td class="label">Full Name</td><td><strong>${o.name}</strong></td></tr>
    <tr><td class="label">Phone</td><td>${o.phone}</td></tr>
    ${o.email?`<tr><td class="label">Email</td><td>${o.email}</td></tr>`:''}
    ${o.national_id?`<tr><td class="label">National ID</td><td>${o.national_id}</td></tr>`:''}
    ${o.address?`<tr><td class="label">Address</td><td>${o.address}${o.city?', '+o.city:''}</td></tr>`:''}
    <tr><td class="label">Branch</td><td>${o.branch==='eldoret'?'Eldoret HQ':'Kisumu Branch'}</td></tr>
    ${o.mpesa_number?`<tr><td class="label">M-Pesa Number</td><td>${o.mpesa_number}</td></tr>`:''}
    ${o.bank_name?`<tr><td class="label">Bank</td><td>${o.bank_name}${o.bank_account?' — A/C: '+o.bank_account:''}</td></tr>`:''}
    ${o.date_joined?`<tr><td class="label">Date Joined</td><td>${o.date_joined}</td></tr>`:''}
    </table>
    ${oveh.length>0?`<div class="note"><strong>Vehicles (${oveh.length}):</strong> ${oveh.map(v=>`${v.reg} — ${v.make} ${v.model}`).join(' | ')}</div>`:''}
    <div class="note" style="margin-top:12px;">Revenue split: <strong>70% to Vehicle Owner / 30% to PSK Safaris</strong> (net after direct expenses)</div>
    ${o.notes?`<div class="note" style="margin-top:12px;"><strong>Notes:</strong> ${o.notes}</div>`:''}
    </div>
    <div class="footer">PSK Safaris & Car Rentals — Vehicle Owner Partner Agreement | 70/30 Net Profit Split</div>
    </body></html>`)
    win.document.close(); win.print()
  }

  const filtered = owners.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search))

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
      <div style={{ display:'flex', gap:'6px', marginBottom:'18px' }}>
        {(['owners','payouts','portal'] as const).map(id=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:tab===id?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${tab===id?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:tab===id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{id.charAt(0).toUpperCase()+id.slice(1)}</button>
        ))}
      </div>
      {tab==='payouts' && <div style={{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', padding:'40px', textAlign:'center' }}><div style={{ fontSize:'36px', marginBottom:'14px' }}>💵</div><div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.70)', marginBottom:'8px' }}>Owner Payouts</div><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>Payout records live in the Finance section</div><button onClick={()=>navigate('/finance/payouts')} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Finance — Owner Payouts →</button></div>}
      {tab==='portal' && <div style={{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', padding:'40px', textAlign:'center' }}><div style={{ fontSize:'36px', marginBottom:'14px' }}>🔗</div><div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.70)', marginBottom:'8px' }}>Owner Self-Service Portal</div><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginBottom:'8px' }}>Coming soon — owners log in here to view their earnings and payout history</div><div style={{ fontSize:'11px', color:'rgba(255,215,0,0.45)', marginTop:'12px' }}>For now, share payout details via WhatsApp from Finance → Owner Payouts</div></div>}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div>
          <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Vehicle Owners <span style={{ fontSize:'12px', fontWeight:400, color:'rgba(255,255,255,0.35)', marginLeft:'8px' }}>{owners.length} partners</span></div>
          <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)', marginTop:'3px' }}>70/30 net profit split — owner receives 70%</div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'190px' }} />
          <button onClick={()=>setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add owner</button>
        </div>
      </div>

      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
        : filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>🚙</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>{owners.length===0?'No vehicle owners registered yet':'No owners match your search'}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Vehicle owners deposit their cars with PSK and earn 70% of net profit</div>
            <button onClick={()=>setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first owner</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Owner','Phone','M-Pesa','Branch','Vehicles','Bank','Action'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 10px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const ov = ownerVehicles(o)
                return (
                  <tr key={o.id} onClick={()=>setSelected(o)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'11px 10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        {o.photo_url
                          ? <img src={o.photo_url} alt="" style={{ width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover', border:'1px solid rgba(255,215,0,0.25)', flexShrink:0 }} />
                          : <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>🚙</div>
                        }
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.90)' }}>{o.name}</div>
                          {o.date_joined && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)', marginTop:'1px' }}>Joined {new Date(o.date_joined).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{o.phone}</div></td>
                    <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'12px', color:'rgba(255,215,0,0.65)' }}>{o.mpesa_number||'—'}</div></td>
                    <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{o.branch==='eldoret'?'Eldoret':'Kisumu'}</div></td>
                    <td style={{ padding:'11px 10px' }}>
                      {ov.length>0
                        ? <div style={{ fontSize:'11px', color:'rgba(129,199,132,0.85)' }}>{ov.map(v=>v.reg).join(', ')}</div>
                        : <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>No vehicles linked</div>
                      }
                    </td>
                    <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{o.bank_name||'—'}</div></td>
                    <td style={{ padding:'11px 10px' }}>
                      <div style={{ display:'flex', gap:'5px' }}>
                        <button onClick={e=>{e.stopPropagation();setSelected(o)}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                        <button onClick={e=>{e.stopPropagation();window.open(`https://wa.me/${o.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi '+o.name+', this is PSK Safaris.')}`,'_blank')}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.22)', color:'rgba(37,211,102,0.80)', cursor:'pointer', fontFamily:'inherit' }}>📱</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* OWNER DETAIL SLIDE-OVER */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={()=>setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'440px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              <button onClick={()=>{setSelected(null);setEditingO(false)}} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit' }}>✕ Close</button>
              <button onClick={()=>startEditOwner(selected)} style={{ background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.30)', borderRadius:'8px', padding:'6px 14px', color:'rgba(255,215,0,0.90)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', fontWeight:600 }}>✏️ Edit</button>
            </div>
            {editingO && (
              <div style={{ background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.20)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'12px' }}>Edit Owner Details</div>
                {[['Name','name'],['Phone','phone'],['Email','email'],['National ID','national_id'],['M-Pesa Number','mpesa_number'],['Bank Name','bank_name'],['Bank Account','bank_account'],['Address','address'],['City/Town','city']].map(([label,key])=>(
                  <div key={key} style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.40)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
                    <input value={editOForm[key]} onChange={e=>setEditOForm((f:any)=>({...f,[key]:e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', fontSize:'13px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.90)', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
                  </div>
                ))}
                <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
                  <button onClick={saveEditOwner} disabled={editOSaving} style={{ flex:1, padding:'9px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>{editOSaving?'Saving...':'Save Changes'}</button>
                  <button onClick={()=>setEditingO(false)} style={{ padding:'9px 16px', borderRadius:'9px', fontSize:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.40)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
              {selected.photo_url
                ? <img src={selected.photo_url} alt="" style={{ width:'70px', height:'70px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,215,0,0.30)' }} />
                : <div style={{ width:'70px', height:'70px', borderRadius:'50%', background:'rgba(255,215,0,0.10)', border:'2px solid rgba(255,215,0,0.20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>🚙</div>
              }
              <div>
                <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.95)' }}>{selected.name}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,215,0,0.60)', marginTop:'3px' }}>Vehicle Owner · 70/30 split</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>{selected.branch==='eldoret'?'Eldoret HQ':'Kisumu Branch'}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom:'18px' }}>
              <button onClick={()=>window.open(`https://wa.me/${selected.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi '+selected.name+', this is PSK Safaris.')}`,'_blank')} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', color:'rgba(37,211,102,0.90)' }}>📱 WhatsApp</button>
              {selected.email && <button onClick={()=>window.open(`mailto:${selected.email}`,'_blank')} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)' }}>✉️ Email</button>}
              <button onClick={()=>window.open(`tel:${selected.phone}`)} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(129,199,132,0.10)', border:'1px solid rgba(129,199,132,0.25)', color:'rgba(129,199,132,0.88)' }}>📞 Call</button>
              <button onClick={()=>printOwner(selected)} style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>🖨 Print</button>
            </div>

            {/* Details */}
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              {[
                { label:'Phone',        value:selected.phone },
                { label:'Email',        value:selected.email||'—' },
                { label:'National ID',  value:selected.national_id||'—' },
                { label:'M-Pesa',       value:selected.mpesa_number||'—', gold:true },
                { label:'Bank',         value:selected.bank_name ? `${selected.bank_name}${selected.bank_account?' — A/C: '+selected.bank_account:''}` : '—' },
                { label:'Address',      value:selected.address ? `${selected.address}${selected.city?', '+selected.city:''}` : '—' },
                { label:'Date joined',  value:selected.date_joined||'—' },
              ].map((r,i,arr)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none', gap:'12px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:(r as any).gold?'rgba(255,215,0,0.80)':'rgba(255,255,255,0.75)', textAlign:'right' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Linked vehicles */}
            <div style={{ marginBottom:'16px' }}>
              <div style={{ ...gl.label, marginBottom:'10px' }}>Vehicles Deposited with PSK</div>
              {ownerVehicles(selected).length===0
                ? <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:'9px' }}>No vehicles linked yet. Link vehicles by setting "Owner" in Registry Board.</div>
                : ownerVehicles(selected).map(v=>(
                  <div key={v.id} onClick={()=>navigate('/fleet/vehicles')} style={{ padding:'10px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'9px', marginBottom:'6px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.88)' }}>{v.reg}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.40)', marginTop:'1px' }}>{v.make} {v.model}</div>
                    </div>
                    <span style={{ fontSize:'10px', color:'rgba(255,215,0,0.60)', fontWeight:600 }}>{v.branch==='eldoret'?'Eldoret':'Kisumu'} →</span>
                  </div>
                ))
              }
            </div>

            {/* Payout info */}
            <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', borderRadius:'10px', padding:'14px 16px', marginBottom:'16px' }}>
              <div style={{ ...gl.label, marginBottom:'8px' }}>Payout Information</div>
              <div style={{ fontSize:'12px', color:'rgba(255,215,0,0.65)', lineHeight:'1.7' }}>
                Owner receives <strong style={{ color:'rgba(255,215,0,0.90)' }}>70%</strong> of net revenue after direct expenses.<br />
                Payouts tracked in <strong style={{ color:'rgba(255,215,0,0.90)' }}>Finance → Owner Payouts</strong>.
              </div>
            </div>

            {selected.notes && <div style={{ ...gl.panel, padding:'14px', marginBottom:'16px' }}><div style={{ ...gl.label, marginBottom:'8px' }}>Notes</div><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6' }}>{selected.notes}</div></div>}
            <button onClick={()=>deleteOwner(selected.id)} style={{ width:'100%', padding:'10px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.70)' }}>🗑 Delete owner</button>
          </div>
        </div>
      )}

      {/* ADD OWNER MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'560px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'20px 26px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>🚙 Add Vehicle Owner</div>
                <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)', marginTop:'2px' }}>70/30 net profit split</div>
              </div>
              <button onClick={()=>{setShowAdd(false);setPhoto('')}} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'22px 26px' }}>
              {/* Photo */}
              <div style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'72px', height:'72px', borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,0.06)', border:'2px solid rgba(255,215,0,0.20)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>
                  {photo ? <img src={photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🚙'}
                </div>
                <div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', marginBottom:'8px' }}>Owner photo (optional)</div>
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

              <div style={{ ...gl.label, marginBottom:'12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Personal Info</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Full name *', inp('name','text','e.g. David Kamau'), true)}
                {fld('Branch', <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option></select>)}
                {fld('Phone *', inp('phone','tel','+254...'), true)}
                {fld('Email (optional)', inp('email','email',''))}
                {fld('National ID', inp('national_id','text','e.g. 12345678'))}
                {fld('Date joined', inp('date_joined','date'))}
                {fld('Address', inp('address','text','Physical address'))}
                {fld('City / Town', inp('city','text','e.g. Eldoret'))}
              </div>

              <div style={{ ...gl.label, margin:'14px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Payout Details</div>
              <div style={{ background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'9px', padding:'10px 14px', marginBottom:'14px', fontSize:'11px', color:'rgba(255,215,0,0.60)' }}>
                Owner receives 70% of net revenue. Set M-Pesa or bank for payouts.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('M-Pesa number', inp('mpesa_number','tel','+254...'))}
                {fld('Bank name', inp('bank_name','text','e.g. Equity Bank'))}
                {fld('Bank account number', inp('bank_account','text','e.g. 0123456789'))}
              </div>

              {fld('Notes', <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes about this owner..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'60px', resize:'none' }} />)}

              <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                <button onClick={()=>{setShowAdd(false);setPhoto('')}} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Owner'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPhoto && photo && (
        <DocumentEditor
          fileUrl={photo}
          fileName="owner-photo"
          onClose={() => setEditingPhoto(false)}
          onSave={(edited) => { setPhoto(edited); setEditingPhoto(false) }}
        />
      )}
    </div>
  )
}
