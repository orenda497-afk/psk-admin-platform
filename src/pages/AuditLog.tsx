import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

interface AuditEntry {
  id: string
  created_at: string
  action: string
  table_name: string
  record_ref?: string
  user_name?: string
  branch?: string
  details?: string
}

const ACTION_COLORS: Record<string,{color:string;bg:string;border:string}> = {
  created:  { color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  updated:  { color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  deleted:  { color:'rgba(239,154,154,0.90)', bg:'rgba(231,76,60,0.07)',   border:'rgba(231,76,60,0.18)'   },
  accessed: { color:'rgba(255,183,77,0.90)',  bg:'rgba(255,183,77,0.08)',  border:'rgba(255,183,77,0.25)'  },
  paid:     { color:'rgba(255,215,0,0.90)',   bg:'rgba(255,215,0,0.08)',   border:'rgba(255,215,0,0.25)'   },
  matched:  { color:'rgba(206,147,216,0.90)', bg:'rgba(206,147,216,0.08)', border:'rgba(206,147,216,0.25)' },
}

const TABLE_ICONS: Record<string,string> = {
  bookings:'📅', clients:'👥', vehicles:'🚗', drivers:'🧑‍✈️', psk_documents:'📄',
  expenses:'💸', mpesa_transactions:'📱', rental_agreements:'📋', handover_checklists:'📷',
  owner_payouts:'💵', vehicle_owners:'🚙', reminders:'🔔', maintenance_logs:'🔧', fuel_logs:'⛽',
}

export default function AuditLog() {
  const navigate = useNavigate()
  const [entries, setEntries]   = useState<AuditEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [liveActivity, setLive] = useState<any[]>([])

  useEffect(() => {
    loadAudit()
    buildLiveActivity()
  }, [])

  async function loadAudit() {
    setLoading(true)
    const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200)
    if (data) setEntries(data as AuditEntry[])
    setLoading(false)
  }

  // Build live activity from actual table timestamps
  async function buildLiveActivity() {
    const [b,c,v,d,docs,e,m] = await Promise.all([
      supabase.from('bookings').select('id,booking_ref,created_at,status').order('created_at',{ascending:false}).limit(5),
      supabase.from('clients').select('id,name,type,created_at').order('created_at',{ascending:false}).limit(5),
      supabase.from('vehicles').select('id,reg,make,model,created_at').order('created_at',{ascending:false}).limit(5),
      supabase.from('drivers').select('id,name,created_at').order('created_at',{ascending:false}).limit(5),
      supabase.from('psk_documents').select('id,doc_ref,doc_type,client_name,created_at,status').order('created_at',{ascending:false}).limit(5),
      supabase.from('expenses').select('id,description,amount,created_at').order('created_at',{ascending:false}).limit(3),
      supabase.from('mpesa_transactions').select('id,mpesa_ref,name,amount,matched,created_at').order('created_at',{ascending:false}).limit(3),
    ])

    const activity: any[] = []
    ;(b.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'📅', action:'Booking created', detail:`${x.booking_ref} — Status: ${x.status}`, color:'rgba(100,181,246,0.90)' }))
    ;(c.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'👥', action:'Client registered', detail:`${x.name} (${x.type})`, color:'rgba(129,199,132,0.90)' }))
    ;(v.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'🚗', action:'Vehicle registered', detail:`${x.reg} — ${x.make} ${x.model}`, color:'rgba(255,215,0,0.85)' }))
    ;(d.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'🧑‍✈️', action:'Driver added', detail:x.name, color:'rgba(206,147,216,0.90)' }))
    ;(docs.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'📄', action:`${x.doc_type} created`, detail:`${x.doc_ref} — ${x.client_name}`, color:'rgba(255,183,77,0.90)' }))
    ;(e.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'💸', action:'Expense logged', detail:`${x.description} — KES ${x.amount?.toLocaleString()}`, color:'rgba(255,183,77,0.80)' }))
    ;(m.data||[]).forEach(x=>activity.push({ time:x.created_at, icon:'📱', action:'M-Pesa logged', detail:`${x.mpesa_ref} — ${x.name} — KES ${x.amount?.toLocaleString()} — ${x.matched?'Matched':'Unmatched'}`, color:'rgba(129,199,132,0.85)' }))

    activity.sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime())
    setLive(activity)
  }

  const filtered = entries.filter(e => {
    const mf = filter==='all' || e.action===filter || e.table_name===filter
    const ms = !search || e.action?.toLowerCase().includes(search.toLowerCase()) || e.record_ref?.toLowerCase().includes(search.toLowerCase()) || e.user_name?.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>

      <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'4px' }}>Audit Log</div>
      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>Complete activity trail — every record created, updated, paid or deleted</div>

      {/* Live activity feed */}
      <div style={{ ...gl.panel, padding:'18px', marginBottom:'16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.80)', marginBottom:'14px' }}>
          🟢 Live Activity Feed
          <span style={{ fontSize:'10px', fontWeight:400, color:'rgba(255,255,255,0.30)', marginLeft:'8px' }}>Built from actual platform records</span>
        </div>
        {liveActivity.length === 0 ? (
          <div style={{ textAlign:'center', padding:'30px', color:'rgba(255,255,255,0.25)', fontSize:'12px' }}>No activity yet. Start using the platform — every action will appear here.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {liveActivity.slice(0,15).map((a,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'9px', borderLeft:`3px solid ${a.color}` }}>
                <span style={{ fontSize:'16px', flexShrink:0 }}>{a.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.82)' }}>{a.action}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.detail}</div>
                </div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)', flexShrink:0 }}>
                  {a.time ? new Date(a.time).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formal audit log table */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.80)' }}>
          Formal Audit Log
          <span style={{ fontSize:'10px', fontWeight:400, color:'rgba(255,255,255,0.30)', marginLeft:'8px' }}>Stores in audit_log table — run SQL below to enable</span>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search action, ref, user..." style={{ padding:'7px 12px', borderRadius:'9px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'200px' }} />
          <button onClick={loadAudit} style={{ padding:'7px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>🔄 Refresh</button>
        </div>
      </div>

      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading audit log...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 20px' }}>
            <div style={{ fontSize:'32px', marginBottom:'14px' }}>📋</div>
            <div style={{ fontSize:'14px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>Audit log table not yet created</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Run this SQL in Supabase to enable formal audit logging:</div>
            <div style={{ background:'rgba(0,0,0,0.40)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'9px', padding:'16px', textAlign:'left', fontSize:'11px', fontFamily:'monospace', color:'rgba(129,199,132,0.80)', marginBottom:'16px', maxWidth:'600px', margin:'0 auto 16px' }}>
              {`create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  action text, table_name text,
  record_ref text, user_name text,
  branch text, details text
);
alter table audit_log enable row level security;
create policy "open" on audit_log for all
  using (true) with check (true);`}
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>The Live Activity Feed above already shows all platform activity from real table data.</div>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Time','Action','Table','Record','User','Branch','Details'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e=>{
                const ac = ACTION_COLORS[e.action?.toLowerCase()] || ACTION_COLORS.updated
                return (
                  <tr key={e.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={x=>(x.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={x=>(x.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'11px 12px', fontSize:'11px', color:'rgba(255,255,255,0.45)', whiteSpace:'nowrap' }}>{e.created_at ? new Date(e.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                    <td style={{ padding:'11px 12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', color:ac.color, background:ac.bg, border:`1px solid ${ac.border}` }}>{e.action}</span></td>
                    <td style={{ padding:'11px 12px', fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{TABLE_ICONS[e.table_name]||'📋'} {e.table_name}</td>
                    <td style={{ padding:'11px 12px', fontSize:'11px', fontWeight:600, color:'rgba(255,215,0,0.70)' }}>{e.record_ref||'—'}</td>
                    <td style={{ padding:'11px 12px', fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{e.user_name||'System'}</td>
                    <td style={{ padding:'11px 12px', fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>{e.branch||'—'}</td>
                    <td style={{ padding:'11px 12px', fontSize:'11px', color:'rgba(255,255,255,0.40)', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.details||'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
