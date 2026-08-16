import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Reminder {
  id: string
  branch?: string
  type: string
  category: 'overdue' | 'expiring' | 'payment' | 'service' | 'manual' | 'idle'
  priority: 'red' | 'amber' | 'grey'
  title: string
  detail?: string
  due_date?: string
  entity_type?: string
  entity_id?: string
  resolved: boolean
  created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const PRIORITY_BORDER: Record<string,string> = {
  red:   'rgba(231,76,60,0.60)',
  amber: 'rgba(255,149,0,0.50)',
  grey:  'rgba(150,150,150,0.30)',
}
const PRIORITY_BG: Record<string,string> = {
  red:   'rgba(231,76,60,0.06)',
  amber: 'rgba(255,149,0,0.05)',
  grey:  'rgba(150,150,150,0.04)',
}
const PRIORITY_LABEL: Record<string,{color:string;label:string}> = {
  red:   { color:'rgba(239,154,154,0.95)', label:'URGENT' },
  amber: { color:'rgba(255,183,77,0.95)',  label:'ACTION NEEDED' },
  grey:  { color:'rgba(150,150,150,0.70)', label:'INFO' },
}

const CATEGORY_ICONS: Record<string,string> = {
  overdue: '🔴', expiring: '⏰', payment: '💳', service: '🔧', manual: '📝', idle: '😴'
}

type FilterType = 'all' | 'red' | 'amber' | 'overdue' | 'expiring' | 'payment' | 'service' | 'manual'

export default function Reminders() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<FilterType>('all')
  const [showAdd, setShowAdd]     = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [form, setForm] = useState({
    branch: 'eldoret', priority: 'amber', category: 'manual',
    title: '', detail: '', due_date: ''
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('resolved', showResolved)
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true })
    if (data) setReminders(data as Reminder[])
    setLoading(false)
  }, [showResolved])

  useEffect(() => { load(); generateAutoReminders() }, [load])

  // Auto-generate reminders from live data
  async function generateAutoReminders() {
    const today = new Date()
    const in30  = new Date(today); in30.setDate(in30.getDate() + 30)
    const todayStr = today.toISOString().split('T')[0]
    const in30Str  = in30.toISOString().split('T')[0]

    // Check overdue bookings
    const { data: overdue } = await supabase
      .from('bookings')
      .select('id, booking_ref, return_date')
      .eq('status', 'confirmed')
      .lt('return_date', new Date().toISOString())

    // Check vehicle docs expiring
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, reg, make, model, insurance_expiry, inspection_expiry')

    // Check driver docs expiring
    const { data: drivers } = await supabase
      .from('drivers')
      .select('id, name, licence_expiry, psv_expiry, good_conduct_expiry')

    const toCreate: any[] = []

    // Overdue bookings
    if (overdue) {
      for (const b of overdue) {
        const exists = await supabase.from('reminders').select('id').eq('entity_id', b.id).eq('category', 'overdue').eq('resolved', false).single()
        if (!exists.data) {
          const daysLate = Math.floor((today.getTime() - new Date(b.return_date).getTime()) / 86400000)
          toCreate.push({
            type: 'Overdue return', category: 'overdue', priority: 'red',
            title: `Overdue vehicle return — ${b.booking_ref}`,
            detail: `Vehicle was due back ${daysLate} day${daysLate > 1 ? 's' : ''} ago`,
            due_date: b.return_date?.split('T')[0],
            entity_type: 'booking', entity_id: b.id, resolved: false,
          })
        }
      }
    }

    // Vehicle document expiry
    if (vehicles) {
      for (const v of vehicles) {
        const checks = [
          { field: v.insurance_expiry, label: 'Insurance', docLabel: 'insurance' },
          { field: v.inspection_expiry, label: 'NTSA Inspection', docLabel: 'inspection' },
        ]
        for (const c of checks) {
          if (!c.field) continue
          const expiry = new Date(c.field)
          const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86400000)
          if (daysLeft <= 30) {
            const exists = await supabase.from('reminders').select('id').eq('entity_id', v.id).eq('type', c.docLabel + '_expiry').eq('resolved', false).single()
            if (!exists.data) {
              toCreate.push({
                type: c.docLabel + '_expiry', category: 'expiring',
                priority: daysLeft <= 0 ? 'red' : 'amber',
                title: `${v.reg} — ${c.label} ${daysLeft <= 0 ? 'EXPIRED' : `expiring in ${daysLeft} days`}`,
                detail: `${v.make} ${v.model} | Expiry: ${c.field}`,
                due_date: c.field, entity_type: 'vehicle', entity_id: v.id, resolved: false,
              })
            }
          }
        }
      }
    }

    // Driver document expiry
    if (drivers) {
      for (const d of drivers) {
        const checks = [
          { field: d.licence_expiry, label: 'Driving Licence', key: 'licence' },
          { field: d.psv_expiry,     label: 'PSV Badge',       key: 'psv' },
          { field: d.good_conduct_expiry, label: 'Good Conduct', key: 'good_conduct' },
        ]
        for (const c of checks) {
          if (!c.field) continue
          const daysLeft = Math.floor((new Date(c.field).getTime() - today.getTime()) / 86400000)
          if (daysLeft <= 30) {
            const exists = await supabase.from('reminders').select('id').eq('entity_id', d.id).eq('type', c.key + '_expiry').eq('resolved', false).single()
            if (!exists.data) {
              toCreate.push({
                type: c.key + '_expiry', category: 'expiring',
                priority: daysLeft <= 0 ? 'red' : 'amber',
                title: `${d.name} — ${c.label} ${daysLeft <= 0 ? 'EXPIRED' : `expiring in ${daysLeft} days`}`,
                detail: `Driver | Expiry: ${c.field}`,
                due_date: c.field, entity_type: 'driver', entity_id: d.id, resolved: false,
              })
            }
          }
        }
      }
    }

    if (toCreate.length > 0) {
      await supabase.from('reminders').insert(toCreate)
      load()
    }
  }

  async function resolve(id: string) {
    await supabase.from('reminders').update({ resolved: true }).eq('id', id)
    setReminders(r => r.filter(x => x.id !== id))
  }

  async function resolveAll() {
    if (!confirm('Mark all reminders as resolved?')) return
    await supabase.from('reminders').update({ resolved: true }).eq('resolved', false)
    setReminders([])
  }

  async function saveManual() {
    if (!form.title) return
    await supabase.from('reminders').insert([{
      branch: form.branch, type: 'manual', category: 'manual',
      priority: form.priority, title: form.title,
      detail: form.detail || null, due_date: form.due_date || null, resolved: false,
    }])
    setShowAdd(false)
    setForm({ branch:'eldoret', priority:'amber', category:'manual', title:'', detail:'', due_date:'' })
    load()
  }

  const filtered = reminders.filter(r => {
    if (filter === 'all') return true
    if (filter === 'red' || filter === 'amber') return r.priority === filter
    return r.category === filter
  })

  // Count by priority
  const redCount   = reminders.filter(r => r.priority === 'red').length
  const amberCount = reminders.filter(r => r.priority === 'amber').length

  const navigateTo = (r: Reminder) => {
    if (r.entity_type === 'booking') navigate('/')
    else if (r.entity_type === 'vehicle') navigate('/fleet/vehicles')
    else if (r.entity_type === 'driver') navigate('/partners/drivers')
  }

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Reminders</div>
          <div style={{ display:'flex', gap:'8px' }}>
            {redCount > 0 && <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:'rgba(231,76,60,0.12)', border:'1px solid rgba(231,76,60,0.30)', color:'rgba(239,154,154,0.95)' }}>🔴 {redCount} urgent</span>}
            {amberCount > 0 && <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:'rgba(255,149,0,0.10)', border:'1px solid rgba(255,149,0,0.25)', color:'rgba(255,183,77,0.95)' }}>🟡 {amberCount} action needed</span>}
            {reminders.length === 0 && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.70)', padding:'3px 10px', borderRadius:'20px', background:'rgba(129,199,132,0.08)', border:'1px solid rgba(129,199,132,0.20)' }}>✓ All clear</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={() => setShowResolved(!showResolved)} style={{ padding:'6px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)' }}>
            {showResolved ? 'Show pending' : 'Show resolved'}
          </button>
          {reminders.length > 0 && !showResolved && <button onClick={resolveAll} style={{ padding:'6px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(129,199,132,0.08)', border:'1px solid rgba(129,199,132,0.22)', color:'rgba(129,199,132,0.80)' }}>✓ Resolve all</button>}
          <button onClick={() => load()} style={{ padding:'6px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)' }}>🔄 Refresh</button>
          <button onClick={() => setShowAdd(true)} style={{ padding:'6px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add reminder</button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'18px', flexWrap:'wrap' }}>
        {([
          { key:'all',      label:`All (${reminders.length})` },
          { key:'red',      label:`🔴 Urgent (${redCount})` },
          { key:'amber',    label:`🟡 Action needed (${amberCount})` },
          { key:'overdue',  label:'Overdue returns' },
          { key:'expiring', label:'Expiring docs' },
          { key:'payment',  label:'Payments' },
          { key:'service',  label:'Service due' },
          { key:'manual',   label:'Manual' },
        ] as {key:FilterType;label:string}[]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding:'5px 13px', borderRadius:'20px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            background: filter===f.key ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
            border:`1px solid ${filter===f.key ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.09)'}`,
            color: filter===f.key ? 'rgba(255,215,0,0.90)' : 'rgba(255,255,255,0.38)',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Reminders list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {loading ? (
          <div style={{ ...gl.panel, padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Checking all systems...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...gl.panel, padding:'60px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'14px' }}>✅</div>
            <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:'8px' }}>
              {showResolved ? 'No resolved reminders' : 'Nothing needs attention right now'}
            </div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>
              {showResolved ? 'Resolved reminders will appear here' : 'Reminders are generated automatically from overdue bookings, expiring documents and outstanding payments.'}
            </div>
            {!showResolved && (
              <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add manual reminder</button>
            )}
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 18px', borderRadius:'12px', gap:'16px',
              background: PRIORITY_BG[r.priority] || 'rgba(255,255,255,0.03)',
              borderLeft:`4px solid ${PRIORITY_BORDER[r.priority] || 'rgba(255,255,255,0.15)'}`,
              border:`1px solid ${PRIORITY_BORDER[r.priority] || 'rgba(255,255,255,0.08)'}`,
              borderLeftWidth:'4px',
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.8px', color: PRIORITY_LABEL[r.priority]?.color || 'rgba(255,255,255,0.40)', textTransform:'uppercase' }}>
                    {CATEGORY_ICONS[r.category]} {PRIORITY_LABEL[r.priority]?.label}
                  </span>
                  <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.28)', letterSpacing:'0.5px', textTransform:'uppercase' }}>{r.category}</span>
                  {r.due_date && <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.28)' }}>· {new Date(r.due_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>}
                  {r.branch && <span style={{ fontSize:'9px', color:'rgba(255,215,0,0.40)' }}>· {r.branch === 'eldoret' ? 'Eldoret' : 'Kisumu'}</span>}
                </div>
                <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.88)', marginBottom: r.detail ? '3px' : '0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {r.title}
                </div>
                {r.detail && <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.detail}</div>}
              </div>
              <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                {r.entity_type && (
                  <button onClick={() => navigateTo(r)} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.65)' }}>View →</button>
                )}
                {!showResolved && (<>
                  <button onClick={() => resolve(r.id)} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(129,199,132,0.10)', border:'1px solid rgba(129,199,132,0.28)', color:'rgba(129,199,132,0.90)' }}>✓ Resolve</button>
                  <button onClick={()=>{ setForm({branch:r.branch||'eldoret',priority:r.priority||'medium',title:r.title||'',detail:r.detail||'',due_date:r.due_date||'',entity:r.entity||'',entity_id:r.entity_id||''}); setEditRId(r.id); setShowAdd(true) }}
                    style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>✏️ Edit</button>
                </>)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD MANUAL REMINDER MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'480px', boxShadow:'0 24px 80px rgba(0,0,0,0.65)', padding:'24px 28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Add Reminder</div>
              <button onClick={() => setShowAdd(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>

            {/* Priority */}
            <div style={{ marginBottom:'14px' }}>
              <div style={{ ...gl.label, marginBottom:'8px' }}>Priority</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {[{v:'red',l:'🔴 Urgent'},{v:'amber',l:'🟡 Action needed'},{v:'grey',l:'⚪ Info'}].map(p => (
                  <button key={p.v} onClick={()=>setForm(f=>({...f,priority:p.v}))} style={{ flex:1, padding:'8px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    background: form.priority===p.v ? (p.v==='red'?'rgba(231,76,60,0.12)':p.v==='amber'?'rgba(255,149,0,0.10)':'rgba(150,150,150,0.08)') : 'rgba(255,255,255,0.04)',
                    border:`1px solid ${form.priority===p.v ? (p.v==='red'?'rgba(231,76,60,0.35)':p.v==='amber'?'rgba(255,149,0,0.30)':'rgba(150,150,150,0.25)') : 'rgba(255,255,255,0.09)'}`,
                    color: form.priority===p.v ? (p.v==='red'?'rgba(239,154,154,0.95)':p.v==='amber'?'rgba(255,183,77,0.95)':'rgba(200,200,200,0.80)') : 'rgba(255,255,255,0.35)',
                  }}>{p.l}</button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom:'13px' }}>
              <div style={{ ...gl.label, marginBottom:'6px' }}>Reminder *</div>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Call Equity Bank about LPO renewal" style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
            </div>

            {/* Detail */}
            <div style={{ marginBottom:'13px' }}>
              <div style={{ ...gl.label, marginBottom:'6px' }}>Details (optional)</div>
              <textarea value={form.detail} onChange={e=>setForm(f=>({...f,detail:e.target.value}))} placeholder="Additional notes..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'64px', resize:'none' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
              <div>
                <div style={{ ...gl.label, marginBottom:'6px' }}>Due date (optional)</div>
                <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
              </div>
              <div>
                <div style={{ ...gl.label, marginBottom:'6px' }}>Branch</div>
                <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                  <option value="eldoret">Eldoret HQ</option>
                  <option value="kisumu">Kisumu Branch</option>
                  <option value="">Both branches</option>
                </select>
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={saveManual} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Save Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
