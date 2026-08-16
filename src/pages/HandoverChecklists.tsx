import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Checklist {
  id: string
  checklist_ref: string
  booking_id?: string
  branch: 'eldoret' | 'kisumu'
  type: 'checkout' | 'checkin'
  vehicle_reg: string
  vehicle_make: string
  vehicle_model: string
  client_name: string
  client_phone: string
  odometer: number
  fuel_level: string
  condition_notes?: string
  damage_found: boolean
  damage_description?: string
  photo_urls?: string[]
  client_signed: boolean
  staff_name?: string
  created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const FUEL_LEVELS = ['Empty (E)', '1/4', '1/2', '3/4', 'Full (F)']
const PHOTO_SPOTS = ['Front', 'Rear', 'Left side', 'Right side', 'Interior', 'Dashboard', 'Boot']

export default function HandoverChecklists() {
  const navigate = useNavigate()
  const [checklists, setChecklists]   = useState<Checklist[]>([])
  const [bookings, setBookings]       = useState<any[]>([])
  const [clients, setClients]         = useState<any[]>([])
  const [vehicles, setVehicles]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [showAdd, setShowAdd]         = useState(false)
  const [addType, setAddType]         = useState<'checkout'|'checkin'>('checkout')
  const [selected, setSelected]       = useState<Checklist | null>(null)
  const [printChecklist, setPrintChecklist] = useState<Checklist | null>(null)
  const [photos, setPhotos]           = useState<Record<string, string>>({})
  const cameraRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [form, setForm] = useState({
    branch: 'eldoret',
    booking_id: '',
    type: 'checkout' as 'checkout'|'checkin',
    vehicle_reg: '', vehicle_make: '', vehicle_model: '',
    client_name: '', client_phone: '',
    odometer: 0,
    fuel_level: 'Full (F)',
    condition_notes: '',
    damage_found: false,
    damage_description: '',
    staff_name: '',
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [ch, b, c, v] = await Promise.all([
      supabase.from('handover_checklists').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('id, booking_ref, client_id, vehicle_id').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name, phone'),
      supabase.from('vehicles').select('id, reg, make, model'),
    ])
    if (ch.data) setChecklists(ch.data as Checklist[])
    if (b.data) setBookings(b.data)
    if (c.data) setClients(c.data)
    if (v.data) setVehicles(v.data)
    setLoading(false)
  }

  function onBookingSelect(bookingId: string) {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) { setForm(f => ({...f, booking_id: bookingId})); return }
    const client  = clients.find(c => c.id === booking.client_id)
    const vehicle = vehicles.find(v => v.id === booking.vehicle_id)
    setForm(f => ({
      ...f,
      booking_id: bookingId,
      client_name: client?.name || '',
      client_phone: client?.phone || '',
      vehicle_reg: vehicle?.reg || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
    }))
  }

  function handlePhotoCapture(spot: string, file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      setPhotos(p => ({ ...p, [spot]: e.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  async function saveChecklist() {
    if (!form.vehicle_reg || !form.client_name || !form.odometer) {
      alert('Please fill in: Vehicle registration, Client name, Odometer reading')
      return
    }
    setSaving(true)
    const ref = `PSK-HC-${form.type === 'checkout' ? 'OUT' : 'IN'}-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
    const photoArray = Object.entries(photos).map(([spot, url]) => `${spot}:${url}`)

    const { error } = await supabase.from('handover_checklists').insert([{
      checklist_ref: ref,
      booking_id: form.booking_id || null,
      branch: form.branch,
      type: form.type,
      vehicle_reg: form.vehicle_reg,
      vehicle_make: form.vehicle_make,
      vehicle_model: form.vehicle_model,
      client_name: form.client_name,
      client_phone: form.client_phone,
      odometer: form.odometer,
      fuel_level: form.fuel_level,
      condition_notes: form.condition_notes || null,
      damage_found: form.damage_found,
      damage_description: form.damage_found ? form.damage_description : null,
      photo_urls: photoArray,
      client_signed: false,
      staff_name: form.staff_name || null,
    }])
    setSaving(false)
    if (!error) {
      setShowAdd(false)
      setPhotos({})
      setForm({ branch:'eldoret', booking_id:'', type:'checkout', vehicle_reg:'', vehicle_make:'', vehicle_model:'', client_name:'', client_phone:'', odometer:0, fuel_level:'Full (F)', condition_notes:'', damage_found:false, damage_description:'', staff_name:'' })
      loadAll()
    } else {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        alert('Please create the handover_checklists table in Supabase first.')
      } else {
        alert('Error: ' + error.message)
      }
    }
  }

  const inp = (key: string, type='text', placeholder='') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]}
      onChange={e => setForm(f => ({...f, [key]: type==='number' ? Number(e.target.value) : e.target.value}))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )

  const fld = (label: string, children: React.ReactNode, required=false) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>
        {label}{required && <span style={{ color:'rgba(239,154,154,0.80)', marginLeft:'3px' }}>*</span>}
      </div>
      {children}
    </div>
  )

  // Fuel gauge visual
  const FuelGauge = ({ level }: { level: string }) => {
    const levels = ['Empty (E)', '1/4', '1/2', '3/4', 'Full (F)']
    const idx = levels.indexOf(level)
    return (
      <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
        {levels.map((l, i) => (
          <div key={l} onClick={() => setForm(f => ({...f, fuel_level: l}))} style={{
            width:'36px', height:'20px', borderRadius:'4px', cursor:'pointer',
            background: i <= idx ? (i >= 3 ? 'rgba(129,199,132,0.80)' : i >= 2 ? 'rgba(255,215,0,0.70)' : 'rgba(239,154,154,0.70)') : 'rgba(255,255,255,0.08)',
            border: form.fuel_level === l ? '2px solid rgba(255,215,0,0.80)' : '1px solid rgba(255,255,255,0.12)',
            transition:'all 0.15s',
          }} />
        ))}
        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', marginLeft:'8px' }}>{level}</span>
      </div>
    )
  }

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>window.history.back()} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>
          Handover Checklists <span style={{ fontSize:'12px', fontWeight:400, color:'rgba(255,255,255,0.35)', marginLeft:'8px' }}>{checklists.length} total</span>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => { setAddType('checkout'); setForm(f=>({...f,type:'checkout'})); setShowAdd(true) }} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(129,199,132,0.16),rgba(45,95,63,0.10))', border:'1.5px solid rgba(129,199,132,0.32)', color:'rgba(129,199,132,0.95)', cursor:'pointer', fontFamily:'inherit' }}>
            🚗 Check-out
          </button>
          <button onClick={() => { setAddType('checkin'); setForm(f=>({...f,type:'checkin'})); setShowAdd(true) }} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(100,181,246,0.16),rgba(27,77,92,0.10))', border:'1.5px solid rgba(100,181,246,0.32)', color:'rgba(100,181,246,0.95)', cursor:'pointer', fontFamily:'inherit' }}>
            🔄 Check-in
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading checklists...</div>
        ) : checklists.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>📷</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No handover checklists yet</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'8px' }}>Do a check-out before a vehicle leaves. Do a check-in when it returns.</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.20)', marginBottom:'24px' }}>Photos + signatures eliminate all damage disputes.</div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
              <button onClick={() => { setForm(f=>({...f,type:'checkout'})); setShowAdd(true) }} style={{ padding:'10px 20px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(129,199,132,0.16),rgba(45,95,63,0.10))', border:'1.5px solid rgba(129,199,132,0.32)', color:'rgba(129,199,132,0.95)', cursor:'pointer', fontFamily:'inherit' }}>🚗 First check-out</button>
              <button onClick={() => { setForm(f=>({...f,type:'checkin'})); setShowAdd(true) }} style={{ padding:'10px 20px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(100,181,246,0.16),rgba(27,77,92,0.10))', border:'1.5px solid rgba(100,181,246,0.32)', color:'rgba(100,181,246,0.95)', cursor:'pointer', fontFamily:'inherit' }}>🔄 First check-in</button>
            </div>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Ref','Type','Vehicle','Client','Odometer','Fuel','Damage','Photos','Signed','Date'].map(h => (
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checklists.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,215,0,0.75)' }}>{c.checklist_ref}</div></td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px',
                      color: c.type === 'checkout' ? 'rgba(129,199,132,0.95)' : 'rgba(100,181,246,0.95)',
                      background: c.type === 'checkout' ? 'rgba(129,199,132,0.09)' : 'rgba(100,181,246,0.08)',
                      border: `1px solid ${c.type === 'checkout' ? 'rgba(129,199,132,0.25)' : 'rgba(100,181,246,0.25)'}`,
                    }}>
                      {c.type === 'checkout' ? '🚗 Check-out' : '🔄 Check-in'}
                    </span>
                  </td>
                  <td style={{ padding:'12px' }}>
                    <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{c.vehicle_reg}</div>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{c.vehicle_make} {c.vehicle_model}</div>
                  </td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>{c.client_name}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)' }}>{c.odometer?.toLocaleString()} km</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.50)' }}>{c.fuel_level}</div></td>
                  <td style={{ padding:'12px' }}>
                    {c.damage_found
                      ? <span style={{ fontSize:'10px', fontWeight:600, color:'rgba(239,154,154,0.95)', background:'rgba(231,76,60,0.10)', border:'1px solid rgba(231,76,60,0.22)', padding:'2px 8px', borderRadius:'20px' }}>⚠️ Damage</span>
                      : <span style={{ fontSize:'10px', color:'rgba(129,199,132,0.80)' }}>✓ Clean</span>
                    }
                  </td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{c.photo_urls?.length || 0} photos</div></td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ fontSize:'10px', color: c.client_signed ? 'rgba(129,199,132,0.90)' : 'rgba(255,255,255,0.25)' }}>
                      {c.client_signed ? '✓ Signed' : '○ Pending'}
                    </span>
                  </td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{new Date(c.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAIL SLIDE-OVER */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'440px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>
            <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px',
              color: selected.type === 'checkout' ? 'rgba(129,199,132,0.95)' : 'rgba(100,181,246,0.95)',
              background: selected.type === 'checkout' ? 'rgba(129,199,132,0.09)' : 'rgba(100,181,246,0.08)',
              border: `1px solid ${selected.type === 'checkout' ? 'rgba(129,199,132,0.25)' : 'rgba(100,181,246,0.25)'}`,
            }}>{selected.type === 'checkout' ? '🚗 Check-out' : '🔄 Check-in'}</span>
            <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.95)', margin:'12px 0 4px' }}>{selected.checklist_ref}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.vehicle_reg} · {selected.client_name}</div>
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              {[
                { label:'Vehicle',     value:`${selected.vehicle_reg} ${selected.vehicle_make} ${selected.vehicle_model}` },
                { label:'Client',      value: selected.client_name },
                { label:'Phone',       value: selected.client_phone || '—' },
                { label:'Odometer',    value: `${selected.odometer?.toLocaleString()} km` },
                { label:'Fuel level',  value: selected.fuel_level },
                { label:'Damage',      value: selected.damage_found ? `⚠️ ${selected.damage_description}` : '✓ No damage' },
                { label:'Photos',      value: `${selected.photo_urls?.length || 0} photos taken` },
                { label:'Signed',      value: selected.client_signed ? '✓ Client signed' : '○ Not yet signed' },
                { label:'Staff',       value: selected.staff_name || '—' },
              ].map((r,i,arr) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color: r.label === 'Damage' && selected.damage_found ? 'rgba(239,154,154,0.90)' : r.label === 'Signed' && selected.client_signed ? 'rgba(129,199,132,0.90)' : 'rgba(255,255,255,0.75)' }}>{r.value}</span>
                </div>
              ))}
            </div>
            {/* Photos preview */}
            {selected.photo_urls && selected.photo_urls.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <div style={{ ...gl.label, marginBottom:'10px' }}>Photos</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                  {selected.photo_urls.map((p, i) => {
                    const [spot, dataUrl] = p.split(':data:')
                    return (
                      <div key={i} style={{ borderRadius:'8px', overflow:'hidden', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>
                        <img src={`data:${dataUrl}`} alt={spot} style={{ width:'100%', height:'70px', objectFit:'cover' }} />
                        <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.35)', padding:'4px 6px' }}>{spot}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {!selected.client_signed && (
                <button onClick={async()=>{ await supabase.from('handover_checklists').update({client_signed:true}).eq('id',selected.id); loadAll(); setSelected(null) }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'linear-gradient(135deg,rgba(129,199,132,0.16),rgba(45,95,63,0.09))', border:'1px solid rgba(129,199,132,0.30)', color:'rgba(129,199,132,0.95)' }}>✓ Mark signed</button>
              )}
              <button onClick={() => { setPrintChecklist(selected); setSelected(null) }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.25)', color:'rgba(255,215,0,0.85)' }}>🖨 Print / PDF</button>
              <button onClick={() => {
                const phone = (selected.client_phone || '').replace(/\D/g,'')
                const msg = `PSK Safaris — Vehicle ${selected.type === 'checkout' ? 'Check-out' : 'Check-in'} Report%0ARef: ${selected.checklist_ref}%0AVehicle: ${selected.vehicle_reg} ${selected.vehicle_make} ${selected.vehicle_model}%0AOdometer: ${selected.odometer?.toLocaleString()} km%0AFuel: ${selected.fuel_level}%0ADamage: ${selected.damage_found ? 'YES — ' + selected.damage_description : 'None'}%0ADate: ${new Date(selected.created_at).toLocaleDateString('en-GB')}%0A%0APSK Safaris %26 Car Rentals`
                window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
              }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', color:'rgba(37,211,102,0.90)' }}>📱 WhatsApp</button>
              <button onClick={() => {
                const subject = `PSK Safaris — ${selected.type === 'checkout' ? 'Check-out' : 'Check-in'} Report — ${selected.checklist_ref}`
                const body = `Dear ${selected.client_name},%0A%0APlease find your vehicle ${selected.type === 'checkout' ? 'check-out' : 'check-in'} report from PSK Safaris.%0A%0AReference: ${selected.checklist_ref}%0AVehicle: ${selected.vehicle_reg} — ${selected.vehicle_make} ${selected.vehicle_model}%0AOdometer: ${selected.odometer?.toLocaleString()} km%0AFuel level: ${selected.fuel_level}%0ADamage noted: ${selected.damage_found ? 'YES — ' + selected.damage_description : 'None'}%0ADate: ${new Date(selected.created_at).toLocaleDateString('en-GB')}%0A%0AThank you for choosing PSK Safaris.%0APSK Safaris Team%0A%2B254 751 855 180`
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank')
              }} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)' }}>✉️ Email</button>
              {selected.damage_found && (
                <button style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(231,76,60,0.10)', border:'1px solid rgba(231,76,60,0.22)', color:'rgba(239,154,154,0.88)' }}>⚠️ Damage claim</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW CHECKLIST MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'620px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'22px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>
                  {form.type === 'checkout' ? '🚗 Vehicle Check-out' : '🔄 Vehicle Check-in'}
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.30)', marginTop:'3px' }}>
                  {form.type === 'checkout' ? 'Before vehicle leaves — document condition' : 'When vehicle returns — compare and confirm'}
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <div style={{ display:'flex', borderRadius:'9px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)' }}>
                  {(['checkout','checkin'] as const).map(t => (
                    <button key={t} onClick={() => setForm(f=>({...f,type:t}))} style={{ padding:'7px 14px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: form.type===t ? (t==='checkout'?'rgba(129,199,132,0.15)':'rgba(100,181,246,0.15)') : 'transparent', color: form.type===t ? (t==='checkout'?'rgba(129,199,132,0.95)':'rgba(100,181,246,0.95)') : 'rgba(255,255,255,0.35)', border:'none' }}>
                      {t === 'checkout' ? 'Check-out' : 'Check-in'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowAdd(false)} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit', fontSize:'16px' }}>✕</button>
              </div>
            </div>

            <div style={{ padding:'24px 28px' }}>
              {/* Link to booking */}
              {fld('Link to booking',
                <select value={form.booking_id} onChange={e => onBookingSelect(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                  <option value="">Select booking (optional)...</option>
                  {bookings.map(b => <option key={b.id} value={b.id}>{b.booking_ref} — {clients.find(c=>c.id===b.client_id)?.name || 'Unknown'}</option>)}
                </select>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Branch', <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option></select>)}
                {fld('Staff name', inp('staff_name','text','Who is doing this checklist'))}
              </div>

              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Vehicle & Client</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
                {fld('Registration *', inp('vehicle_reg','text','e.g. KCA 123B'), true)}
                {fld('Make', inp('vehicle_make','text','e.g. Toyota'))}
                {fld('Model', inp('vehicle_model','text','e.g. Prado'))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Client name *', inp('client_name','text','Full name'), true)}
                {fld('Client phone', inp('client_phone','tel','+254...'))}
              </div>

              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Condition at {form.type === 'checkout' ? 'departure' : 'return'}</div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Odometer reading (km) *', inp('odometer','number','e.g. 45230'), true)}
                <div>
                  <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'8px', textTransform:'uppercase' }}>Fuel level</div>
                  <FuelGauge level={form.fuel_level} />
                </div>
              </div>

              {fld('General condition notes',
                <textarea value={form.condition_notes} onChange={e=>setForm(f=>({...f,condition_notes:e.target.value}))} placeholder="Overall condition, any pre-existing marks, notes..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'64px', resize:'none' }} />
              )}

              {/* Damage */}
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'8px', textTransform:'uppercase' }}>Damage found?</div>
                <div style={{ display:'flex', gap:'8px', marginBottom: form.damage_found ? '12px' : '0' }}>
                  {[{v:false,l:'✓ No damage'},{v:true,l:'⚠️ Yes — damage found'}].map(o => (
                    <button key={String(o.v)} onClick={()=>setForm(f=>({...f,damage_found:o.v}))} style={{ flex:1, padding:'10px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: form.damage_found===o.v ? (o.v?'rgba(231,76,60,0.12)':'rgba(129,199,132,0.10)') : 'rgba(255,255,255,0.05)', border:`1px solid ${form.damage_found===o.v ? (o.v?'rgba(231,76,60,0.30)':'rgba(129,199,132,0.28)') : 'rgba(255,255,255,0.10)'}`, color: form.damage_found===o.v ? (o.v?'rgba(239,154,154,0.95)':'rgba(129,199,132,0.95)') : 'rgba(255,255,255,0.40)' }}>{o.l}</button>
                  ))}
                </div>
                {form.damage_found && (
                  <textarea value={form.damage_description} onChange={e=>setForm(f=>({...f,damage_description:e.target.value}))} placeholder="Describe damage in detail — location, type, severity..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(231,76,60,0.06)', border:'1px solid rgba(231,76,60,0.25)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'64px', resize:'none' }} />
                )}
              </div>

              {/* Photo capture */}
              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                Vehicle Photos ({Object.keys(photos).length}/{PHOTO_SPOTS.length})
              </div>
              {/* Upload full paper form */}
              <div style={{ marginBottom:'14px', padding:'14px 16px', borderRadius:'10px', background:'rgba(255,215,0,0.05)', border:'1px dashed rgba(255,215,0,0.25)' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,215,0,0.65)', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'8px' }}>
                  📄 Upload paper form (optional)
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', marginBottom:'10px' }}>
                  If a paper checklist was filled at the garage, upload a photo or scan of it here.
                </div>
                {/* Upload input - no capture, opens file browser */}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  ref={el => { cameraRefs.current['paper_upload'] = el }}
                  onChange={e => e.target.files?.[0] && handlePhotoCapture('paper_form', e.target.files[0])}
                  style={{ display:'none' }}
                />
                {/* Camera input - capture=environment forces camera */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={el => { cameraRefs.current['paper_camera'] = el }}
                  onChange={e => e.target.files?.[0] && handlePhotoCapture('paper_form', e.target.files[0])}
                  style={{ display:'none' }}
                />
                <div style={{ display:'flex', gap:'8px' }}>
                  <button type="button" onClick={() => cameraRefs.current['paper_upload']?.click()} style={{ padding:'8px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.28)', color:'rgba(255,215,0,0.85)' }}>
                    📁 Upload file / scan
                  </button>
                  <button type="button" onClick={() => cameraRefs.current['paper_camera']?.click()} style={{ padding:'8px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.20)', color:'rgba(255,215,0,0.70)' }}>
                    📷 Take photo of form
                  </button>
                  {photos['paper_form'] && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.90)', display:'flex', alignItems:'center' }}>✓ Form uploaded</span>}
                </div>
              </div>

              <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'10px' }}>Vehicle photos — tap each to capture or upload</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'20px' }}>
                {PHOTO_SPOTS.map(spot => (
                  <div key={spot}>
                    {/* Camera input for this spot */}
                    <input type="file" accept="image/*" capture="environment"
                      ref={el => { cameraRefs.current[spot + '_cam'] = el }}
                      onChange={e => e.target.files?.[0] && handlePhotoCapture(spot, e.target.files[0])}
                      style={{ display:'none' }} />
                    {/* Upload input for this spot */}
                    <input type="file" accept="image/*"
                      ref={el => { cameraRefs.current[spot + '_upl'] = el }}
                      onChange={e => e.target.files?.[0] && handlePhotoCapture(spot, e.target.files[0])}
                      style={{ display:'none' }} />
                    <div style={{ borderRadius:'10px', overflow:'hidden', background: photos[spot] ? 'transparent' : 'rgba(255,255,255,0.05)', border: photos[spot] ? '1px solid rgba(129,199,132,0.35)' : '1px dashed rgba(255,255,255,0.15)', aspectRatio:'1', position:'relative' }}>
                      {photos[spot] ? (
                        <>
                          <img src={photos[spot]} alt={spot} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.55)', padding:'4px', fontSize:'8px', color:'rgba(255,255,255,0.85)', textAlign:'center' }}>✓ {spot}</div>
                          <button type="button" onClick={() => { cameraRefs.current[spot+'_cam']?.click() }} style={{ position:'absolute', top:4, right:4, fontSize:'10px', padding:'2px 6px', borderRadius:'4px', cursor:'pointer', fontFamily:'inherit', background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.20)', color:'white' }}>📷</button>
                        </>
                      ) : (
                        <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', padding:'8px' }}>
                          <div style={{ fontSize:'16px' }}>📷</div>
                          <div style={{ fontSize:'8px', color:'rgba(255,255,255,0.35)', textAlign:'center' }}>{spot}</div>
                          <div style={{ display:'flex', gap:'3px', marginTop:'2px' }}>
                            <button type="button" onClick={() => cameraRefs.current[spot+'_cam']?.click()} style={{ fontSize:'7px', padding:'2px 5px', borderRadius:'4px', cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.50)' }}>📷 Camera</button>
                            <button type="button" onClick={() => cameraRefs.current[spot+'_upl']?.click()} style={{ fontSize:'7px', padding:'2px 5px', borderRadius:'4px', cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.50)' }}>📁 Upload</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'12px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'13px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveChecklist} disabled={saving} style={{ flex:2, padding:'13px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:`linear-gradient(135deg,${form.type==='checkout'?'rgba(129,199,132,0.18),rgba(45,95,63,0.10)':'rgba(100,181,246,0.18),rgba(27,77,92,0.10)'})`, border:`1.5px solid ${form.type==='checkout'?'rgba(129,199,132,0.38)':'rgba(100,181,246,0.38)'}`, color:form.type==='checkout'?'rgba(129,199,132,0.95)':'rgba(100,181,246,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : form.type === 'checkout' ? '🚗 Complete Check-out' : '🔄 Complete Check-in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW */}
      {printChecklist && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', background:'rgba(0,0,0,0.80)', backdropFilter:'blur(12px)', overflowY:'auto', padding:'40px 20px' }}>
          <div style={{ width:'720px', maxWidth:'100%' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px', gap:'10px' }}>
              <button onClick={() => window.print()} style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>🖨 Print / Save PDF</button>
              <button onClick={() => setPrintChecklist(null)} style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.60)', cursor:'pointer', fontFamily:'inherit' }}>✕ Close</button>
            </div>
            <div style={{ background:'#FFFDF7', borderRadius:'8px', overflow:'hidden', fontFamily:'Georgia, serif', color:'#1a1a1a' }}>
              {/* Header */}
              <div style={{ background:'#FFD700', padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'20px', fontWeight:800, color:'#1a1a1a' }}>PSK Safaris & Car Rentals</div>
                  <div style={{ fontSize:'11px', color:'rgba(0,0,0,0.60)', marginTop:'3px' }}>
                    {printChecklist.branch === 'eldoret' ? '64 Plaza, Eldoret | Tel: +254 751 855 180' : '174 Pamba Road, Kisumu | Tel: +254 741 186 538'}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'14px', fontWeight:700 }}>{printChecklist.checklist_ref}</div>
                  <div style={{ fontSize:'11px', color:'rgba(0,0,0,0.55)', marginTop:'2px' }}>{new Date(printChecklist.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
                </div>
              </div>
              <div style={{ height:'5px', background:'linear-gradient(90deg,#FF9500,#FFD700,#2D5F3F,#1B4D5C)' }} />
              <div style={{ background:'#2D5F3F', padding:'10px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#FFD700' }}>
                  VEHICLE {printChecklist.type === 'checkout' ? 'CHECK-OUT' : 'CHECK-IN'} REPORT
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.65)' }}>{printChecklist.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'}</div>
              </div>
              <div style={{ padding:'24px 28px', background:'#FFFDF7' }}>
                {/* Vehicle + Client */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
                  <div style={{ background:'#F5F0E8', border:'1px solid #E0D5C0', borderRadius:'8px', padding:'14px' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'8px' }}>Vehicle</div>
                    <div style={{ fontSize:'16px', fontWeight:700 }}>{printChecklist.vehicle_reg}</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'3px' }}>{printChecklist.vehicle_make} {printChecklist.vehicle_model}</div>
                  </div>
                  <div style={{ background:'#F5F0E8', border:'1px solid #E0D5C0', borderRadius:'8px', padding:'14px' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'8px' }}>Client</div>
                    <div style={{ fontSize:'15px', fontWeight:700 }}>{printChecklist.client_name}</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'3px' }}>{printChecklist.client_phone}</div>
                  </div>
                </div>
                {/* Condition table */}
                <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'20px' }}>
                  <thead>
                    <tr style={{ background:'#2D5F3F' }}>
                      {['Odometer Reading','Fuel Level','Damage Found','Photos Taken','Staff'].map(h=>(
                        <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:'9px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#FFD700' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background:'#FFFDF7', borderBottom:'1px solid #E0D5C0' }}>
                      <td style={{ padding:'12px', fontSize:'14px', fontWeight:700 }}>{printChecklist.odometer?.toLocaleString()} km</td>
                      <td style={{ padding:'12px', fontSize:'13px' }}>{printChecklist.fuel_level}</td>
                      <td style={{ padding:'12px', fontSize:'13px', color: printChecklist.damage_found ? '#CC0000' : '#2D5F3F', fontWeight:600 }}>{printChecklist.damage_found ? '⚠️ YES' : '✓ None'}</td>
                      <td style={{ padding:'12px', fontSize:'13px' }}>{printChecklist.photo_urls?.length || 0} photos</td>
                      <td style={{ padding:'12px', fontSize:'13px' }}>{printChecklist.staff_name || '—'}</td>
                    </tr>
                  </tbody>
                </table>
                {printChecklist.damage_found && printChecklist.damage_description && (
                  <div style={{ background:'#FFF0F0', border:'1px solid #FFAAAA', borderRadius:'6px', padding:'12px 16px', marginBottom:'16px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#CC0000', marginBottom:'6px' }}>⚠️ Damage Description</div>
                    <div style={{ fontSize:'12px', color:'#333' }}>{printChecklist.damage_description}</div>
                  </div>
                )}
                {printChecklist.condition_notes && (
                  <div style={{ background:'#F5F0E8', border:'1px solid #E0D5C0', borderRadius:'6px', padding:'12px 16px', marginBottom:'20px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'6px' }}>Condition Notes</div>
                    <div style={{ fontSize:'12px', color:'#333' }}>{printChecklist.condition_notes}</div>
                  </div>
                )}
                {/* Signatures */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', paddingTop:'20px', borderTop:'1px solid #E0D5C0' }}>
                  <div>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'40px' }}>Client Signature</div>
                    <div style={{ borderBottom:'1px solid #1a1a1a', marginBottom:'6px', height:'40px', background: printChecklist.client_signed ? 'rgba(45,95,63,0.05)' : 'transparent', display:'flex', alignItems:'center', paddingLeft:'8px' }}>
                      {printChecklist.client_signed && <span style={{ fontSize:'13px', color:'#2D5F3F', fontStyle:'italic' }}>✓ Signed by {printChecklist.client_name}</span>}
                    </div>
                    <div style={{ fontSize:'11px', color:'#777' }}>{printChecklist.client_name} | Date: ___________</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'40px' }}>PSK Staff Signature</div>
                    <div style={{ borderBottom:'1px solid #1a1a1a', marginBottom:'6px', height:'40px' }} />
                    <div style={{ fontSize:'11px', color:'#777' }}>{printChecklist.staff_name || 'PSK Staff'} | Date: ___________</div>
                  </div>
                </div>
              </div>
              <div style={{ background:'#2D5F3F', padding:'10px 28px', textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:'#FFD700' }}>Easy car rentals · Self drive/chauffeur driven · Airport transfers · Safaris and excursion</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
