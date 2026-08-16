import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type VehicleStatus = 'available' | 'chauffeured' | 'safari' | 'self-drive' | 'service' | 'overdue' | 'grounded'

interface Vehicle {
  id: string
  reg: string
  make: string
  model: string
  year: number
  colour: string
  seats: number
  vehicle_class: string
  status: VehicleStatus
  branch: 'eldoret' | 'kisumu'
  owner_name?: string
  odometer?: number
  insurance_expiry?: string
  inspection_expiry?: string
  condition_notes?: string
  created_at: string
}

const STATUS: Record<VehicleStatus, { label: string; color: string; bg: string; border: string }> = {
  available:    { label: 'Available',       color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.28)' },
  chauffeured:  { label: 'Out · Chauffeur', color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.25)' },
  safari:       { label: 'Out · Safari',    color: 'rgba(206,147,216,0.95)', bg: 'rgba(206,147,216,0.08)', border: 'rgba(206,147,216,0.25)' },
  'self-drive': { label: 'Self-drive',      color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.25)' },
  service:      { label: 'In Service',      color: 'rgba(255,183,77,0.95)',  bg: 'rgba(255,183,77,0.08)',  border: 'rgba(255,183,77,0.25)'  },
  overdue:      { label: 'Overdue',         color: 'rgba(239,154,154,0.98)', bg: 'rgba(239,154,154,0.09)', border: 'rgba(239,154,154,0.32)' },
  grounded:     { label: 'Grounded',        color: 'rgba(150,150,150,0.85)', bg: 'rgba(150,150,150,0.07)', border: 'rgba(150,150,150,0.20)' },
}

const gl = {
  panel: { background: 'rgba(10,22,34,0.70)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: '14px', backdropFilter: 'blur(14px)', boxShadow: '0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize: '9px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.32)' },
}

const CLASSES = ['Saloon Car','SUV','Rav 4','Noah','Prado','Land Cruiser','Land Cruiser V8','Pickup Truck','Station Wagon','Van 11-seater','Van 14-seater','Minibus 25-seater','Coaster 32-seater','Bus']

