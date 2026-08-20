import { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useNavigate, useLocation } from 'react-router-dom'
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

const TERMS = [
  "The hirer/driver should bring a valid driving licence, original ID or passport.",
  "As the car hire hands the car to the hirer, both parties SHOULD check the visible condition of the car to avoid possible disputes regarding damages. The hirer is obliged to compensate during the rental period any damages or lost accessories e.g. jack, spare wheel etc.",
  "If the vehicle breaks down due to hirer's negligence e.g. flat battery, tyre puncture, empty fuel tank, loss of keys, fire, or any breakdown not caused by vehicle maintenance or wear and tear, the hirer is obliged to pay for any damages. N/B: NO PART OF THE CAR SHALL BE REPLACED WITHOUT CONSENT FROM THE COMPANY.",
  "The hirer accepts responsibility to check oil and water levels and must fuel the vehicle with the correct fuel type. Failure to do so will result in the hirer paying for any resulting damages.",
  "Only the hirer or other drivers named in the contract with a valid driving licence are eligible to drive the vehicle. Any attempted transfer or sublease of the vehicle or its accessories is VOID.",
  "The hirer is responsible for all expenses through parking and traffic offences. Usage of the vehicle for illegal purposes such as ferrying narcotics, towing, or competitions is prohibited.",
  "The vehicle shall not be taken out of Kenya without written consent from PSK Safaris & Car Rentals.",
  "The hirer shall report any accident to the owner within 24 hours and to the police or proper authority within the time prescribed by law. The hirer is liable for all damages and injuries caused.",
  "The hirer should return the car on the specified date and time UNLESS the company is notified and authorises an extension. Otherwise legal action may be taken and KSH 500 per hour will be charged after the return time.",
  "The hirer is obliged to take care of the car as their own, including cleaning on return and securing personal belongings.",
  "By signing this contract the hirer agrees to all terms and conditions. Should there be any breaches, PSK Safaris & Car Rentals reserves the right to repossess the vehicle without any refund.",
]

/* ── Print/PDF document primitives — fixed A4 at 96dpi (794 × 1123 px) ── */
const PAGE: any = {
  width:'794px', height:'1123px', background:'#fff', position:'relative',
  overflow:'hidden', marginBottom:'26px', boxShadow:'0 6px 28px rgba(0,0,0,0.35)',
  printColorAdjust:'exact', WebkitPrintColorAdjust:'exact',
}
const SEC: any = {
  borderTop:'2px solid #1B4D5C', borderBottom:'1px solid #1B4D5C', padding:'4px 8px',
  fontSize:'10px', fontWeight:800, letterSpacing:'1.6px', textAlign:'center',
  color:'#1B4D5C', background:'#eef3f5', marginBottom:'8px',
  printColorAdjust:'exact', WebkitPrintColorAdjust:'exact',
}
const LBL: any = { fontSize:'9px', fontWeight:800, color:'#333', letterSpacing:'0.4px', width:'104px', flexShrink:0 }
const BOX: any = { width:'15px', height:'15px', border:'1.2px solid #555', margin:'0 auto', borderRadius:'2px' }

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', marginBottom:'5px', paddingBottom:'3px', borderBottom:'1px solid #999' }}>
      <div style={LBL}>{label}:</div>
      <div style={{ fontSize:'11.5px', fontWeight:700, color:'#111', flex:1, minHeight:'14px', lineHeight:'14px' }}>{value || ''}</div>
    </div>
  )
}

const ACCESSORIES = ['Floor Mats','Power Window','Jack & Jack Handles','Wheel Caps','Alloy Rims','Rearview Mirror','Safety Belts','Infotainment System','Speakers','Tool Kit (W. Spanner)','Door Handles','Head Lights','Rear Lights','Spare Wheel','Oil Level','ATF','P/Steering Fluid']

