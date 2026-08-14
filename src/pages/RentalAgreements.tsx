import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Agreement {
  id: string
  agreement_ref: string
  booking_id?: string
  branch: 'eldoret' | 'kisumu'
  client_name: string
  client_id_number: string
  client_phone: string
  vehicle_reg: string
  vehicle_make: string
  vehicle_model: string
  pickup_date: string
  return_date: string
  pickup_location: string
  dropoff_location?: string
  daily_rate: number
  total_amount: number
  deposit_amount: number
  trip_type: string
  special_conditions?: string
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled'
  client_signed: boolean
  staff_signed: boolean
  created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const STATUS_CFG = {
  draft:     { label:'Draft',     color:'rgba(255,255,255,0.45)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.12)' },
  sent:      { label:'Sent',      color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  signed:    { label:'Signed',    color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  expired:   { label:'Expired',   color:'rgba(239,154,154,0.80)', bg:'rgba(231,76,60,0.07)',   border:'rgba(231,76,60,0.18)'   },
  cancelled: { label:'Cancelled', color:'rgba(150,150,150,0.70)', bg:'rgba(150,150,150,0.06)', border:'rgba(150,150,150,0.15)' },
}

const TERMS = `1. The vehicle must be returned in the same condition as received. Any damage beyond normal wear will be charged to the hirer.

2. The hirer is responsible for all traffic fines, parking fees and other penalties incurred during the rental period.

3. The vehicle must not be driven outside Kenya without prior written consent from PSK Safaris & Car Rentals.

4. Sub-letting or lending the vehicle to a third party is strictly prohibited.

5. The hirer must hold a valid driving licence for the class of vehicle hired. For self-drive, minimum age is 23 years.

6. Fuel is the responsibility of the hirer unless otherwise stated in the rate band selected.

7. PSK Safaris reserves the right to terminate this agreement immediately if the vehicle is being misused or the hirer breaches any of these terms.

8. In case of accident, the hirer must immediately notify PSK Safaris and the nearest police station. Do not move the vehicle without police clearance.

9. The deposit is refundable upon return of the vehicle in good condition, less any deductions for damage, fuel or outstanding charges.

10. This agreement is governed by the laws of Kenya.`

export default function RentalAgreements() {
  const navigate = useNavigate()
  const location = window.location
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [bookings, setBookings]     = useState<any[]>([])
  const [clients, setClients]       = useState<any[]>([])
  const [vehicles, setVehicles]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [showAdd, setShowAdd]       = useState(false)
  const [selected, setSelected]     = useState<Agreement | null>(null)
  const [preview, setPreview]       = useState<Agreement | null>(null)

  const [form, setForm] = useState({
    branch: 'eldoret',
    booking_id: '',
    client_name: '', client_id_number: '', client_phone: '',
    vehicle_reg: '', vehicle_make: '', vehicle_model: '',
    pickup_date: '', return_date: '',
    pickup_location: '', dropoff_location: '',
    daily_rate: 0, total_amount: 0, deposit_amount: 5000,
    trip_type: 'Chauffeured',
    special_conditions: '',
  })

  useEffect(() => {
    loadAll().then(() => {
      // Check if navigated from booking with prefill params
      const params = new URLSearchParams(window.location.search)
      if (params.get('new') === '1') {
        setForm(f => ({
          ...f,
          booking_id:      params.get('booking_id') || '',
          branch:          (params.get('branch') as any) || 'eldoret',
          client_name:     params.get('client_name') || '',
          client_phone:    params.get('client_phone') || '',
          vehicle_reg:     params.get('vehicle_reg') || '',
          vehicle_make:    params.get('vehicle_make') || '',
          vehicle_model:   params.get('vehicle_model') || '',
          pickup_location: params.get('pickup') || '',
          dropoff_location:params.get('dropoff') || '',
          pickup_date:     params.get('pickup_date') || '',
          return_date:     params.get('return_date') || '',
          daily_rate:      Number(params.get('amount')) || 0,
          total_amount:    Number(params.get('amount')) || 0,
          trip_type:       params.get('trip_type') || 'Chauffeured',
        }))
        setShowAdd(true)
        // Clean URL
        window.history.replaceState({}, '', '/rental-agreements')
      }
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    const [a, b, c, v] = await Promise.all([
      supabase.from('rental_agreements').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('id, booking_ref, client_id, vehicle_id, pickup_date, return_date, pickup_location, dropoff_location, trip_type, amount').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name, phone, id_number').order('name'),
      supabase.from('vehicles').select('id, reg, make, model').order('reg'),
    ])
    if (a.data) setAgreements(a.data as Agreement[])
    if (b.data) setBookings(b.data)
    if (c.data) setClients(c.data)
    if (v.data) setVehicles(v.data)
    setLoading(false)
  }

  // Auto-fill form when booking is selected
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
      client_id_number: client?.id_number || '',
      vehicle_reg: vehicle?.reg || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      pickup_date: booking.pickup_date?.split('T')[0] || '',
      return_date: booking.return_date?.split('T')[0] || '',
      pickup_location: booking.pickup_location || '',
      dropoff_location: booking.dropoff_location || '',
      trip_type: booking.trip_type || 'Chauffeured',
      total_amount: booking.amount || 0,
    }))
  }

  async function saveAgreement() {
    if (!form.booking_id) {
      alert('Please select a booking first')
      return
    }
    if (!form.client_name || !form.vehicle_reg || !form.pickup_date || !form.return_date) {
      alert('Please fill in: Client name, Vehicle, Pickup date, Return date')
      return
    }
    setSaving(true)
    const ref = `PSK-RA-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
    const { error } = await supabase.from('rental_agreements').insert([{
      agreement_ref: ref,
      booking_id: form.booking_id || null,
      branch: form.branch,
      client_name: form.client_name,
      client_id_number: form.client_id_number || null,
      client_phone: form.client_phone,
      vehicle_reg: form.vehicle_reg,
      vehicle_make: form.vehicle_make,
      vehicle_model: form.vehicle_model,
      pickup_date: form.pickup_date,
      return_date: form.return_date,
      pickup_location: form.pickup_location || null,
      dropoff_location: form.dropoff_location || null,
      daily_rate: form.daily_rate || null,
      total_amount: form.total_amount || null,
      deposit_amount: form.deposit_amount || null,
      trip_type: form.trip_type,
      special_conditions: form.special_conditions || null,
      status: 'draft',
      client_signed: false,
      staff_signed: false,
    }])
    setSaving(false)
    if (!error) {
      setShowAdd(false)
      resetForm()
      loadAll()
    } else {
      // Table might not exist yet — show helpful message
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        alert('Please run the rental_agreements table SQL in Supabase first. Check Settings for the SQL.')
      } else {
        alert('Error: ' + error.message)
      }
    }
  }

  function resetForm() {
    setForm({ branch:'eldoret', booking_id:'', client_name:'', client_id_number:'', client_phone:'', vehicle_reg:'', vehicle_make:'', vehicle_model:'', pickup_date:'', return_date:'', pickup_location:'', dropoff_location:'', daily_rate:0, total_amount:0, deposit_amount:5000, trip_type:'Chauffeured', special_conditions:'' })
  }

  const fld = (label: string, children: React.ReactNode, required=false) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>
        {label}{required && <span style={{ color:'rgba(239,154,154,0.80)', marginLeft:'3px' }}>*</span>}
      </div>
      {children}
    </div>
  )

  const inp = (key: string, type='text', placeholder='') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]}
      onChange={e => setForm(f => ({...f, [key]: type==='number' ? Number(e.target.value) : e.target.value}))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )

  const BRANCH = form.branch === 'eldoret'
    ? { name:'PSK Safaris & Car Rentals', address:'64 Plaza, Eldoret', poBox:'P.O. Box 5079-30100', tel:'+254 751 855 180 / +254 741 186 538', pin:'P051664556P' }
    : { name:'PSK Safaris & Car Rentals', address:'174 Pamba Road, Tom Mboya, Kisumu', poBox:'', tel:'+254 741 186 538 / +254 740 355 180', pin:'P051664556P' }

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>
          Rental Agreements <span style={{ fontSize:'12px', fontWeight:400, color:'rgba(255,255,255,0.35)', marginLeft:'8px' }}>{agreements.length} total</span>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding:'7px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>
          + New agreement
        </button>
      </div>

      {/* Table */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading agreements...</div>
        ) : agreements.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>📋</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No rental agreements yet</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Create a rental agreement for a booking. Client signs digitally — no paper needed.</div>
            <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Create first agreement</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Agreement ref','Client','Vehicle','Pickup','Return','Trip','Status','Signed','Action'].map(h => (
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agreements.map(a => {
                const sc = STATUS_CFG[a.status] || STATUS_CFG.draft
                return (
                  <tr key={a.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)' }}>{a.agreement_ref}</div></td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{a.client_name}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>{a.client_phone}</div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.82)' }}>{a.vehicle_reg}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>{a.vehicle_make} {a.vehicle_model}</div>
                    </td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{a.pickup_date ? new Date(a.pickup_date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{a.return_date ? new Date(a.return_date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.50)' }}>{a.trip_type}</div></td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{sc.label}</span></td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <span style={{ fontSize:'10px', color: a.client_signed ? 'rgba(129,199,132,0.90)' : 'rgba(255,255,255,0.25)' }}>{a.client_signed ? '✓ Client' : '○ Client'}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => setSelected(a)} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                        <button onClick={() => setPreview(a)} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.25)', color:'rgba(255,215,0,0.80)', cursor:'pointer', fontFamily:'inherit' }}>Preview</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* AGREEMENT DETAIL SLIDE-OVER */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'420px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>
            <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:STATUS_CFG[selected.status]?.color, background:STATUS_CFG[selected.status]?.bg, border:`1px solid ${STATUS_CFG[selected.status]?.border}` }}>{STATUS_CFG[selected.status]?.label}</span>
            <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,215,0,0.85)', margin:'12px 0 4px' }}>{selected.agreement_ref}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'}</div>
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              {[
                { label:'Client',          value: selected.client_name },
                { label:'Client ID',       value: selected.client_id_number || '—' },
                { label:'Client phone',    value: selected.client_phone },
                { label:'Vehicle',         value: `${selected.vehicle_reg} · ${selected.vehicle_make} ${selected.vehicle_model}` },
                { label:'Trip type',       value: selected.trip_type },
                { label:'Pickup date',     value: selected.pickup_date ? new Date(selected.pickup_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—' },
                { label:'Return date',     value: selected.return_date ? new Date(selected.return_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—' },
                { label:'Pickup location', value: selected.pickup_location || '—' },
                { label:'Total amount',    value: selected.total_amount ? `KES ${selected.total_amount.toLocaleString()}` : '—' },
                { label:'Deposit',         value: selected.deposit_amount ? `KES ${selected.deposit_amount.toLocaleString()}` : '—' },
                { label:'Client signed',   value: selected.client_signed ? '✓ Yes' : '✗ Not yet' },
              ].map((r,i,arr) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {[
                { label:'Preview agreement', primary:true, onClick:()=>{ setSelected(null); setPreview(selected) } },
                { label:'Mark as signed', primary:false, onClick: async()=>{ await supabase.from('rental_agreements').update({client_signed:true,status:'signed'}).eq('id',selected.id); loadAll(); setSelected(null) } },
                { label:'Send WhatsApp', primary:false, onClick:()=>{ window.open(`https://wa.me/${selected.client_phone.replace(/\D/g,'')}?text=Dear ${selected.client_name}, please find your rental agreement ${selected.agreement_ref} from PSK Safaris.`,'_blank') } },
              ].map((btn,i) => (
                <button key={i} onClick={btn.onClick} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:btn.primary?'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))':'rgba(255,255,255,0.06)', border:`1px solid ${btn.primary?'rgba(255,215,0,0.32)':'rgba(255,255,255,0.12)'}`, color:btn.primary?'rgba(255,215,0,0.95)':'rgba(255,255,255,0.60)' }}>{btn.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AGREEMENT PREVIEW — Concept B Warm Safari Template */}
      {preview && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', background:'rgba(0,0,0,0.80)', backdropFilter:'blur(12px)', overflowY:'auto', padding:'40px 20px' }}>
          <div style={{ width:'780px', maxWidth:'100%' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px', gap:'10px' }}>
              <button onClick={() => window.print()} style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>🖨 Print / Save PDF</button>
              <button onClick={() => setPreview(null)} style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.60)', cursor:'pointer', fontFamily:'inherit' }}>✕ Close</button>
            </div>

            {/* THE DOCUMENT */}
            <div id="agreement-doc" style={{ background:'#FFFDF7', borderRadius:'8px', overflow:'hidden', fontFamily:'Georgia, serif', color:'#1a1a1a' }}>

              {/* Header — Gold */}
              <div style={{ background:'#FFD700', padding:'22px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'22px', fontWeight:800, color:'#1a1a1a', letterSpacing:'-0.5px' }}>PSK Safaris & Car Rentals</div>
                  <div style={{ fontSize:'12px', color:'rgba(0,0,0,0.65)', marginTop:'4px' }}>
                    {preview.branch === 'eldoret' ? '64 Plaza, Eldoret | P.O. Box 5079-30100 | Tel: +254 751 855 180' : '174 Pamba Road, Tom Mboya, Kisumu | Tel: +254 741 186 538'}
                  </div>
                  <div style={{ fontSize:'11px', color:'rgba(0,0,0,0.55)', marginTop:'2px' }}>PIN: P051664556P</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'11px', color:'rgba(0,0,0,0.55)' }}>Document ref</div>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'#1a1a1a' }}>{preview.agreement_ref}</div>
                  <div style={{ fontSize:'11px', color:'rgba(0,0,0,0.55)', marginTop:'2px' }}>{new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
                </div>
              </div>

              {/* Rainbow stripe */}
              <div style={{ height:'5px', background:'linear-gradient(90deg, #FF9500, #FFD700, #2D5F3F, #1B4D5C)' }} />

              {/* Banner */}
              <div style={{ background:'#2D5F3F', padding:'12px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#FFD700', letterSpacing:'0.5px' }}>VEHICLE RENTAL AGREEMENT</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{preview.trip_type} · {preview.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'}</div>
              </div>

              {/* Body */}
              <div style={{ padding:'28px 32px', background:'#FFFDF7' }}>

                {/* Parties */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px' }}>
                  <div style={{ background:'#F5F0E8', border:'1px solid #E0D5C0', borderRadius:'8px', padding:'16px' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'10px' }}>Hirer (Client)</div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#1a1a1a', marginBottom:'6px' }}>{preview.client_name}</div>
                    <div style={{ fontSize:'12px', color:'#555', marginBottom:'3px' }}>ID/DL/Passport: {preview.client_id_number || '___________________'}</div>
                    <div style={{ fontSize:'12px', color:'#555' }}>Phone: {preview.client_phone}</div>
                  </div>
                  <div style={{ background:'#F5F0E8', border:'1px solid #E0D5C0', borderRadius:'8px', padding:'16px' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'10px' }}>Vehicle Owner / Operator</div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#1a1a1a', marginBottom:'6px' }}>PSK Safaris & Car Rentals</div>
                    <div style={{ fontSize:'12px', color:'#555', marginBottom:'3px' }}>{preview.branch === 'eldoret' ? '64 Plaza, Eldoret' : '174 Pamba Road, Kisumu'}</div>
                    <div style={{ fontSize:'12px', color:'#555' }}>PIN: P051664556P</div>
                  </div>
                </div>

                {/* Vehicle & Trip details */}
                <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'20px' }}>
                  <thead>
                    <tr style={{ background:'#2D5F3F' }}>
                      {['Vehicle Details','Rental Period','Financial Summary'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#FFD700' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background:'#FFFDF7', borderBottom:'1px solid #E0D5C0' }}>
                      <td style={{ padding:'12px 14px', fontSize:'12px', color:'#1a1a1a' }}>
                        <div style={{ fontWeight:700, fontSize:'14px' }}>{preview.vehicle_reg}</div>
                        <div style={{ color:'#555', marginTop:'3px' }}>{preview.vehicle_make} {preview.vehicle_model}</div>
                        <div style={{ color:'#777', fontSize:'11px', marginTop:'2px' }}>Trip type: {preview.trip_type}</div>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:'12px', color:'#1a1a1a' }}>
                        <div><span style={{ color:'#777' }}>From: </span><strong>{preview.pickup_date ? new Date(preview.pickup_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—'}</strong></div>
                        <div style={{ marginTop:'4px' }}><span style={{ color:'#777' }}>To: </span><strong>{preview.return_date ? new Date(preview.return_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—'}</strong></div>
                        <div style={{ marginTop:'4px' }}><span style={{ color:'#777' }}>Pickup: </span>{preview.pickup_location || '—'}</div>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:'12px', color:'#1a1a1a' }}>
                        <div><span style={{ color:'#777' }}>Total: </span><strong style={{ color:'#2D5F3F', fontSize:'15px' }}>KES {preview.total_amount?.toLocaleString() || '—'}</strong></div>
                        <div style={{ marginTop:'4px' }}><span style={{ color:'#777' }}>Deposit: </span><strong>KES {preview.deposit_amount?.toLocaleString() || '—'}</strong></div>
                        <div style={{ marginTop:'4px', fontSize:'11px', color:'#888' }}>VAT applicable where stated</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Terms */}
                <div style={{ marginBottom:'24px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'10px', paddingBottom:'6px', borderBottom:'2px solid #FFD700' }}>Terms & Conditions</div>
                  {TERMS.split('\n\n').map((term, i) => (
                    <div key={i} style={{ fontSize:'11px', color:'#444', lineHeight:'1.7', marginBottom:'6px' }}>{term}</div>
                  ))}
                </div>

                {/* Special conditions */}
                {preview.special_conditions && (
                  <div style={{ background:'#FFF8E0', border:'1px solid #FFD700', borderRadius:'6px', padding:'12px 16px', marginBottom:'24px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#CC7700', marginBottom:'6px' }}>Special Conditions</div>
                    <div style={{ fontSize:'12px', color:'#555' }}>{preview.special_conditions}</div>
                  </div>
                )}

                {/* Signatures */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', marginTop:'32px', paddingTop:'24px', borderTop:'1px solid #E0D5C0' }}>
                  <div>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'40px' }}>Hirer Signature</div>
                    <div style={{ borderBottom:'1px solid #1a1a1a', marginBottom:'6px', height:'40px', background: preview.client_signed ? 'rgba(45,95,63,0.05)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {preview.client_signed && <div style={{ fontSize:'13px', color:'#2D5F3F', fontStyle:'italic' }}>✓ Signed by {preview.client_name}</div>}
                    </div>
                    <div style={{ fontSize:'11px', color:'#777' }}>{preview.client_name} | Date: ___________</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#2D5F3F', marginBottom:'40px' }}>PSK Authorised Signature</div>
                    <div style={{ borderBottom:'1px solid #1a1a1a', marginBottom:'6px', height:'40px' }} />
                    <div style={{ fontSize:'11px', color:'#777' }}>For PSK Safaris & Car Rentals | Date: ___________</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background:'#2D5F3F', padding:'12px 32px', textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:'#FFD700', fontWeight:500 }}>
                  Easy car rentals · Self drive/chauffeur driven · Airport transfers · Safaris and excursion
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW AGREEMENT MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'600px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'22px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>New Rental Agreement</div>
              <button onClick={() => { setShowAdd(false); resetForm() }} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit', fontSize:'16px' }}>✕</button>
            </div>
            <div style={{ padding:'24px 28px' }}>

              {/* Link to existing booking */}
              {fld('Select booking *',
                <select value={form.booking_id} onChange={e => onBookingSelect(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                  <option value="">Select a booking...</option>
                  {bookings.map(b => <option key={b.id} value={b.id}>{b.booking_ref} — {clients.find(c=>c.id===b.client_id)?.name || 'Unknown client'}</option>)}
                </select>
              )}

              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Branch & Client</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Branch', <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option></select>)}
                {fld('Client full name *', inp('client_name','text','e.g. Sarah Mutai'), true)}
                {fld('Client ID/DL/Passport no.', inp('client_id_number','text','e.g. 12345678'))}
                {fld('Client phone', inp('client_phone','tel','e.g. +254 712 345 678'))}
              </div>

              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Vehicle</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
                {fld('Registration *', inp('vehicle_reg','text','e.g. KCA 123B'), true)}
                {fld('Make', inp('vehicle_make','text','e.g. Toyota'))}
                {fld('Model', inp('vehicle_model','text','e.g. Prado'))}
              </div>

              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Rental Period</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Pickup date *', inp('pickup_date','date'), true)}
                {fld('Return date *', inp('return_date','date'), true)}
                {fld('Pickup location', inp('pickup_location','text','e.g. Eldoret Town'))}
                {fld('Dropoff location', inp('dropoff_location','text','e.g. Kisumu, Nairobi'))}
              </div>

              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Financial</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
                {fld('Trip type', <select value={form.trip_type} onChange={e=>setForm(f=>({...f,trip_type:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>{['Chauffeured','Safari','Self-drive','Airport transfer'].map(t=><option key={t}>{t}</option>)}</select>)}
                {fld('Total amount (KES)', inp('total_amount','number','0'))}
                {fld('Deposit (KES)', inp('deposit_amount','number','5000'))}
              </div>

              {fld('Special conditions (optional)',
                <textarea value={form.special_conditions} onChange={e=>setForm(f=>({...f,special_conditions:e.target.value}))} placeholder="Any special terms for this agreement..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'72px', resize:'none' }} />
              )}

              <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
                <button onClick={() => { setShowAdd(false); resetForm() }} style={{ flex:1, padding:'13px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveAgreement} disabled={saving} style={{ flex:2, padding:'13px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving ? 'Saving...' : 'Create Agreement'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