export default function RegistryBoard() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | VehicleStatus>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [form, setForm] = useState({
    reg: '', make: '', model: '', year: new Date().getFullYear(), colour: '',
    seats: 4, vehicle_class: 'Prado', branch: 'eldoret' as 'eldoret'|'kisumu',
    owner_name: '', date_joined: '', insurance_expiry: '',
    inspection_expiry: '', road_licence_expiry: '', odometer: 0, condition_notes: ''
  })

  useEffect(() => { loadVehicles() }, [])

  async function loadVehicles() {
    setLoading(true)
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (!error && data) setVehicles(data as Vehicle[])
    setLoading(false)
  }

  async function saveVehicle() {
    if (!form.reg || !form.make || !form.model) return
    setSaving(true)
    const { error } = await supabase.from('vehicles').insert([{
      reg: form.reg.toUpperCase().trim(),
      make: form.make, model: form.model, year: form.year,
      colour: form.colour, seats: form.seats,
      vehicle_class: form.vehicle_class, branch: form.branch,
      owner_name: form.owner_name || null,
      odometer: form.odometer || null,
      insurance_expiry: form.insurance_expiry || null,
      inspection_expiry: form.inspection_expiry || null,
      condition_notes: form.condition_notes || null,
      status: 'available'
    }])
    setSaving(false)
    if (!error) {
      setShowAdd(false)
      setEditingId(null)
      setForm({ reg:'',make:'',model:'',year:new Date().getFullYear(),colour:'',seats:4,vehicle_class:'Prado',branch:'eldoret',owner_name:'',date_joined:'',insurance_expiry:'',inspection_expiry:'',road_licence_expiry:'',odometer:0,condition_notes:'' })
      loadVehicles()
    } else {
      alert('Error: ' + error.message)
    }
  }

  function startEdit(v: Vehicle) {
    setForm({
      reg: v.reg || '', make: v.make || '', model: v.model || '',
      year: v.year || new Date().getFullYear(), colour: v.colour || '',
      seats: v.seats || 4, vehicle_class: v.vehicle_class || 'Prado',
      branch: (v.branch as 'eldoret'|'kisumu') || 'eldoret',
      owner_name: v.owner_name || '', date_joined: '',
      insurance_expiry: v.insurance_expiry || '',
      inspection_expiry: v.inspection_expiry || '',
      road_licence_expiry: v.road_licence_expiry || '',
      odometer: v.odometer || 0,
      condition_notes: v.condition_notes || ''
    })
    setEditingId(v.id)
    setShowAdd(true)
    setSelected(null)
  }

  async function saveVehicleEdit() {
    if (!editingId || !form.reg || !form.make || !form.model) return
    setSaving(true)
    const { error } = await supabase.from('vehicles').update({
      reg: form.reg.toUpperCase().trim(),
      make: form.make, model: form.model, year: form.year,
      colour: form.colour, seats: form.seats,
      vehicle_class: form.vehicle_class, branch: form.branch,
      owner_name: form.owner_name || null,
      odometer: form.odometer || null,
      insurance_expiry: form.insurance_expiry || null,
      inspection_expiry: form.inspection_expiry || null,
      condition_notes: form.condition_notes || null,
    }).eq('id', editingId)
    setSaving(false)
    if (!error) {
      setShowAdd(false); setEditingId(null)
      setForm({ reg:'',make:'',model:'',year:new Date().getFullYear(),colour:'',seats:4,vehicle_class:'Prado',branch:'eldoret',owner_name:'',date_joined:'',insurance_expiry:'',inspection_expiry:'',road_licence_expiry:'',odometer:0,condition_notes:'' })
      loadVehicles()
    } else alert('Error: ' + error.message)
  }

  const filtered = vehicles.filter(v => {
    const mf = filter === 'all' || v.status === filter
    const ms = !search || v.reg.toLowerCase().includes(search.toLowerCase()) || v.make.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  const total     = vehicles.length
  const available = vehicles.filter(v => v.status === 'available').length
  const outOnHire = vehicles.filter(v => ['chauffeured','safari','self-drive'].includes(v.status)).length
  const inService = vehicles.filter(v => v.status === 'service').length
  const attention = vehicles.filter(v => ['overdue','grounded'].includes(v.status)).length
  const eldoret   = vehicles.filter(v => v.branch === 'eldoret').length
  const kisumu    = vehicles.filter(v => v.branch === 'kisumu').length

  const F = (label: string, key: keyof typeof form, type = 'text', opts?: string[]) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
      {opts ? (
        <select value={form[key] as string} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
          style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
          {opts.map(o => <option key={o} value={o.toLowerCase().includes('eldoret') ? 'eldoret' : o.toLowerCase().includes('kisumu') ? 'kisumu' : o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key] as string|number} onChange={e => setForm(f => ({...f, [key]: type==='number' ? Number(e.target.value) : e.target.value}))}
          style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
      )}
    </div>
  )

  return (
    <div style={{ padding: '24px 28px 28px' }}>
      <div onClick={()=>navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

      {/* STATUS STRIP */}
      <div style={{ ...gl.panel, display:'flex', marginBottom:'18px', overflow:'hidden' }}>
        {[
          { label:'Total Fleet',     value: loading ? '...' : total,     sub: `Eldoret ${eldoret} · Kisumu ${kisumu}`, color:'rgba(255,255,255,0.88)' },
          { label:'Available',       value: loading ? '...' : available, sub:'Ready for booking',                      color:'rgba(129,199,132,0.95)' },
          { label:'Out on Hire',     value: loading ? '...' : outOnHire, sub:'Chauffeur · Safari · Self-drive',        color:'rgba(100,181,246,0.95)' },
          { label:'In Service',      value: loading ? '...' : inService, sub:'At workshop',                            color:'rgba(255,183,77,0.95)'  },
          { label:'Attention Needed',value: loading ? '...' : attention, sub:'Overdue or grounded',                    color:'rgba(239,154,154,0.95)' },
        ].map((s, i, arr) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'18px 12px', textAlign:'center', borderRight: i<arr.length-1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
            <div style={gl.label}>{s.label}</div>
            <div style={{ fontSize:'28px', fontWeight:800, color:s.color, lineHeight:1, margin:'8px 0 5px', letterSpacing:'-1px' }}>{s.value}</div>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:'16px', marginBottom:'18px' }}>
        <div style={{ ...gl.panel, padding:'18px' }}>
          <div style={{ ...gl.label, marginBottom:'14px' }}>Needs Action</div>
          {[
            { label:'Overdue returns',          count: attention, c:'rgba(239,154,154,0.95)', bg:'rgba(231,76,60,0.10)',  b:'rgba(231,76,60,0.22)'  },
            { label:'Vehicles in service',      count: inService, c:'rgba(255,183,77,0.95)',  bg:'rgba(255,149,0,0.08)',  b:'rgba(255,149,0,0.20)'  },
            { label:'Documents expiring (30d)', count: 0,         c:'rgba(255,183,77,0.95)',  bg:'rgba(255,149,0,0.08)',  b:'rgba(255,149,0,0.20)'  },
            { label:'Deposits outstanding',     count: 0,         c:'rgba(255,183,77,0.95)',  bg:'rgba(255,149,0,0.08)',  b:'rgba(255,149,0,0.20)'  },
            { label:'Vehicles idle 7+ days',    count: 0,         c:'rgba(150,150,150,0.85)', bg:'rgba(150,150,150,0.07)',b:'rgba(150,150,150,0.18)' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:'9px', background:item.bg, border:`1px solid ${item.b}`, marginBottom:'7px', cursor:'pointer' }}>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>{item.label}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'14px', fontWeight:700, color:item.c }}>{item.count}</span>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>›</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ ...gl.panel, padding:'18px', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
              <div style={gl.label}>Returning Today</div>
              <div style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background:'rgba(128,222,234,0.12)', border:'1px solid rgba(128,222,234,0.25)', color:'rgba(128,222,234,0.95)' }}>0</div>
            </div>
            <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.25)', fontSize:'12px' }}>No vehicles returning today</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
            {[{ label:'Bookings today',value:'0' },{ label:'Pickups today',value:'0' },{ label:'Fleet util.',value: total > 0 ? Math.round((outOnHire/total)*100)+'%' : '0%' }].map((s,i) => (
              <div key={i} style={{ ...gl.panel, padding:'14px', textAlign:'center' }}>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)', marginBottom:'6px' }}>{s.label}</div>
                <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,215,0,0.88)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FLEET TABLE */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', gap:'12px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <div style={gl.label}>Fleet Inventory</div>
            {(['all','available','chauffeured','service','overdue'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'4px 11px', borderRadius:'20px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: filter===f ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${filter===f ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.10)'}`, color: filter===f ? 'rgba(255,215,0,0.90)' : 'rgba(255,255,255,0.40)' }}>
                {f === 'all' ? `All (${total})` : STATUS[f as VehicleStatus]?.label || f}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reg, model..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'200px' }} />
            <button onClick={() => setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add vehicle</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading fleet...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>🚗</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>{vehicles.length === 0 ? 'No vehicles registered yet' : 'No vehicles match your search'}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>{vehicles.length === 0 ? 'Add your first vehicle to get started' : 'Try a different search'}</div>
            {vehicles.length === 0 && <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first vehicle</button>}
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Registration','Vehicle','Status','Branch','Owner','Odometer','Action'].map(h => (
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const sc = STATUS[v.status]
                return (
                  <tr key={v.id} onClick={() => setSelected(v)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', transition:'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{v.reg}</div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.82)' }}>{v.make} {v.model}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)', marginTop:'2px' }}>{v.year} · {v.seats} seats · {v.vehicle_class}</div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{sc.label}</span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{v.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.65)' }}>{v.owner_name || '—'}</div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{v.odometer ? v.odometer.toLocaleString()+' km' : '—'}</div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <button onClick={e => { e.stopPropagation(); setSelected(v) }} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'11px', fontWeight:500, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VEHICLE PASSPORT */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'420px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', boxShadow:'-12px 0 60px rgba(0,0,0,0.5)', overflowY:'auto', zIndex:1 }}>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
                <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit' }}>✕ Close</button>
                <button onClick={() => startEdit(selected!)} style={{ background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.30)', borderRadius:'8px', padding:'6px 14px', color:'rgba(255,215,0,0.90)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', fontWeight:600 }}>✏️ Edit Vehicle</button>
              </div>
              <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:STATUS[selected.status].color, background:STATUS[selected.status].bg, border:`1px solid ${STATUS[selected.status].border}` }}>{STATUS[selected.status].label}</span>
              <div style={{ fontSize:'26px', fontWeight:800, color:'rgba(255,255,255,0.95)', margin:'12px 0 4px', letterSpacing:'-0.5px' }}>{selected.reg}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.year} {selected.make} {selected.model} · {selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div>
              <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
                {[
                  { label:'Vehicle class',   value: selected.vehicle_class || '—' },
                  { label:'Colour',          value: selected.colour || '—' },
                  { label:'Seats',           value: selected.seats ? `${selected.seats} seats` : '—' },
                  { label:'Odometer',        value: selected.odometer ? `${selected.odometer.toLocaleString()} km` : '—' },
                  { label:'Insurance exp.',  value: selected.insurance_expiry || '—' },
                  { label:'NTSA inspection', value: selected.inspection_expiry || '—' },
                  { label:'Vehicle owner',   value: selected.owner_name || '—', gold: true },
                ].map((row, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom: i<6 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color: (row as any).gold ? 'rgba(255,215,0,0.80)' : 'rgba(255,255,255,0.78)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', borderRadius:'10px', padding:'12px 14px', marginBottom:'20px', fontSize:'11px', color:'rgba(255,215,0,0.65)' }}>
                🔒 Financial data for this vehicle lives in Finance → P&L by vehicle
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[{ label:'+ New booking', primary:true },{ label:'Log service',primary:false },{ label:'Add note',primary:false }].map((btn,i) => (
                  <button key={i} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: btn.primary ? 'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))' : 'rgba(255,255,255,0.06)', border:`1px solid ${btn.primary ? 'rgba(255,215,0,0.32)' : 'rgba(255,255,255,0.12)'}`, color: btn.primary ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.60)' }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.60)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'540px', maxHeight:'88vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.60)' }}>
            <div style={{ padding:'22px 26px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Register New Vehicle</div>
              <button onClick={() => setShowAdd(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'22px 26px' }}>
              <div style={{ ...gl.label, marginBottom:'12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Vehicle Identity</div>
              {F('Registration / Plate number *','reg')}
              {F('Make *','make')}
              {F('Model *','model')}
              {F('Year *','year','number')}
              {F('Colour','colour')}
              {F('Seating capacity','seats','number')}
              <div style={{ ...gl.label, margin:'20px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Classification</div>
              {F('Vehicle class (for ratecard)','vehicle_class','text',CLASSES)}
              {F('Branch','branch','text',['Eldoret HQ','Kisumu Branch'])}
              <div style={{ ...gl.label, margin:'20px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Ownership</div>
              {F('Vehicle Owner name','owner_name')}
              <div style={{ ...gl.label, margin:'20px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Documents</div>
              {F('Insurance expiry date','insurance_expiry','date')}
              {F('NTSA inspection expiry','inspection_expiry','date')}
              <div style={{ ...gl.label, margin:'20px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Condition</div>
              {F('Odometer at registration (km)','odometer','number')}
              <div style={{ marginBottom:'14px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'6px', textTransform:'uppercase' }}>Condition notes</div>
                <textarea value={form.condition_notes} onChange={e => setForm(f=>({...f,condition_notes:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'72px', resize:'none' }} />
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={editingId ? saveVehicleEdit : saveVehicle} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
