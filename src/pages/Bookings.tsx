import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type TripType = 'chauffeured' | 'safari' | 'self-drive' | 'airport'
type BookingStatus = 'confirmed' | 'active' | 'completed' | 'cancelled' | 'overdue'

interface Booking {
  id: string
  booking_ref: string
  branch: 'eldoret' | 'kisumu'
  client_id: string
  vehicle_id: string
  driver_id?: string
  trip_type: TripType
  pickup_date: string
  return_date: string
  pickup_location: string
  dropoff_location?: string
  distance_band?: string
  status: BookingStatus
  amount?: number
  amount_paid?: number
  notes?: string
  created_at: string
  // joined
  client_name?: string
  vehicle_reg?: string
  vehicle_model?: string
  driver_name?: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const TRIP_TYPES: Record<TripType, { label:string; color:string; bg:string; border:string }> = {
  chauffeured: { label:'Chauffeur',   color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  safari:      { label:'Safari',      color:'rgba(206,147,216,0.95)', bg:'rgba(206,147,216,0.08)', border:'rgba(206,147,216,0.25)' },
  'self-drive':{ label:'Self-drive',  color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.28)' },
  airport:     { label:'Airport',     color:'rgba(255,183,77,0.95)',  bg:'rgba(255,183,77,0.08)',  border:'rgba(255,183,77,0.25)'  },
}

const STATUS_CFG: Record<BookingStatus, { label:string; color:string; bg:string; border:string }> = {
  confirmed: { label:'Confirmed', color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  active:    { label:'Active',    color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  completed: { label:'Completed', color:'rgba(255,255,255,0.40)', bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.12)' },
  cancelled: { label:'Cancelled', color:'rgba(239,154,154,0.80)', bg:'rgba(231,76,60,0.07)',   border:'rgba(231,76,60,0.18)'   },
  overdue:   { label:'Overdue',   color:'rgba(239,154,154,0.98)', bg:'rgba(239,154,154,0.09)', border:'rgba(239,154,154,0.32)' },
}

const RATECARD: Record<string, {driverOnly:number; fuel100:number; fuel300:number}> = {
  'Saloon Car':        { driverOnly:5500,  fuel100:9500,  fuel300:13500 },
  'Rav 4':             { driverOnly:8500,  fuel100:13500, fuel300:17500 },
  'Noah':              { driverOnly:9500,  fuel100:14500, fuel300:18500 },
  'Prado':             { driverOnly:15000, fuel100:20000, fuel300:25000 },
  'Land Cruiser':      { driverOnly:20000, fuel100:26000, fuel300:32000 },
  'Van 11-seater':     { driverOnly:12000, fuel100:17000, fuel300:24000 },
  'Van 14-seater':     { driverOnly:18000, fuel100:24000, fuel300:28000 },
  'Coaster 22-seater': { driverOnly:25000, fuel100:32000, fuel300:38000 },
}

export default function Bookings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [clients, setClients]     = useState<any[]>([])
  const [vehicles, setVehicles]   = useState<any[]>([])
  const [drivers, setDrivers]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus|'all'>('all')
  const [filterType, setFilterType]     = useState<TripType|'all'>('all')
  const [showAdd, setShowAdd]     = useState(false)
  const [selected, setSelected]   = useState<Booking | null>(null)

  const [form, setForm] = useState({
    branch: 'eldoret', client_id: '', vehicle_id: '', driver_id: '',
    trip_type: 'chauffeured' as TripType,
    pickup_date: '', pickup_time: '08:00',
    return_date: '', return_time: '17:00',
    pickup_location: '', dropoff_location: '',
    distance_band: 'driver_only',
    overnight: false, overnight_nights: 1,
    notes: '',
  })

  useEffect(() => { loadAll() }, [])
  useEffect(() => { if ((location.state as any)?.openAdd) { setShowAdd(true) } }, [location.state])

  async function loadAll() {
    setLoading(true)
    const [b, c, v, d] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name, type, phone').order('name'),
      supabase.from('vehicles').select('id, reg, make, model, vehicle_class, status').order('reg'),
      supabase.from('drivers').select('id, name, phone').order('name'),
    ])
    if (b.data) setBookings(b.data as Booking[])
    if (c.data) setClients(c.data)
    if (v.data) setVehicles(v.data)
    if (d.data) setDrivers(d.data)
    setLoading(false)
  }

  // Auto-calculate rate
  const selectedVehicle = vehicles.find(v => v.id === form.vehicle_id)
  const vehicleClass = selectedVehicle?.vehicle_class || ''
  const rates = RATECARD[vehicleClass]
  const calcRate = () => {
    if (!rates) return 0
    if (form.trip_type === 'self-drive') return form.distance_band === 'within250' ? 4000 : 4500
    const days = form.pickup_date && form.return_date
      ? Math.max(1, Math.ceil((new Date(form.return_date).getTime() - new Date(form.pickup_date).getTime()) / 86400000))
      : 1
    const dayRate = form.distance_band === 'driver_only' ? rates.driverOnly : form.distance_band === 'fuel100' ? rates.fuel100 : rates.fuel300
    const overnight = form.overnight ? form.overnight_nights * 2500 : 0
    return (dayRate * days) + overnight
  }

  async function saveBooking() {
    if (!form.client_id || !form.vehicle_id || !form.pickup_date || !form.return_date) {
      alert('Please fill in: Client, Vehicle, Pickup date, Return date')
      return
    }
    setSaving(true)
    const ref = `BK-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
    const { error } = await supabase.from('bookings').insert([{
      booking_ref: ref,
      branch: form.branch,
      client_id: form.client_id,
      vehicle_id: form.vehicle_id,
      driver_id: form.driver_id || null,
      trip_type: form.trip_type,
      pickup_date: `${form.pickup_date}T${form.pickup_time}:00`,
      return_date: `${form.return_date}T${form.return_time}:00`,
      pickup_location: form.pickup_location || null,
      dropoff_location: form.dropoff_location || null,
      distance_band: form.distance_band,
      status: 'confirmed',
      amount: Number(form.daily_charge) || null,
      amount_paid: Number(form.hire_deposit) || 0,
      notes: form.notes || null,
    }])
    setSaving(false)
    if (!error) {
      // Update vehicle status to reflect it's now on hire
      const tripToStatus: Record<string,string> = {
        chauffeured: 'chauffeured', safari: 'safari',
        'self-drive': 'self-drive', airport: 'chauffeured',
      }
      const newStatus = tripToStatus[form.trip_type] || 'chauffeured'
      await supabase.from('vehicles').update({ status: newStatus }).eq('id', form.vehicle_id)

      setShowAdd(false)
      setForm({ branch:'eldoret', client_id:'', vehicle_id:'', driver_id:'', trip_type:'chauffeured', pickup_date:'', pickup_time:'08:00', return_date:'', return_time:'17:00', pickup_location:'', dropoff_location:'', distance_band:'driver_only', overnight:false, overnight_nights:1, notes:'', daily_charge:'', hire_deposit:'' })
      loadAll()
    } else alert('Error: ' + error.message)
  }

  // Update booking status — and sync vehicle status back when done/cancelled
  async function updateBookingStatus(bookingId: string, vehicleId: string, newStatus: string) {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    // When completed or cancelled, free the vehicle
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      await supabase.from('vehicles').update({ status: 'available' }).eq('id', vehicleId)
    }
    loadAll()
  }

  const filtered = bookings.filter(b => {
    const ms = filterStatus === 'all' || b.status === filterStatus
    const mt = filterType === 'all' || b.trip_type === filterType
    const mq = !search || b.booking_ref?.toLowerCase().includes(search.toLowerCase())
    return ms && mt && mq
  })

  const fld = (label: string, children: React.ReactNode, required=false) => (
    <div style={{ marginBottom:'14px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'6px', textTransform:'uppercase' }}>
        {label}{required && <span style={{ color:'rgba(239,154,154,0.80)', marginLeft:'3px' }}>*</span>}
      </div>
      {children}
    </div>
  )

  const inp = (key: string, type='text', placeholder='') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]}
      onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )

  const sel = (key: string, options: {value:string; label:string}[]) => (
    <select value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {(['all','confirmed','active','overdue','completed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:filterStatus===s?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${filterStatus===s?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:filterStatus===s?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>
              {s === 'all' ? `All (${bookings.length})` : STATUS_CFG[s]?.label}
            </button>
          ))}
          {(['all','chauffeured','safari','self-drive','airport'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{ padding:'6px 14px', borderRadius:'20px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:filterType===t?'rgba(100,181,246,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${filterType===t?'rgba(100,181,246,0.35)':'rgba(255,255,255,0.09)'}`, color:filterType===t?'rgba(100,181,246,0.90)':'rgba(255,255,255,0.35)' }}>
              {t === 'all' ? 'All types' : TRIP_TYPES[t]?.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search booking ref..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'180px' }} />
          <button onClick={() => setShowAdd(true)} style={{ padding:'7px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>+ New booking</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>📅</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>{bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filter'}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Create your first booking to get started</div>
            <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Create first booking</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Booking ref','Client','Vehicle','Trip type','Pickup','Return','Status','Action'].map(h => (
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const tc = TRIP_TYPES[b.trip_type] || TRIP_TYPES.chauffeured
                const sc = STATUS_CFG[b.status] || STATUS_CFG.confirmed
                const client = clients.find(c => c.id === b.client_id)
                const vehicle = vehicles.find(v => v.id === b.vehicle_id)
                return (
                  <tr key={b.id} onClick={() => setSelected(b)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', transition:'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)' }}>{b.booking_ref}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.80)' }}>{client?.name || '—'}</div></td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.82)' }}>{vehicle?.reg || '—'}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>{vehicle?.make} {vehicle?.model}</div>
                    </td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:tc.color, background:tc.bg, border:`1px solid ${tc.border}` }}>{tc.label}</span></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{b.pickup_date ? new Date(b.pickup_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{b.return_date ? new Date(b.return_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</div></td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{sc.label}</span></td>
                    <td style={{ padding:'12px' }}><button onClick={e=>{e.stopPropagation();setSelected(b)}} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit' }}>View</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* BOOKING DETAIL SLIDE-OVER */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'460px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:STATUS_CFG[selected.status]?.color, background:STATUS_CFG[selected.status]?.bg, border:`1px solid ${STATUS_CFG[selected.status]?.border}` }}>{STATUS_CFG[selected.status]?.label}</span>
              <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:TRIP_TYPES[selected.trip_type]?.color, background:TRIP_TYPES[selected.trip_type]?.bg, border:`1px solid ${TRIP_TYPES[selected.trip_type]?.border}` }}>{TRIP_TYPES[selected.trip_type]?.label}</span>
            </div>
            <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,215,0,0.85)', marginBottom:'4px' }}>{selected.booking_ref}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'}</div>
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              {[
                { label:'Client',          value: clients.find(c=>c.id===selected.client_id)?.name || '—' },
                { label:'Vehicle',         value: (() => { const v = vehicles.find(x=>x.id===selected.vehicle_id); return v ? `${v.reg} · ${v.make} ${v.model}` : '—' })() },
                { label:'Driver',          value: drivers.find(d=>d.id===selected.driver_id)?.name || 'Not assigned' },
                { label:'Pickup',          value: selected.pickup_location || '—' },
                { label:'Dropoff',         value: selected.dropoff_location || '—' },
                { label:'Pickup date',     value: selected.pickup_date ? new Date(selected.pickup_date).toLocaleString('en-GB') : '—' },
                { label:'Return date',     value: selected.return_date ? new Date(selected.return_date).toLocaleString('en-GB') : '—' },
              ].map((r,i,arr) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.78)' }}>{r.value}</span>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ ...gl.panel, padding:'14px', marginBottom:'16px' }}>
                <div style={{ ...gl.label, marginBottom:'8px' }}>Notes</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.60)', lineHeight:'1.6' }}>{selected.notes}</div>
              </div>
            )}
            <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', borderRadius:'10px', padding:'14px 16px', marginBottom:'20px' }}>
              <div style={{ ...gl.label, marginBottom:'8px' }}>Payment (Finance section)</div>
              <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)' }}>🔒 Invoice and payment details live in Finance → Documents</div>
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {selected.status !== 'completed' && selected.status !== 'cancelled' && (<>
                {selected.status === 'confirmed' && (
                  <button onClick={()=>updateBookingStatus(selected.id, selected.vehicle_id, 'active')}
                    style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)' }}>
                    ▶ Mark Active
                  </button>
                )}
                <button onClick={()=>{ if(window.confirm('Mark this booking as completed? Vehicle will be set back to available.')) updateBookingStatus(selected.id, selected.vehicle_id, 'completed') }}
                  style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(34,197,94,0.10)', border:'1px solid rgba(34,197,94,0.30)', color:'rgba(34,197,94,0.90)' }}>
                  ✓ Mark Completed
                </button>
                <button onClick={()=>{ if(window.confirm('Cancel this booking? Vehicle will be set back to available.')) updateBookingStatus(selected.id, selected.vehicle_id, 'cancelled') }}
                  style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'rgba(239,68,68,0.85)' }}>
                  ✕ Cancel
                </button>
              </>)}
              {(selected.status === 'completed' || selected.status === 'cancelled') && (
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', padding:'8px 0' }}>
                  This booking is {selected.status}.
                </div>
              )}
              <button
                onClick={() => {
                  // Navigate to rental agreements with booking prefilled
                  const params = new URLSearchParams({
                    booking_id: selected.id,
                    booking_ref: selected.booking_ref || '',
                    client_name: clients.find((c:any)=>c.id===selected.client_id)?.name || '',
                    client_phone: clients.find((c:any)=>c.id===selected.client_id)?.phone || '',
                    vehicle_reg: vehicles.find((v:any)=>v.id===selected.vehicle_id)?.reg || '',
                    vehicle_make: vehicles.find((v:any)=>v.id===selected.vehicle_id)?.make || '',
                    vehicle_model: vehicles.find((v:any)=>v.id===selected.vehicle_id)?.model || '',
                    pickup: selected.pickup_location || '',
                    dropoff: selected.dropoff_location || '',
                    pickup_date: selected.pickup_date || '',
                    return_date: selected.return_date || '',
                    amount: String(selected.amount || ''),
                    trip_type: selected.trip_type || '',
                    branch: selected.branch || '',
                  })
                  navigate(`/rental-agreements?new=1&${params.toString()}`)
                }}
                style={{ width:'100%', marginTop:'10px', padding:'11px', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.28)', color:'rgba(100,181,246,0.90)' }}>
                📋 Generate Rental Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW BOOKING MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'620px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'22px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>New Booking</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.30)', marginTop:'3px' }}>
                  {vehicleClass && rates ? `Estimated: KES ${calcRate().toLocaleString()}` : 'Select vehicle to see estimated rate'}
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit', fontSize:'16px' }}>✕</button>
            </div>

            <div style={{ padding:'24px 28px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>

                {/* Branch */}
                <div style={{ gridColumn:'1/-1' }}>
                  {fld('Branch *', sel('branch', [{ value:'eldoret', label:'Eldoret HQ' },{ value:'kisumu', label:'Kisumu Branch' }]))}
                </div>

                {/* Client */}
                <div style={{ gridColumn:'1/-1' }}>
                  {fld('Client *',
                    <select value={form.client_id} onChange={e=>setForm(f=>({...f,client_id:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                      <option value="">Select client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                    </select>,
                  true)}
                </div>

                {/* Vehicle */}
                <div style={{ gridColumn:'1/-1' }}>
                  {fld('Vehicle *',
                    <select value={form.vehicle_id} onChange={e=>setForm(f=>({...f,vehicle_id:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                      <option value="">Select vehicle...</option>
                      {vehicles.filter(v=>v.status==='available').map(v => <option key={v.id} value={v.id}>{v.reg} — {v.make} {v.model} ({v.vehicle_class})</option>)}
                    </select>,
                  true)}
                </div>

                {/* Trip type */}
                {fld('Trip type *', sel('trip_type', Object.entries(TRIP_TYPES).map(([v,t])=>({value:v,label:t.label}))))}

                {/* Distance band */}
                {fld('Rate band', sel('distance_band', [
                  {value:'driver_only', label:'Driver only (no fuel)'},
                  {value:'fuel100',     label:'With fuel ≤100km'},
                  {value:'fuel300',     label:'With fuel ≤300km'},
                  {value:'selfdrv250',  label:'Self-drive ≤250km/day'},
                  {value:'selfdrv500',  label:'Self-drive ≤500km/day'},
                ]))}

                {/* Pickup date + time */}
                {fld('Pickup date *', inp('pickup_date','date'), true)}
                {fld('Pickup time', inp('pickup_time','time'))}

                {/* Return date + time */}
                {fld('Return date *', inp('return_date','date'), true)}
                {fld('Return time', inp('return_time','time'))}

                {/* Pickup location */}
                {fld('Pickup location', inp('pickup_location','text','e.g. Eldoret Town, JKIA...'))}
                {fld(form.trip_type === 'self-drive' ? 'Destination' : 'Dropoff location', inp('dropoff_location','text', form.trip_type === 'self-drive' ? 'e.g. Nakuru, Kisumu...' : 'e.g. JKIA, Mombasa...'))}

                {/* Driver */}
                {fld('Assign driver (optional)',
                  <select value={form.driver_id} onChange={e=>setForm(f=>({...f,driver_id:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                    <option value="">No driver assigned</option>
                    {drivers.filter(d=>d.status==='available').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}

                {/* Overnight */}
                <div>
                  {fld('Overnight driver?',
                    <div style={{ display:'flex', gap:'8px' }}>
                      {[{v:false,l:'No'},{v:true,l:'Yes'}].map(o=>(
                        <button key={String(o.v)} onClick={()=>setForm(f=>({...f,overnight:o.v}))} style={{ flex:1, padding:'10px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:form.overnight===o.v?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${form.overnight===o.v?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:form.overnight===o.v?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{o.l}</button>
                      ))}
                    </div>
                  )}
                </div>
                {form.overnight && fld('Overnight nights', inp('overnight_nights','number'))}
              </div>

              {/* Notes */}
              <div style={{ marginTop:'4px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'6px', textTransform:'uppercase' }}>Notes</div>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Special instructions, park fees, custom items..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'72px', resize:'none' }} />
              </div>

              {/* Manual payment details */}
              <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', borderRadius:'10px', padding:'14px 16px', marginTop:'16px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,215,0,0.55)', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:'12px' }}>Payment Details</div>
                <div style={{ marginBottom:'10px' }}>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', marginBottom:'5px', fontWeight:500 }}>Daily hire charge (KES)</div>
                  <input type="number" value={form.daily_charge} onChange={e=>setForm(f=>({...f,daily_charge:e.target.value}))}
                    placeholder="e.g. 8,000"
                    style={{ width:'100%', padding:'9px 12px', borderRadius:'9px', fontSize:'15px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,215,0,0.25)', color:'rgba(255,255,255,0.92)', outline:'none', fontFamily:'inherit', fontWeight:600 }} />
                </div>
                <div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', marginBottom:'5px', fontWeight:500 }}>Hire deposit paid (KES)</div>
                  <input type="number" value={form.hire_deposit} onChange={e=>setForm(f=>({...f,hire_deposit:e.target.value}))}
                    placeholder="e.g. 5,000"
                    style={{ width:'100%', padding:'9px 12px', borderRadius:'9px', fontSize:'15px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.92)', outline:'none', fontFamily:'inherit' }} />
                </div>
              </div>

              <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'13px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveBooking} disabled={saving} style={{ flex:2, padding:'13px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving ? 'Saving...' : 'Confirm Booking'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
