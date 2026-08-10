import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
const gl = { panel:{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties, label:{ fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' } }
export default function Reminders() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('reminders').select('*').eq('resolved', false).order('due_date', { ascending: true })
    if (data) setReminders(data)
    setLoading(false)
  }
  const BORDER: Record<string,string> = { red:'rgba(231,76,60,0.50)', amber:'rgba(255,149,0,0.40)', grey:'rgba(150,150,150,0.30)' }
  return (
    <div style={{ padding:'24px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>
      <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'20px' }}>Reminders <span style={{ fontSize:'12px', fontWeight:400, color:'rgba(255,255,255,0.35)', marginLeft:'8px' }}>{reminders.length} pending</span></div>
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
        : reminders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>🔔</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No pending reminders</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)' }}>Reminders are generated automatically from vehicle and driver document expiries, overdue bookings, and outstanding payments.</div>
          </div>
        ) : reminders.map(r => (
          <div key={r.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:'10px', background:'rgba(255,255,255,0.03)', borderLeft:`4px solid ${BORDER[r.priority]||BORDER.grey}`, marginBottom:'8px' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.88)', marginBottom:'3px' }}>{r.title}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>{r.detail} {r.due_date ? `· Due ${r.due_date}` : ''}</div>
            </div>
            <button onClick={async()=>{ await supabase.from('reminders').update({resolved:true}).eq('id',r.id); load() }} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, background:'rgba(129,199,132,0.10)', border:'1px solid rgba(129,199,132,0.25)', color:'rgba(129,199,132,0.90)', cursor:'pointer', fontFamily:'inherit' }}>Resolve</button>
          </div>
        ))}
      </div>
    </div>
  )
}
