import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;border:string}> = {
  available:    { label:'Available',    color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.28)' },
  chauffeured:  { label:'Out·Chauffeur',color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  safari:       { label:'Out·Safari',   color:'rgba(206,147,216,0.95)', bg:'rgba(206,147,216,0.08)', border:'rgba(206,147,216,0.25)' },
  'self-drive': { label:'Self-drive',   color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  service:      { label:'In Service',   color:'rgba(255,183,77,0.95)',  bg:'rgba(255,183,77,0.08)',  border:'rgba(255,183,77,0.25)'  },
  overdue:      { label:'Overdue',      color:'rgba(239,154,154,0.98)', bg:'rgba(239,154,154,0.09)', border:'rgba(239,154,154,0.32)' },
  grounded:     { label:'Grounded',     color:'rgba(150,150,150,0.85)', bg:'rgba(150,150,150,0.07)', border:'rgba(150,150,150,0.20)' },
}

function docDot(expiry?: string) {
  if (!expiry) return 'rgba(150,150,150,0.40)'
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0)   return 'rgba(239,154,154,0.95)'
  if (days <= 30) return 'rgba(239,154,154,0.95)'
  if (days <= 60) return 'rgba(255,183,77,0.95)'
  return 'rgba(129,199,132,0.95)'
}

function docLabel(expiry?: string) {
  if (!expiry) return '—'
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0)   return `Expired ${Math.abs(days)}d ago`
  if (days === 0) return 'Expires today!'
  if (days <= 30) return `${days}d left`
  return new Date(expiry).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
}

