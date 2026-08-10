import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const gl = { panel:{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties, label:{ fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' } }

export default function PSKFleet({ defaultTab = 'vehicles' }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(defaultTab)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (data) setVehicles(data)
    setLoading(false)
  }

  const tabs = [['vehicles','Vehicles'],['maintenance','Maintenance'],['fuel','Fuel Log'],['compliance','Compliance Calendar']]

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>
      <div style={{ display:'flex', gap:'8px', marginBottom:'18px' }}>
        {tabs.map(([t,l]) => <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:tab===t?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${tab===t?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:tab===t?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{l}</button>)}
      </div>

      {tab === 'vehicles' && (
        <div style={{ ...gl.panel, padding:'18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <div style={gl.label}>PSK Fleet ({vehicles.length} vehicles)</div>
            <button onClick={() => navigate('/registry')} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Register vehicle</button>
          </div>
          {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
          : vehicles.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'36px', marginBottom:'14px' }}>🚗</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No vehicles registered yet</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Register vehicles from the Registry Board</div>
              <button onClick={() => navigate('/registry')} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Go to Registry Board</button>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>{['Reg','Vehicle','Year','Branch','Insurance Exp.','Inspection Exp.','Odometer'].map(h=><th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>)}</tr></thead>
              <tbody>{vehicles.map(v=>(
                <tr key={v.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{v.reg}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>{v.make} {v.model}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>{v.year}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{v.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color: v.insurance_expiry ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)' }}>{v.insurance_expiry || '—'}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color: v.inspection_expiry ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)' }}>{v.inspection_expiry || '—'}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{v.odometer ? v.odometer.toLocaleString()+' km' : '—'}</div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab !== 'vehicles' && (
        <div style={{ ...gl.panel, padding:'60px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'14px' }}>{tab === 'maintenance' ? '🔧' : tab === 'fuel' ? '⛽' : '📅'}</div>
          <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>
            {tab === 'maintenance' ? 'Maintenance Tracker' : tab === 'fuel' ? 'Fuel Log' : 'Compliance Calendar'}
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)' }}>Register vehicles first, then log maintenance and fuel records here.</div>
        </div>
      )}
    </div>
  )
}
