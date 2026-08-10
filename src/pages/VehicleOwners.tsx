import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Owner { id:string; name:string; phone:string; email?:string; branch:'eldoret'|'kisumu'; national_id?:string; mpesa_number?:string; bank_name?:string; bank_account?:string; notes?:string; created_at:string }

const gl = { panel:{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties, label:{ fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' } }

export default function VehicleOwners({ defaultTab = 'profiles' }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState(defaultTab)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Owner | null>(null)
  const [form, setForm] = useState({ name:'', phone:'', email:'', branch:'eldoret', national_id:'', mpesa_number:'', bank_name:'', bank_account:'', notes:'' })

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('vehicle_owners').select('*').order('created_at', { ascending: false })
    if (data) setOwners(data as Owner[])
    setLoading(false)
  }

  async function save() {
    if (!form.name || !form.phone) return
    setSaving(true)
    const { error } = await supabase.from('vehicle_owners').insert([{ ...form, email:form.email||null, national_id:form.national_id||null, mpesa_number:form.mpesa_number||null, bank_name:form.bank_name||null, bank_account:form.bank_account||null, notes:form.notes||null }])
    setSaving(false)
    if (!error) { setShowAdd(false); load() } else alert(error.message)
  }

  const F = (label: string, key: string, type='text') => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>{label}</div>
      <input type={type} value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
    </div>
  )

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>
      <div style={{ display:'flex', gap:'8px', marginBottom:'18px' }}>
        {[['profiles','Owner Profiles'],['payouts','Payouts'],['portal','Owner Portal']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:tab===t?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${tab===t?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:tab===t?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{l}</button>
        ))}
      </div>

      {tab === 'profiles' && (
        <div style={{ ...gl.panel, padding:'18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <div style={gl.label}>Vehicle Owners ({owners.length})</div>
            <button onClick={() => setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add owner</button>
          </div>
          {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
          : owners.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'36px', marginBottom:'14px' }}>🚙</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No vehicle owners registered yet</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Add your first vehicle owner partner</div>
              <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first owner</button>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>{['Name','Phone','M-Pesa','Branch','Bank','Action'].map(h=><th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>)}</tr></thead>
              <tbody>{owners.map(o => (
                <tr key={o.id} onClick={() => setSelected(o)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.92)' }}>{o.name}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{o.phone}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,215,0,0.65)' }}>{o.mpesa_number || '—'}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{o.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div></td>
                  <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{o.bank_name || '—'}</div></td>
                  <td style={{ padding:'12px' }}><button onClick={e=>{e.stopPropagation();setSelected(o)}} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit' }}>View</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'payouts' && (
        <div style={{ ...gl.panel, padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'14px' }}>💵</div>
          <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>Owner Payouts</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)' }}>Payout calculations come from Finance → P&L by vehicle. Register owners first.</div>
        </div>
      )}

      {tab === 'portal' && (
        <div style={{ ...gl.panel, padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'14px' }}>🔗</div>
          <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>Owner Portal</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)' }}>Self-service portal for vehicle owners to view their earnings and statements.</div>
        </div>
      )}

      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'400px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>
            <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'4px' }}>70% Net Profit Share</div>
            <div style={{ fontSize:'22px', fontWeight:800, color:'rgba(255,255,255,0.95)', marginBottom:'4px' }}>{selected.name}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div>
            <div style={{ ...gl.panel, padding:'16px' }}>
              {[{ label:'Phone', value:selected.phone },{ label:'Email', value:selected.email||'—' },{ label:'National ID', value:selected.national_id||'—' },{ label:'M-Pesa', value:selected.mpesa_number||'—' },{ label:'Bank', value:selected.bank_name||'—' },{ label:'Account', value:selected.bank_account||'—' }].map((r,i,arr) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{r.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', borderRadius:'10px', padding:'12px 14px', marginTop:'16px', fontSize:'11px', color:'rgba(255,215,0,0.65)' }}>🔒 Payout amounts live in Finance → P&L by vehicle → Owner Payouts</div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.60)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'500px', maxHeight:'88vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.60)' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Add Vehicle Owner</div>
              <button onClick={() => setShowAdd(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              {F('Full name *','name')} {F('Phone *','phone','tel')} {F('Email (optional)','email','email')}
              {F('National ID','national_id')} {F('M-Pesa number (for payouts)','mpesa_number','tel')}
              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Bank Details (optional)</div>
              {F('Bank name','bank_name')} {F('Account number','bank_account')}
              <div style={{ marginBottom:'13px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>Branch</div>
                <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                  <option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Owner'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