export default function RentalAgreements() {
  const navigate = useNavigate()
  const location = useLocation()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [bookings, setBookings]     = useState<any[]>([])
  const [clients, setClients]       = useState<any[]>([])
  const [vehicles, setVehicles]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [showAdd, setShowAdd]       = useState(false)
  const [selected, setSelected]     = useState<Agreement | null>(null)
  const [preview, setPreview]       = useState<Agreement | null>(null)
  const [editingA, setEditingA]     = useState(false)
  const [editAForm, setEditAForm]   = useState<any>({})
  const [editASaving, setEditASaving] = useState(false)

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

  function startEditAgreement(a: Agreement) {
    setEditAForm({ client_name:a.client_name||'', client_phone:a.client_phone||'', client_id_number:a.client_id_number||'', vehicle_reg:a.vehicle_reg||'', vehicle_make:a.vehicle_make||'', vehicle_model:a.vehicle_model||'', pickup_date:a.pickup_date||'', return_date:a.return_date||'', pickup_location:a.pickup_location||'', dropoff_location:a.dropoff_location||'', trip_type:a.trip_type||'', daily_rate:a.daily_rate||0, total_amount:a.total_amount||0, deposit_amount:a.deposit_amount||0, special_conditions:a.special_conditions||'' })
    setEditingA(true)
  }

  async function saveEditAgreement(id: string) {
    setEditASaving(true)
    const { error } = await supabase.from('rental_agreements').update(editAForm).eq('id', id)
    setEditASaving(false)
    if (!error) { setEditingA(false); loadAll() }
    else alert('Error: ' + error.message)
  }

  useEffect(() => {
    // Handle ?view=id from client screen
    const params = new URLSearchParams(window.location.search)
    const viewId = params.get('view')
    if (viewId) {
      supabase.from('rental_agreements').select('*').eq('id', viewId).single().then(({ data }) => {
        if (data) { setSelected(data); window.history.replaceState({}, '', '/rental-agreements') }
      })
    }
  }, [])

  useEffect(() => {
    loadAll().then(() => {
      // Check if navigated from booking with prefill params
      // Also handle state passed from Clients page
      const navState = (location.state || {}) as any
      if (navState.openAdd) {
        setForm(f => ({ ...f,
          client_name: navState.client_name || navState.clientName || '',
          client_phone: navState.client_phone || navState.clientPhone || '',
          client_id_number: navState.client_id_number || navState.clientIdNumber || '',
          vehicle_reg: navState.vehicle_reg || '',
          vehicle_make: navState.vehicle_make || '',
          vehicle_model: navState.vehicle_model || '',
          pickup_location: navState.pickup || '',
          dropoff_location: navState.dropoff || '',
          pickup_date: navState.pickup_date || '',
          return_date: navState.return_date || '',
          daily_rate: Number(navState.amount) || 0,
          total_amount: Number(navState.amount) || 0,
          trip_type: navState.trip_type || 'Chauffeured',
          branch: (navState.branch as any) || 'eldoret',
          booking_id: navState.booking_id || '',
        }))
        setShowAdd(true)
        navigate('/rental-agreements', { replace: true, state: null })
        return
      }
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

  const [pdfBusy, setPdfBusy] = useState(false)

  async function generatePDF(): Promise<Blob | null> {
    const root = document.getElementById('agreement-doc')
    if (!root) return null
    try {
      const pages = Array.from(root.querySelectorAll('.psk-page')) as HTMLElement[]
      if (!pages.length) return null
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      for (let i = 0; i < pages.length; i++) {
        // Each .psk-page is exactly one A4 sheet, so it maps 1:1 onto a PDF page.
        // No blind slicing -> no split rows, no overlapping content.
        const canvas = await html2canvas(pages[i], {
          scale: 2, useCORS: true, allowTaint: true,
          backgroundColor: '#ffffff', logging: false,
        })
        if (i > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, pageH)
      }
      return pdf.output('blob')
    } catch (err) {
      console.error('PDF error:', err)
      return null
    }
  }

  async function downloadPDF() {
    const doc = preview || selected
    if (!doc) return
    setPdfBusy(true)
    try {
      const blob = await generatePDF()
      if (!blob) { alert('Could not generate PDF. Please try again.'); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${doc.agreement_ref || 'PSK-Contract'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    } finally {
      setPdfBusy(false)
    }
  }

  async function shareWhatsApp() {
    const doc = preview || selected
    if (!doc) return
    await downloadPDF()
    await new Promise(r => setTimeout(r, 400))
    const phone = (doc.client_phone || '').replace(/\D/g, '')
    const msg = encodeURIComponent(`Dear ${doc.client_name},\n\nPlease find your Trip Contract from PSK Safaris & Car Rentals.\n\nRef: ${doc.agreement_ref}\nVehicle: ${doc.vehicle_reg}\nDate: ${doc.pickup_date ? new Date(doc.pickup_date).toLocaleDateString('en-GB') : ''}\n\nThe PDF has been downloaded — please check your downloads folder.\n\nThank you for choosing PSK Safaris.\nTel: +254 751 855 180`)
    setTimeout(() => window.open(`https://wa.me/${phone}?text=${msg}`, '_blank'), 1200)
  }

  async function shareEmail() {
    const doc = preview || selected
    if (!doc) return
    await downloadPDF()
    const subject = encodeURIComponent(`PSK Safaris — Trip Contract ${doc.agreement_ref}`)
    const body = encodeURIComponent(`Dear ${doc.client_name},\n\nPlease find attached your Trip Contract from PSK Safaris & Car Rentals.\n\nRef: ${doc.agreement_ref}\nVehicle: ${doc.vehicle_reg}\n\nThank you for choosing PSK Safaris.\nTel: +254 751 855 180`)
    setTimeout(() => window.open(`mailto:?subject=${subject}&body=${body}`, '_blank'), 1200)
  }

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
      <div onClick={()=>navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

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
                { label:'✏️ Edit', primary:false, onClick: ()=>startEditAgreement(selected!) },
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
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', background:'rgba(0,0,0,0.80)', backdropFilter:'blur(12px)', overflowY:'auto', overflowX:'auto', padding:'40px 20px' }}>
          <div style={{ width:'794px', maxWidth:'100%' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px', gap:'10px' }}>
              <button onClick={downloadPDF} disabled={pdfBusy}
                style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.22),rgba(255,149,0,0.14))', border:'1.5px solid rgba(255,215,0,0.45)', color:'rgba(255,215,0,0.98)', cursor:pdfBusy?'wait':'pointer', fontFamily:'inherit', opacity:pdfBusy?0.7:1 }}>
                {pdfBusy ? '⏳ Generating...' : '⬇ Download PDF'}
              </button>
              <button onClick={async () => {
                const root = document.getElementById('agreement-doc')
                if (!root) { alert('Document not ready'); return }
                // Clone and inline all computed styles so the new window renders identically
                const clone = root.cloneNode(true) as HTMLElement
                const srcEls = [root, ...Array.from(root.querySelectorAll('*'))]
                const dstEls = [clone, ...Array.from(clone.querySelectorAll('*'))]
                srcEls.forEach((src, i) => {
                  const computed = window.getComputedStyle(src as Element)
                  const target = dstEls[i] as HTMLElement
                  let styles = ''
                  for (let j = 0; j < computed.length; j++) {
                    const prop = computed[j]
                    styles += prop + ':' + computed.getPropertyValue(prop) + ';'
                  }
                  target.style.cssText = styles
                })
                // Absolute image URLs — relative paths break in a blank window
                Array.from(clone.querySelectorAll('img')).forEach(img => {
                  const im = img as HTMLImageElement
                  im.src = new URL(im.getAttribute('src') || '', window.location.origin).href
                })
                const win = window.open('', '_blank')
                if (!win) { alert('Allow popups to print'); return }
                win.document.write('<html><head><title>PSK Trip Contract</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.psk-page{width:794px!important;height:1123px!important;margin:0!important;box-shadow:none!important;border-radius:0!important;overflow:hidden!important;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}.psk-page:last-child{page-break-after:auto;break-after:auto}</style></head><body></body></html>')
                win.document.close()
                win.document.body.appendChild(clone)
                await new Promise(r => setTimeout(r, 800))
                win.focus()
                win.print()
                setTimeout(() => win.close(), 2000)
              }} disabled={pdfBusy}
                style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.70)', cursor:'pointer', fontFamily:'inherit' }}>
                🖨 Print
              </button>
              <button onClick={shareWhatsApp} disabled={pdfBusy}
                style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'rgba(37,211,102,0.12)', border:'1.5px solid rgba(37,211,102,0.35)', color:'rgba(37,211,102,0.95)', cursor:pdfBusy?'wait':'pointer', fontFamily:'inherit', opacity:pdfBusy?0.7:1 }}>
                📱 WhatsApp
              </button>
              <button onClick={shareEmail} disabled={pdfBusy}
                style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'rgba(100,181,246,0.10)', border:'1.5px solid rgba(100,181,246,0.30)', color:'rgba(100,181,246,0.92)', cursor:pdfBusy?'wait':'pointer', fontFamily:'inherit', opacity:pdfBusy?0.7:1 }}>
                ✉️ Email
              </button>
              <button onClick={() => setPreview(null)} style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.60)', cursor:'pointer', fontFamily:'inherit' }}>✕ Close</button>
            </div>

            {/* THE DOCUMENT — PSK Trip Contract, fixed 2 × A4 pages */}
            <div id="agreement-doc" style={{ fontFamily:'Arial, Helvetica, sans-serif', color:'#111', width:'794px', margin:'0 auto', fontSize:'12px' }}>

              {/* ═══════════════ PAGE 1 ═══════════════ */}
              <div className="psk-page" style={PAGE}>

                <div style={{ background:'#FF9500', height:'9px', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }} />

                {/* Header */}
                <div style={{ padding:'14px 24px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1.5px solid #bbb', gap:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <img src="/branding/psk-logo.png" alt="PSK" style={{ width:'96px', height:'96px', objectFit:'cover', borderRadius:'50%', flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:'21px', fontWeight:800, color:'#111', letterSpacing:'0.2px' }}>PSK SAFARIS &amp; CAR RENTALS</div>
                      <div style={{ fontSize:'11.5px', color:'#333', fontWeight:600, marginTop:'5px' }}>
                        {preview.branch === 'eldoret' ? 'Sixty Four Plaza, P.O. Box 5079 - 30100, Eldoret.' : '174 Pamba Road, Tom Mboya, Kisumu.'}
                      </div>
                      <div style={{ fontSize:'11.5px', color:'#333', fontWeight:600, marginTop:'3px' }}>
                        {preview.branch === 'eldoret' ? 'Tel: +254 751 855 180 | +254 741 186 538' : 'Tel: +254 741 186 538 | +254 740 355 180'}
                      </div>
                      <div style={{ fontSize:'11.5px', color:'#333', fontWeight:600, marginTop:'3px' }}>PIN No: P051664556P</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'21px', fontWeight:800, letterSpacing:'1.5px', color:'#111', borderBottom:'2.5px solid #FF9500', paddingBottom:'6px', marginBottom:'9px', whiteSpace:'nowrap', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>TRIP CONTRACT</div>
                    <div style={{ fontSize:'11.5px', color:'#333', fontWeight:600 }}>Ref: <strong style={{ color:'#111' }}>{preview.agreement_ref}</strong></div>
                    <div style={{ fontSize:'11.5px', color:'#333', fontWeight:600, marginTop:'3px' }}>Date: <strong style={{ color:'#111' }}>{new Date().toLocaleDateString('en-GB')}</strong></div>
                  </div>
                </div>

                {/* Two-column body */}
                <div style={{ display:'flex', alignItems:'stretch' }}>

                  {/* ── LEFT: client / vehicle / trip ── */}
                  <div style={{ width:'452px', flexShrink:0, padding:'12px 16px 12px 24px', borderRight:'1.5px solid #1B4D5C' }}>

                    <div style={SEC}>CLIENT INFORMATION</div>
                    <Field label="FULL NAME"        value={preview.client_name} />
                    <Field label="ID/PP. NO."       value={preview.client_id_number} />
                    <Field label="VALID DL"         value="Yes" />
                    <Field label="PHYSICAL ADDRESS" value="" />
                    <Field label="PHONE"            value={preview.client_phone} />
                    <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', marginBottom:'10px', paddingBottom:'16px', borderBottom:'1px solid #999' }}>
                      <div style={LBL}>SIGNATURE:</div>
                      <div style={{ flex:1 }} />
                    </div>

                    <div style={SEC}>VEHICLE INFORMATION</div>
                    <Field label="REG NO."  value={preview.vehicle_reg} />
                    <Field label="CAR MAKE" value={`${preview.vehicle_make || ''} ${preview.vehicle_model || ''}`.trim()} />
                    <Field label="COLOR"    value="" />

                    <div style={{ ...SEC, marginTop:'12px' }}>TRIP INFORMATION</div>
                    <Field label="PURPOSE OF HIRE"  value={preview.trip_type} />
                    <Field label="FROM"             value={preview.pickup_location} />
                    <Field label="TO"               value={preview.dropoff_location} />
                    <Field label="HIRE TYPE"        value={preview.trip_type} />
                    <Field label="START DATE/TIME"  value={preview.pickup_date ? new Date(preview.pickup_date).toLocaleDateString('en-GB') : ''} />
                    <Field label="RETURN DATE/TIME" value={preview.return_date ? new Date(preview.return_date).toLocaleDateString('en-GB') : ''} />
                    <Field label="NO OF DAYS"       value={preview.pickup_date && preview.return_date ? String(Math.max(1, Math.round((new Date(preview.return_date).getTime() - new Date(preview.pickup_date).getTime()) / 86400000))) : ''} />
                    <Field label="DAILY RATE"       value={preview.total_amount ? `KES ${Number(preview.total_amount).toLocaleString()}` : ''} />
                    <Field label="DEPOSIT PAID"     value={preview.deposit_amount ? `KES ${Number(preview.deposit_amount).toLocaleString()}` : ''} />
                    <Field label="MILEAGE (KM)"     value="" />
                  </div>

                  {/* ── RIGHT: accessories checklist ── */}
                  <div style={{ flex:1, padding:'12px 24px 12px 16px', minWidth:0 }}>

                    <div style={SEC}>VEHICLE ACCESSORIES CHECKLIST</div>

                    <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                      <thead>
                        <tr>
                          <th style={{ padding:'5px 3px', textAlign:'left', fontSize:'9.5px', fontWeight:800, color:'#1B4D5C', letterSpacing:'0.5px', borderBottom:'2px solid #1B4D5C' }}>ACCESSORY</th>
                          <th style={{ padding:'5px 3px', textAlign:'center', fontSize:'9px', fontWeight:800, color:'#1B4D5C', letterSpacing:'0.3px', borderBottom:'2px solid #1B4D5C', width:'68px' }}>DEPARTURE</th>
                          <th style={{ padding:'5px 3px', textAlign:'center', fontSize:'9px', fontWeight:800, color:'#1B4D5C', letterSpacing:'0.3px', borderBottom:'2px solid #1B4D5C', width:'68px' }}>ARRIVAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ACCESSORIES.map(item => (
                          <tr key={item}>
                            <td style={{ padding:'5px 3px', fontSize:'10.5px', fontWeight:700, color:'#111', borderBottom:'1px solid #999', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item}</td>
                            <td style={{ padding:'5px 3px', borderBottom:'1px solid #999', textAlign:'center' }}><div style={BOX} /></td>
                            <td style={{ padding:'5px 3px', borderBottom:'1px solid #999', textAlign:'center' }}><div style={BOX} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ ...LBL, width:'auto', marginTop:'16px', marginBottom:'6px' }}>ANY OTHER OBSERVATION ON THE CAR:</div>
                    <div style={{ borderBottom:'1px solid #999', height:'22px' }} />
                    <div style={{ borderBottom:'1px solid #999', height:'22px' }} />
                    <div style={{ borderBottom:'1px solid #999', height:'22px' }} />
                  </div>
                </div>

                {/* Page 1 footer — pinned to bottom of the A4 sheet */}
                <div style={{ position:'absolute', left:0, right:0, bottom:0 }}>
                  <div style={{ padding:'0 24px 14px' }}>
                    <div style={{ borderTop:'1.5px solid #1B4D5C', paddingTop:'12px', display:'grid', gridTemplateColumns:'1fr 1fr 140px', gap:'24px', alignItems:'flex-end' }}>
                      <div>
                        <div style={{ ...LBL, width:'auto', marginBottom:'22px' }}>CLIENT SIGNATURE:</div>
                        <div style={{ borderBottom:'1.5px solid #111', height:'1px' }} />
                        {preview.client_signed && <div style={{ fontSize:'10px', color:'#2D5F3F', fontStyle:'italic', marginTop:'3px' }}>✓ {preview.client_name}</div>}
                      </div>
                      <div>
                        <div style={{ ...LBL, width:'auto', marginBottom:'6px' }}>YOU WERE SERVED BY:</div>
                        <div style={{ fontSize:'11.5px', fontWeight:700, color:'#111', height:'16px' }}>{(preview as any).staff_name || 'PSK Staff'}</div>
                        <div style={{ borderBottom:'1.5px solid #111', height:'1px' }} />
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:'76px', height:'76px', borderRadius:'50%', border:'2px dashed #999', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:700, color:'#888', textAlign:'center', lineHeight:'1.3' }}>COMPANY<br />STAMP</div>
                        <div style={{ fontSize:'10px', fontWeight:700, color:'#333', marginTop:'5px' }}>Date: {new Date().toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:'9.5px', fontWeight:700, color:'#444', textAlign:'center', marginTop:'10px' }}>See full Terms &amp; Conditions on page 2 of this contract.</div>
                  </div>
                  <div style={{ background:'#FF9500', padding:'7px 20px', textAlign:'center', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>
                    <div style={{ fontSize:'11px', color:'#fff', fontWeight:700 }}>Easy car rentals · Self drive/chauffeur driven · Airport transfers · Safaris and excursion</div>
                  </div>
                </div>
              </div>

              {/* ═══════════════ PAGE 2 — T&Cs + signatures ═══════════════ */}
              <div className="psk-page" style={PAGE}>

                <div style={{ background:'#FF9500', height:'9px', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }} />

                <div style={{ padding:'20px 34px 0' }}>
                  <div style={{ textAlign:'center', marginBottom:'16px' }}>
                    <div style={{ fontSize:'20px', fontWeight:800, letterSpacing:'2px', color:'#111' }}>TERMS AND CONDITIONS</div>
                    <div style={{ fontSize:'11px', color:'#444', fontWeight:600, marginTop:'4px' }}>PSK Safaris &amp; Car Rentals — Vehicle Hire Agreement</div>
                    <div style={{ width:'70px', height:'3px', background:'#FF9500', margin:'9px auto 0', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }} />
                  </div>

                  {TERMS.map((term, i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'9px', paddingBottom:'8px', borderBottom: i < TERMS.length - 1 ? '1px solid #ddd' : 'none' }}>
                      <div style={{ fontSize:'12px', fontWeight:800, color:'#FF9500', minWidth:'19px', flexShrink:0, printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>{i + 1}.</div>
                      <div style={{ fontSize:'11.5px', color:'#111', lineHeight:'1.55', textAlign:'justify' }}>{term}</div>
                    </div>
                  ))}
                </div>

                {/* Page 2 footer — declaration + signatures pinned to bottom */}
                <div style={{ position:'absolute', left:0, right:0, bottom:0 }}>
                  <div style={{ padding:'0 34px 16px' }}>
                    <div style={{ border:'1.5px solid #FF9500', borderRadius:'4px', padding:'10px 14px', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>
                      <div style={{ fontSize:'10px', fontWeight:800, color:'#CC7700', letterSpacing:'1.2px', marginBottom:'5px' }}>DECLARATION</div>
                      <div style={{ fontSize:'11px', color:'#111', lineHeight:'1.5' }}>
                        I, the undersigned hirer, confirm that I have read, understood and agree to all the terms and conditions stated above. I acknowledge receipt of the vehicle in good condition as described.
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'44px', marginTop:'26px' }}>
                      <div>
                        <div style={{ ...LBL, width:'auto', marginBottom:'30px' }}>HIRER SIGNATURE &amp; DATE</div>
                        <div style={{ borderBottom:'1.5px solid #111', height:'1px' }} />
                        <div style={{ fontSize:'10.5px', color:'#333', fontWeight:600, marginTop:'4px' }}>{preview.client_name}</div>
                      </div>
                      <div>
                        <div style={{ ...LBL, width:'auto', marginBottom:'30px' }}>PSK AUTHORISED SIGNATURE &amp; DATE</div>
                        <div style={{ borderBottom:'1.5px solid #111', height:'1px' }} />
                        <div style={{ fontSize:'10.5px', color:'#333', fontWeight:600, marginTop:'4px' }}>For PSK Safaris &amp; Car Rentals</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background:'#FF9500', padding:'7px 20px', textAlign:'center', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>
                    <div style={{ fontSize:'11px', color:'#fff', fontWeight:700 }}>
                      PSK Safaris &amp; Car Rentals | {preview.branch === 'eldoret' ? 'Tel: +254 751 855 180' : 'Tel: +254 741 186 538'} | PIN: P051664556P
                    </div>
                  </div>
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