export default function PSKFleet({ defaultTab = 'vehicles' }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const [tab, setTab]             = useState(defaultTab)
  const [vehicles, setVehicles]   = useState<any[]>([])
  const [drivers, setDrivers]     = useState<any[]>([])
  const [services, setServices]   = useState<any[]>([])
  const [fuelLogs, setFuelLogs]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [selectedV, setSelectedV] = useState<any>(null)
  const [editingV, setEditingV] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [editSaving, setEditSaving] = useState(false)
  const [showSvc, setShowSvc]     = useState(false)
  const [showFuel, setShowFuel]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const receiptRef = useRef<HTMLInputElement>(null)
  const [selectedSvc, setSelectedSvc] = useState<any>(null)
  const [receiptPhoto, setReceiptPhoto] = useState('')

  const [svcForm, setSvcForm] = useState({ vehicle_id:'', service_type:'Routine', service_date: new Date().toISOString().split('T')[0], odometer_at_service:0, vendor:'', next_service_km:0, notes:'' })
  const [fuelForm, setFuelForm] = useState({ vehicle_id:'', driver_id:'', fuel_date: new Date().toISOString().split('T')[0], litres:0, amount_kes:0, odometer:0, station:'' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [v, d, s, f] = await Promise.all([
      supabase.from('vehicles').select('*').order('reg'),
      supabase.from('drivers').select('id, name').order('name'),
      supabase.from('maintenance_logs').select('*').order('service_date', { ascending: false }),
      supabase.from('fuel_logs').select('*').order('fuel_date', { ascending: false }),
    ])
    if (v.data) setVehicles(v.data)
    if (d.data) setDrivers(d.data)
    if (s.data) setServices(s.data)
    if (f.data) setFuelLogs(f.data)
    setLoading(false)
  }

  async function saveService() {
    if (!svcForm.vehicle_id || !svcForm.service_date) { alert('Select vehicle and date'); return }
    setSaving(true)
    const { error } = await supabase.from('maintenance_logs').insert([{
      vehicle_id: svcForm.vehicle_id,
      service_type: svcForm.service_type,
      service_date: svcForm.service_date,
      odometer_at_service: svcForm.odometer_at_service || null,
      vendor: svcForm.vendor || null,
      next_service_km: svcForm.next_service_km || null,
      notes: svcForm.notes || null,
      receipt_url: receiptPhoto || null,
    }])
    setSaving(false)
    if (!error) {
      setShowSvc(false)
      setReceiptPhoto('')
      setSvcForm({ vehicle_id:'', service_type:'Routine', service_date: new Date().toISOString().split('T')[0], odometer_at_service:0, vendor:'', next_service_km:0, notes:'' })
      loadAll()
    } else alert(error.message)
  }

  async function saveFuel() {
    if (!fuelForm.vehicle_id || !fuelForm.litres) { alert('Select vehicle and enter litres'); return }
    setSaving(true)
    const prevFuel = fuelLogs.filter(f => f.vehicle_id === fuelForm.vehicle_id).sort((a,b) => new Date(b.fuel_date).getTime() - new Date(a.fuel_date).getTime())
    const prevOdo = prevFuel[0]?.odometer || 0
    const kmDriven = fuelForm.odometer && prevOdo ? fuelForm.odometer - prevOdo : null
    const kesPer100km = kmDriven && kmDriven > 0 ? Math.round((fuelForm.amount_kes / kmDriven) * 100) : null
    const { error } = await supabase.from('fuel_logs').insert([{
      vehicle_id: fuelForm.vehicle_id,
      driver_id: fuelForm.driver_id || null,
      fuel_date: fuelForm.fuel_date,
      litres: fuelForm.litres,
      amount_kes: fuelForm.amount_kes,
      odometer: fuelForm.odometer || null,
      station: fuelForm.station || null,
      km_driven: kmDriven,
      kes_per_100km: kesPer100km,
      receipt_url: receiptPhoto || null,
    }])
    setSaving(false)
    if (!error) {
      setShowFuel(false)
      setReceiptPhoto('')
      setFuelForm({ vehicle_id:'', driver_id:'', fuel_date: new Date().toISOString().split('T')[0], litres:0, amount_kes:0, odometer:0, station:'' })
      loadAll()
    } else alert(error.message)
  }

  async function updateVehicleStatus(id: string, status: string) {
    await supabase.from('vehicles').update({ status }).eq('id', id)
    setSelectedV((v: any) => v ? {...v, status} : null)
    loadAll()
  }

  function startEditVehicle(v: any) {
    setEditForm({ reg:v.reg||'', make:v.make||'', model:v.model||'', year:v.year||new Date().getFullYear(), colour:v.colour||'', seats:v.seats||4, vehicle_class:v.vehicle_class||'', owner_name:v.owner_name||'', odometer:v.odometer||'', insurance_expiry:v.insurance_expiry||'', inspection_expiry:v.inspection_expiry||'', condition_notes:v.condition_notes||'' })
    setEditingV(true)
  }

  async function saveEditVehicle() {
    if (!selectedV) return
    setEditSaving(true)
    const { error } = await supabase.from('vehicles').update({
      reg: editForm.reg.toUpperCase().trim(), make: editForm.make, model: editForm.model,
      year: Number(editForm.year), colour: editForm.colour, seats: Number(editForm.seats),
      vehicle_class: editForm.vehicle_class, owner_name: editForm.owner_name || null,
      odometer: Number(editForm.odometer) || null,
      insurance_expiry: editForm.insurance_expiry || null,
      inspection_expiry: editForm.inspection_expiry || null,
      condition_notes: editForm.condition_notes || null,
    }).eq('id', selectedV.id)
    setEditSaving(false)
    if (!error) {
      setEditingV(false)
      setSelectedV((v:any) => ({...v, ...editForm, reg:editForm.reg.toUpperCase().trim()}))
      loadAll()
    } else alert('Error: ' + error.message)
  }

  const fld = (label: string, children: React.ReactNode) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>{label}</div>
      {children}
    </div>
  )
  const inp = (val: any, onChange: any, type='text', placeholder='') => (
    <input type={type} value={val} placeholder={placeholder} onChange={e => onChange(type==='number'?Number(e.target.value):e.target.value)}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )
  const sel = (val: any, onChange: any, opts: {value:string;label:string}[]) => (
    <select value={val} onChange={e=>onChange(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
      {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  // ── COMPLIANCE HELPERS ──
  const getComplianceRows = () => vehicles.map(v => ({
    v,
    docs: [
      { label:'Insurance',     expiry: v.insurance_expiry },
      { label:'NTSA Insp.',    expiry: v.inspection_expiry },
      { label:'Road licence',  expiry: v.road_licence_expiry },
      { label:'PSV licence',   expiry: v.psv_expiry },
    ]
  }))

  const totalFuelMonth = fuelLogs.filter(f => f.fuel_date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s,f) => s + (f.amount_kes||0), 0)
  const totalLitresMonth = fuelLogs.filter(f => f.fuel_date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s,f) => s + (f.litres||0), 0)
  const avgKes100 = fuelLogs.filter(f=>f.kes_per_100km).reduce((s,f,_,a) => s + f.kes_per_100km/a.length, 0)

  const TABS = [
    { id:'vehicles',   label:`Vehicles (${vehicles.length})` },
    { id:'maintenance',label:`Maintenance (${services.length})` },
    { id:'fuel',       label:`Fuel Log (${fuelLogs.length})` },
    { id:'compliance', label:'Compliance' },
  ]

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>window.history.back()} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:tab===t.id?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${tab===t.id?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:tab===t.id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'vehicles' && <button onClick={()=>navigate('/registry')} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Register vehicle</button>}
          {tab === 'maintenance' && <button onClick={()=>setShowSvc(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,183,77,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,183,77,0.32)', color:'rgba(255,183,77,0.95)', cursor:'pointer', fontFamily:'inherit' }}>🔧 Log service</button>}
          {tab === 'fuel' && <button onClick={()=>setShowFuel(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(100,181,246,0.16),rgba(27,77,92,0.09))', border:'1.5px solid rgba(100,181,246,0.32)', color:'rgba(100,181,246,0.95)', cursor:'pointer', fontFamily:'inherit' }}>⛽ Log fuel</button>}
          {tab === 'compliance' && <button onClick={()=>navigate('/reminders')} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>🔔 View reminders</button>}
        </div>
      </div>

      {/* ── TAB 1: VEHICLES ── */}
      {tab === 'vehicles' && (
        <div style={{ ...gl.panel, padding:'18px' }}>
          {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
          : vehicles.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px' }}>
              <div style={{ fontSize:'36px', marginBottom:'14px' }}>🚗</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No vehicles registered</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Register vehicles from the Registry Board</div>
              <button onClick={()=>navigate('/registry')} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Go to Registry Board →</button>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  {['Reg','Vehicle','Class','Status','Insurance','Inspection','Odometer','Actions'].map(h=>(
                    <th key={h} style={{ ...gl.label, padding:'0 10px 10px', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const sc = STATUS_CFG[v.status] || STATUS_CFG.available
                  return (
                    <tr key={v.id} onClick={()=>setSelectedV(v)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ padding:'11px 10px' }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{v.reg}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)', marginTop:'1px' }}>{v.branch==='eldoret'?'Eldoret':'Kisumu'}</div>
                      </td>
                      <td style={{ padding:'11px 10px' }}>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.80)' }}>{v.make} {v.model}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>{v.year} · {v.colour} · {v.seats} seats</div>
                      </td>
                      <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'11px', color:'rgba(255,215,0,0.65)' }}>{v.vehicle_class || '—'}</div></td>
                      <td style={{ padding:'11px 10px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 8px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}`, whiteSpace:'nowrap' }}>{sc.label}</span></td>
                      <td style={{ padding:'11px 10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:docDot(v.insurance_expiry), flexShrink:0 }} />
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.50)' }}>{docLabel(v.insurance_expiry)}</div>
                        </div>
                      </td>
                      <td style={{ padding:'11px 10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:docDot(v.inspection_expiry), flexShrink:0 }} />
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.50)' }}>{docLabel(v.inspection_expiry)}</div>
                        </div>
                      </td>
                      <td style={{ padding:'11px 10px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{v.odometer?v.odometer.toLocaleString()+' km':'—'}</div></td>
                      <td style={{ padding:'11px 10px' }}>
                        <div style={{ display:'flex', gap:'5px' }}>
                          <button onClick={e=>{e.stopPropagation();setSelectedV(v)}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                          <button onClick={e=>{e.stopPropagation();setSvcForm(f=>({...f,vehicle_id:v.id}));setShowSvc(true)}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,183,77,0.08)', border:'1px solid rgba(255,183,77,0.22)', color:'rgba(255,183,77,0.80)', cursor:'pointer', fontFamily:'inherit' }}>🔧</button>
                          <button onClick={e=>{e.stopPropagation();setFuelForm(f=>({...f,vehicle_id:v.id}));setShowFuel(true)}} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(100,181,246,0.08)', border:'1px solid rgba(100,181,246,0.22)', color:'rgba(100,181,246,0.80)', cursor:'pointer', fontFamily:'inherit' }}>⛽</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB 2: MAINTENANCE ── */}
      {tab === 'maintenance' && (
        <div style={{ ...gl.panel, padding:'18px' }}>
          {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
          : services.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px' }}>
              <div style={{ fontSize:'36px', marginBottom:'14px' }}>🔧</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No service records yet</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Log your first vehicle service to start tracking maintenance history</div>
              <button onClick={()=>setShowSvc(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,183,77,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,183,77,0.32)', color:'rgba(255,183,77,0.95)', cursor:'pointer', fontFamily:'inherit' }}>🔧 Log first service</button>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  {['Vehicle','Service Type','Date','Odometer','Vendor/Garage','Next Service','Notes','Receipt'].map(h=>(
                    <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(s => {
                  const v = vehicles.find(x=>x.id===s.vehicle_id)
                  return (
                    <tr key={s.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ padding:'11px 12px', cursor:'pointer' }} onClick={e=>{e.stopPropagation();if(v){setSelectedV(v);setTab('maintenance')}}}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.85)', textDecoration:'underline dotted' }}>{v?.reg || '—'}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{v?.make} {v?.model}</div>
                      </td>
                      <td style={{ padding:'11px 12px' }}>
                        <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', background:'rgba(255,183,77,0.09)', border:'1px solid rgba(255,183,77,0.25)', color:'rgba(255,183,77,0.95)' }}>{s.service_type}</span>
                      </td>
                      <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.60)' }}>{s.service_date ? new Date(s.service_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'}</div></td>
                      <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.50)' }}>{s.odometer_at_service ? s.odometer_at_service.toLocaleString()+' km' : '—'}</div></td>
                      <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.60)' }}>{s.vendor || '—'}</div></td>
                      <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,215,0,0.65)' }}>{s.next_service_km ? s.next_service_km.toLocaleString()+' km' : '—'}</div></td>
                      <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.notes || '—'}</div></td>
                      <td style={{ padding:'11px 12px' }}>
                        {s.receipt_url ? (
                          <button onClick={e=>{e.stopPropagation();setSelectedSvc(s)}}
                            style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', fontWeight:600, background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.28)', color:'rgba(100,181,246,0.90)', cursor:'pointer', fontFamily:'inherit' }}>
                            📎 View
                          </button>
                        ) : (
                          <button onClick={e=>{e.stopPropagation();setSelectedSvc(s)}}
                            style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', fontWeight:600, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontFamily:'inherit' }}>
                            + Add receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── RECEIPT VIEWER MODAL ── */}
      {selectedSvc && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.80)', backdropFilter:'blur(12px)' }}>
          <div style={{ background:'rgba(8,18,30,0.98)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'600px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.70)', padding:'24px' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>
                  🔧 {selectedSvc.service_type} — {vehicles.find((x:any)=>x.id===selectedSvc.vehicle_id)?.reg || ''}
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginTop:'3px' }}>
                  {selectedSvc.service_date ? new Date(selectedSvc.service_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : ''} · {selectedSvc.vendor || ''}
                </div>
              </div>
              <button onClick={()=>setSelectedSvc(null)} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.50)', cursor:'pointer', fontSize:'16px', fontFamily:'inherit' }}>✕</button>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px' }}>
              {/* Edit the vehicle itself */}
              {vehicles.find((x:any)=>x.id===selectedSvc.vehicle_id) && (
                <button onClick={()=>{
                  const v = vehicles.find((x:any)=>x.id===selectedSvc.vehicle_id)
                  setSelectedSvc(null)
                  setSelectedV(v)
                  setTimeout(()=>startEditVehicle(v), 100)
                }} style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,215,0,0.10)', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.90)', cursor:'pointer', fontFamily:'inherit' }}>
                  🚗 Edit Vehicle Details
                </button>
              )}
              <button onClick={()=>{
                const url = selectedSvc.receipt_url
                if (url.startsWith('data:')) {
                  // Convert base64 to blob URL so browser can open it
                  const arr = url.split(','), mime = arr[0].match(/:(.*?);/)?.[1]||'image/jpeg'
                  const bstr = atob(arr[1]), n = bstr.length, u8 = new Uint8Array(n)
                  for(let i=0;i<n;i++) u8[i]=bstr.charCodeAt(i)
                  const blob = new Blob([u8],{type:mime})
                  window.open(URL.createObjectURL(blob),'_blank')
                } else window.open(url,'_blank')
              }} style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>
                🔍 Open full size
              </button>
              <button onClick={()=>{
                const url = selectedSvc.receipt_url
                const ext = url.startsWith('data:application/pdf') ? 'pdf' : 'jpg'
                const a=document.createElement('a');a.href=url;a.download=`receipt-${selectedSvc.service_type}-${selectedSvc.service_date}.${ext}`;a.click()
              }}
                style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.28)', color:'rgba(100,181,246,0.90)', cursor:'pointer', fontFamily:'inherit' }}>
                ⬇ Download
              </button>
              <button onClick={()=>window.print()}
                style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.60)', cursor:'pointer', fontFamily:'inherit' }}>
                🖨 Print
              </button>
              <button onClick={()=>{
                const v=vehicles.find((x:any)=>x.id===selectedSvc.vehicle_id)
                const msg=`PSK Safaris — Service Receipt%0AVehicle: ${v?.reg||''}%0AService: ${selectedSvc.service_type}%0ADate: ${selectedSvc.service_date}%0AVendor: ${selectedSvc.vendor||''}%0APlease find the receipt attached.`
                window.open(`https://wa.me/?text=${msg}`,'_blank')
              }} style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', color:'rgba(37,211,102,0.90)', cursor:'pointer', fontFamily:'inherit' }}>
                📱 WhatsApp
              </button>
            </div>

            {/* Upload receipt if none exists */}
            {!selectedSvc.receipt_url && (
              <div style={{ textAlign:'center', padding:'24px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px dashed rgba(255,255,255,0.15)', marginBottom:'12px' }}>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'12px' }}>No receipt attached to this entry</div>
                <input type="file" accept="image/*,application/pdf" id="svc-receipt-upload" style={{ display:'none' }}
                  onChange={async e => {
                    if (!e.target.files?.[0]) return
                    const r = new FileReader()
                    r.onload = async ev => {
                      const url = ev.target?.result as string
                      await supabase.from('maintenance_logs').update({ receipt_url: url }).eq('id', selectedSvc.id)
                      setSelectedSvc({...selectedSvc, receipt_url: url})
                      loadAll()
                    }
                    r.readAsDataURL(e.target.files[0])
                  }} />
                <button onClick={()=>document.getElementById('svc-receipt-upload')?.click()}
                  style={{ padding:'9px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.28)', color:'rgba(100,181,246,0.90)', cursor:'pointer', fontFamily:'inherit' }}>
                  📁 Upload receipt now
                </button>
              </div>
            )}

            {/* Receipt image or PDF */}
            {selectedSvc.receipt_url && (
              selectedSvc.receipt_url.toLowerCase().includes('.pdf')
              ? <iframe src={selectedSvc.receipt_url} style={{ width:'100%', height:'500px', border:'none', borderRadius:'10px' }} />
              : <img src={selectedSvc.receipt_url} alt="Receipt" style={{ width:'100%', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.10)', cursor:'pointer' }} onClick={()=>{
              const url=selectedSvc.receipt_url
              if(url.startsWith('data:')){const arr=url.split(','),mime=arr[0].match(/:(.*?);/)?.[1]||'image/jpeg',bstr=atob(arr[1]),n=bstr.length,u8=new Uint8Array(n);for(let i=0;i<n;i++)u8[i]=bstr.charCodeAt(i);window.open(URL.createObjectURL(new Blob([u8],{type:mime})),'_blank')}else window.open(url,'_blank')
            }} />
            )}

            {/* Service details */}
            <div style={{ marginTop:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                ['Service type', selectedSvc.service_type],
                ['Date', selectedSvc.service_date ? new Date(selectedSvc.service_date).toLocaleDateString('en-GB') : '—'],
                ['Vendor/Garage', selectedSvc.vendor || '—'],
                ['Odometer', selectedSvc.odometer_at_service ? selectedSvc.odometer_at_service.toLocaleString()+' km' : '—'],
                ['Next service', selectedSvc.next_service_km ? selectedSvc.next_service_km.toLocaleString()+' km' : '—'],
                ['Notes', selectedSvc.notes || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>{label}</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.80)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: FUEL LOG ── */}
      {tab === 'fuel' && (
        <>
          {/* Summary strip */}
          {fuelLogs.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
              {[
                { label:'Fuel spend (this month)', value:`KES ${totalFuelMonth.toLocaleString()}`, color:'rgba(255,215,0,0.90)' },
                { label:'Litres (this month)',      value:`${totalLitresMonth.toFixed(1)} L`,         color:'rgba(100,181,246,0.90)' },
                { label:'Avg KES/100km',            value: avgKes100 > 0 ? `KES ${Math.round(avgKes100)}` : '—', color:'rgba(255,183,77,0.90)' },
                { label:'Total records',            value: String(fuelLogs.length),                   color:'rgba(129,199,132,0.90)' },
              ].map((s,i) => (
                <div key={i} style={{ ...gl.panel, padding:'14px 16px' }}>
                  <div style={{ fontSize:'9px', fontWeight:600, color:'rgba(255,255,255,0.30)', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:'6px' }}>{s.label}</div>
                  <div style={{ fontSize:'18px', fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ ...gl.panel, padding:'18px' }}>
            {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
            : fuelLogs.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px' }}>
                <div style={{ fontSize:'36px', marginBottom:'14px' }}>⛽</div>
                <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No fuel records yet</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Log every refuel to track consumption and detect anomalies</div>
                <button onClick={()=>setShowFuel(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(100,181,246,0.16),rgba(27,77,92,0.09))', border:'1.5px solid rgba(100,181,246,0.32)', color:'rgba(100,181,246,0.95)', cursor:'pointer', fontFamily:'inherit' }}>⛽ Log first refuel</button>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    {['Date','Vehicle','Driver','Litres','Amount (KES)','Odometer','KES/100km','Station'].map(h=>(
                      <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign: h.includes('KES')||h==='Litres'||h==='Odometer' ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map(f => {
                    const v = vehicles.find(x=>x.id===f.vehicle_id)
                    const d = drivers.find(x=>x.id===f.driver_id)
                    const anomaly = f.kes_per_100km && f.kes_per_100km > (avgKes100 * 1.4)
                    return (
                      <tr key={f.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background: anomaly ? 'rgba(231,76,60,0.04)' : 'transparent' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=anomaly?'rgba(231,76,60,0.07)':'rgba(255,255,255,0.03)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=anomaly?'rgba(231,76,60,0.04)':'transparent'}>
                        <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.60)' }}>{f.fuel_date ? new Date(f.fuel_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</div></td>
                        <td style={{ padding:'11px 12px' }}>
                          <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{v?.reg || '—'}</div>
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)' }}>{v?.make} {v?.model}</div>
                        </td>
                        <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{d?.name || '—'}</div></td>
                        <td style={{ padding:'11px 12px', textAlign:'right' }}><div style={{ fontSize:'12px', fontWeight:600, color:'rgba(100,181,246,0.85)' }}>{f.litres} L</div></td>
                        <td style={{ padding:'11px 12px', textAlign:'right' }}><div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.80)' }}>{f.amount_kes?.toLocaleString()}</div></td>
                        <td style={{ padding:'11px 12px', textAlign:'right' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.50)' }}>{f.odometer ? f.odometer.toLocaleString()+' km' : '—'}</div></td>
                        <td style={{ padding:'11px 12px', textAlign:'right' }}>
                          <div style={{ fontSize:'11px', fontWeight:600, color: anomaly ? 'rgba(239,154,154,0.95)' : 'rgba(255,255,255,0.55)' }}>
                            {f.kes_per_100km ? `KES ${Math.round(f.kes_per_100km)}` : '—'}
                            {anomaly && <span style={{ marginLeft:'4px', fontSize:'10px' }}>⚠️</span>}
                          </div>
                        </td>
                        <td style={{ padding:'11px 12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>{f.station || '—'}</div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── TAB 4: COMPLIANCE CALENDAR ── */}
      {tab === 'compliance' && (
        <div style={{ ...gl.panel, padding:'18px' }}>
          {/* Legend */}
          <div style={{ display:'flex', gap:'16px', marginBottom:'16px', flexWrap:'wrap' }}>
            {[
              { color:'rgba(129,199,132,0.95)', label:'Valid (>60 days)' },
              { color:'rgba(255,183,77,0.95)',  label:'Expiring (31-60 days)' },
              { color:'rgba(239,154,154,0.95)', label:'Expiring soon / Expired (≤30 days)' },
              { color:'rgba(150,150,150,0.40)', label:'Not set' },
            ].map((l,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:l.color, flexShrink:0 }} />
                <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.40)' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {vehicles.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px' }}>
              <div style={{ fontSize:'36px', marginBottom:'14px' }}>📅</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No vehicles registered</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)' }}>Register vehicles to track compliance</div>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  {['Vehicle','Branch','Insurance','NTSA Inspection','Road Licence','PSV Licence','Overall'].map(h=>(
                    <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getComplianceRows().map(({ v, docs }) => {
                  const colors = docs.map(d => docDot(d.expiry))
                  const worst = colors.includes('rgba(239,154,154,0.95)') ? 'rgba(239,154,154,0.95)' : colors.includes('rgba(255,183,77,0.95)') ? 'rgba(255,183,77,0.95)' : 'rgba(129,199,132,0.95)'
                  return (
                    <tr key={v.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ padding:'12px' }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.88)' }}>{v.reg}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{v.make} {v.model}</div>
                      </td>
                      <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{v.branch==='eldoret'?'Eldoret':'Kisumu'}</div></td>
                      {docs.map((d,i) => (
                        <td key={i} style={{ padding:'12px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:docDot(d.expiry), flexShrink:0 }} />
                            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.55)' }}>{docLabel(d.expiry)}</div>
                          </div>
                        </td>
                      ))}
                      <td style={{ padding:'12px' }}>
                        <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:worst }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div style={{ marginTop:'16px', padding:'12px 14px', background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'10px', fontSize:'11px', color:'rgba(255,215,0,0.60)' }}>
            💡 To update document expiry dates, edit the vehicle in the Registry Board. Documents expiring within 30 days automatically appear in Reminders.
          </div>
        </div>
      )}

      {/* ── VEHICLE DETAIL SLIDE-OVER ── */}
      {selectedV && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={()=>setSelectedV(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'440px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              <button onClick={()=>{setSelectedV(null);setEditingV(false)}} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit' }}>✕ Close</button>
              <button onClick={()=>startEditVehicle(selectedV)} style={{ background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.30)', borderRadius:'8px', padding:'6px 14px', color:'rgba(255,215,0,0.90)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', fontWeight:600 }}>✏️ Edit Vehicle</button>
            </div>
            {editingV && (
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,215,0,0.20)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'12px' }}>Edit Vehicle Details</div>
                {(['reg','make','model','year','colour','seats','vehicle_class','owner_name','odometer','insurance_expiry','inspection_expiry'] as const).map((key) => (
                  <div key={key} style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.40)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{key.replace(/_/g,' ')}</div>
                    <input value={editForm[key]} onChange={e=>setEditForm((f:any)=>({...f,[key]:e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', fontSize:'13px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.90)', outline:'none', fontFamily:'inherit' }} />
                  </div>
                ))}
                <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
                  <button onClick={saveEditVehicle} disabled={editSaving} style={{ flex:1, padding:'9px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>{editSaving?'Saving...':'Save Changes'}</button>
                  <button onClick={()=>setEditingV(false)} style={{ padding:'9px 16px', borderRadius:'9px', fontSize:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.40)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                </div>
              </div>
            )}

            <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:STATUS_CFG[selectedV.status]?.color, background:STATUS_CFG[selectedV.status]?.bg, border:`1px solid ${STATUS_CFG[selectedV.status]?.border}` }}>{STATUS_CFG[selectedV.status]?.label}</span>
            <div style={{ fontSize:'26px', fontWeight:800, color:'rgba(255,255,255,0.95)', margin:'12px 0 4px' }}>{selectedV.reg}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'20px' }}>{selectedV.year} {selectedV.make} {selectedV.model} · {selectedV.branch==='eldoret'?'Eldoret HQ':'Kisumu'}</div>

            {/* Change status */}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ ...gl.label, marginBottom:'8px' }}>Change status</div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {Object.entries(STATUS_CFG).map(([k,v]) => (
                  <button key={k} onClick={()=>updateVehicleStatus(selectedV.id, k)} style={{ padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:selectedV.status===k?v.bg:'rgba(255,255,255,0.04)', border:`1px solid ${selectedV.status===k?v.border:'rgba(255,255,255,0.09)'}`, color:selectedV.status===k?v.color:'rgba(255,255,255,0.35)' }}>{v.label}</button>
                ))}
              </div>
            </div>

            {/* Vehicle details */}
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              {[
                { label:'Vehicle class',   value: selectedV.vehicle_class || '—' },
                { label:'Colour',          value: selectedV.colour || '—' },
                { label:'Seats',           value: selectedV.seats ? `${selectedV.seats} seats` : '—' },
                { label:'Fuel type',       value: selectedV.fuel_type || '—' },
                { label:'Transmission',    value: selectedV.transmission || '—' },
                { label:'Odometer',        value: selectedV.odometer ? `${selectedV.odometer.toLocaleString()} km` : '—' },
                { label:'Owner',           value: selectedV.owner_name || '—', gold: true },
                { label:'Date joined PSK', value: selectedV.date_joined || '—' },
              ].map((r,i,arr) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color: (r as any).gold ? 'rgba(255,215,0,0.80)' : 'rgba(255,255,255,0.75)' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Document compliance */}
            <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
              <div style={{ ...gl.label, marginBottom:'12px' }}>Document Compliance</div>
              {[
                { label:'Insurance',     expiry: selectedV.insurance_expiry },
                { label:'NTSA Insp.',    expiry: selectedV.inspection_expiry },
                { label:'Road licence',  expiry: selectedV.road_licence_expiry },
                { label:'PSV licence',   expiry: selectedV.psv_expiry },
              ].map((d,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<3?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{d.label}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:docDot(d.expiry) }} />
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.65)' }}>{docLabel(d.expiry)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Service history for this vehicle */}
            <div style={{ marginBottom:'16px' }}>
              <div style={{ ...gl.label, marginBottom:'10px' }}>Service History ({services.filter(s=>s.vehicle_id===selectedV.id).length} records)</div>
              {services.filter(s=>s.vehicle_id===selectedV.id).slice(0,3).map((s,i) => (
                <div key={i} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'9px', marginBottom:'6px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,183,77,0.85)' }}>{s.service_type}</span>
                    <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{s.service_date ? new Date(s.service_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : ''}</span>
                  </div>
                  {s.vendor && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.40)', marginTop:'2px' }}>{s.vendor} · {s.odometer_at_service?.toLocaleString()} km</div>}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={()=>{setSvcForm(f=>({...f,vehicle_id:selectedV.id}));setShowSvc(true)}} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,183,77,0.10)', border:'1px solid rgba(255,183,77,0.28)', color:'rgba(255,183,77,0.90)' }}>🔧 Log service</button>
              <button onClick={()=>{setFuelForm(f=>({...f,vehicle_id:selectedV.id}));setShowFuel(true)}} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)' }}>⛽ Log fuel</button>
              <button onClick={()=>navigate('/bookings',{state:{openAdd:true,vehicleId:selectedV.id}})} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'linear-gradient(135deg,rgba(255,215,0,0.14),rgba(255,149,0,0.08))', border:'1px solid rgba(255,215,0,0.28)', color:'rgba(255,215,0,0.90)' }}>+ New booking</button>
              <div style={{ width:'100%', padding:'10px 12px', background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'9px', fontSize:'10px', color:'rgba(255,215,0,0.55)', marginTop:'4px' }}>
                🔒 Financial data for this vehicle lives in Finance → P&L by vehicle
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LOG SERVICE MODAL ── */}
      {showSvc && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'500px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'20px 26px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>🔧 Log Service</div>
              <button onClick={()=>setShowSvc(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'22px 26px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Vehicle *', sel(svcForm.vehicle_id, (v:string)=>setSvcForm(f=>({...f,vehicle_id:v})), [{value:'',label:'Select vehicle...'}, ...vehicles.map(v=>({value:v.id,label:`${v.reg} — ${v.make} ${v.model}`}))]))}
                {fld('Service type', sel(svcForm.service_type, (v:string)=>setSvcForm(f=>({...f,service_type:v})), ['Routine','Tyres','Repair','Inspection','Oil change','Brakes','Electrical','Other'].map(x=>({value:x,label:x}))))}
                {fld('Service date', inp(svcForm.service_date, (v:string)=>setSvcForm(f=>({...f,service_date:v})), 'date'))}
                {fld('Odometer at service (km)', inp(svcForm.odometer_at_service, (v:number)=>setSvcForm(f=>({...f,odometer_at_service:v})), 'number', '0'))}
                {fld('Vendor / Garage', inp(svcForm.vendor, (v:string)=>setSvcForm(f=>({...f,vendor:v})), 'text', 'e.g. Toyota Kenya'))}
                {fld('Next service at (km)', inp(svcForm.next_service_km, (v:number)=>setSvcForm(f=>({...f,next_service_km:v})), 'number', '0'))}
              </div>
              {fld('Notes', <textarea value={svcForm.notes} onChange={e=>setSvcForm(f=>({...f,notes:e.target.value}))} placeholder="Work done, parts replaced..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'60px', resize:'none' }} />)}

              {/* Receipt upload */}
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'8px', textTransform:'uppercase' }}>Receipt (optional)</div>
                <input type="file" accept="image/*,application/pdf" ref={receiptRef} onChange={e=>{ if(e.target.files?.[0]) { const r=new FileReader(); r.onload=ev=>setReceiptPhoto(ev.target?.result as string); r.readAsDataURL(e.target.files![0]) }}} style={{ display:'none' }} />
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <button type="button" onClick={()=>receiptRef.current?.click()} style={{ padding:'7px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' }}>📁 Upload receipt</button>
                  {receiptPhoto && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.90)' }}>✓ Receipt attached</span>}
                </div>
              </div>

              <div style={{ padding:'10px 12px', background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'9px', fontSize:'10px', color:'rgba(255,215,0,0.55)', marginBottom:'16px' }}>
                💡 Service cost goes to Finance → Expenses. Log it there to include in P&L calculations.
              </div>

              <div style={{ display:'flex', gap:'10px' }}>
                <button onClick={()=>setShowSvc(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveService} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,183,77,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,183,77,0.38)', color:'rgba(255,183,77,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Service Record'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LOG FUEL MODAL ── */}
      {showFuel && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'500px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.65)' }}>
            <div style={{ padding:'20px 26px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>⛽ Log Fuel</div>
              <button onClick={()=>setShowFuel(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'22px 26px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Vehicle *', sel(fuelForm.vehicle_id, (v:string)=>setFuelForm(f=>({...f,vehicle_id:v})), [{value:'',label:'Select vehicle...'}, ...vehicles.map(v=>({value:v.id,label:`${v.reg} — ${v.make} ${v.model}`}))]))}
                {fld('Driver (optional)', sel(fuelForm.driver_id, (v:string)=>setFuelForm(f=>({...f,driver_id:v})), [{value:'',label:'No driver'}, ...drivers.map(d=>({value:d.id,label:d.name}))]))}
                {fld('Date', inp(fuelForm.fuel_date, (v:string)=>setFuelForm(f=>({...f,fuel_date:v})), 'date'))}
                {fld('Petrol station', inp(fuelForm.station, (v:string)=>setFuelForm(f=>({...f,station:v})), 'text', 'e.g. Shell Eldoret'))}
                {fld('Litres *', inp(fuelForm.litres, (v:number)=>setFuelForm(f=>({...f,litres:v})), 'number', '0'))}
                {fld('Amount (KES) *', inp(fuelForm.amount_kes, (v:number)=>setFuelForm(f=>({...f,amount_kes:v})), 'number', '0'))}
                {fld('Odometer reading (km)', inp(fuelForm.odometer, (v:number)=>setFuelForm(f=>({...f,odometer:v})), 'number', '0'))}
              </div>

              {fuelForm.litres > 0 && fuelForm.amount_kes > 0 && (
                <div style={{ padding:'10px 14px', background:'rgba(100,181,246,0.06)', border:'1px solid rgba(100,181,246,0.18)', borderRadius:'9px', fontSize:'11px', color:'rgba(100,181,246,0.80)', marginBottom:'14px' }}>
                  KES per litre: <strong>{(fuelForm.amount_kes / fuelForm.litres).toFixed(2)}</strong>
                </div>
              )}

              {/* Receipt */}
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'8px', textTransform:'uppercase' }}>Receipt (optional)</div>
                <input type="file" accept="image/*,application/pdf" ref={receiptRef} onChange={e=>{ if(e.target.files?.[0]) { const r=new FileReader(); r.onload=ev=>setReceiptPhoto(ev.target?.result as string); r.readAsDataURL(e.target.files![0]) }}} style={{ display:'none' }} />
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <button type="button" onClick={()=>receiptRef.current?.click()} style={{ padding:'7px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' }}>📁 Upload receipt</button>
                  {receiptPhoto && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.90)' }}>✓ Receipt attached</span>}
                </div>
              </div>

              <div style={{ display:'flex', gap:'10px' }}>
                <button onClick={()=>setShowFuel(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveFuel} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(100,181,246,0.18),rgba(27,77,92,0.10))', border:'1.5px solid rgba(100,181,246,0.38)', color:'rgba(100,181,246,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Fuel Record'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
