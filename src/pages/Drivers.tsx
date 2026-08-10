import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Driver {
  id: string
  name: string
  phone: string
  email?: string
  branch: 'eldoret' | 'kisumu'
  national_id?: string
  licence_number?: string
  licence_class?: string
  licence_expiry?: string
  psv_badge_number?: string
  psv_expiry?: string
  good_conduct_expiry?: string
  medical_expiry?: string
  status: 'available' | 'on_trip' | 'on_safari' | 'off_duty'
  notes?: string
  created_at: string
}

const STATUS = { available:{label:'Available',color:'rgba(129,199,132,0.95)',bg:'rgba(129,199,132,0.09)',border:'rgba(129,199,132,0.25)'}, on_trip:{label:'On trip',color:'rgba(100,181,246,0.95)',bg:'rgba(100,181,246,0.08)',border:'rgba(100,181,246,0.25)'}, on_safari:{label:'On safari',color:'rgba(206,147,216,0.95)',bg:'rgba(206,147,216,0.08)',border:'rgba(206,147,216,0.25)'}, off_duty:{label:'Off duty',color:'rgba(150,150,150,0.85)',bg:'rgba(150,150,150,0.07)',border:'rgba(150,150,150,0.20)'} }
const gl = { panel:{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties, label:{ fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' } }

function docStatus(expiry?: string) {
  if (!expiry) return { color:'rgba(150,150,150,0.60)', label:'Not set' }
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { color:'rgba(239,154,154,0.95)', label:'Expired' }
  if (days <= 30) return { color:'rgba(239,154,154,0.95)', label:`${days}d` }
  if (days <= 60) return { color:'rgba(255,183,77,0.95)', label:`${days}d` }
  return { color:'rgba(129,199,132,0.95)', label:'Valid' }
}

export default function Drivers() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Driver | null>(null)
  const [form, setForm] = useState({ name:'', phone:'', email:'', branch:'eldoret', national_id:'', licence_number:'', licence_class:'BCE', licence_expiry:'', psv_badge_number:'', psv_expiry:'', good_conduct_expiry:'', medical_expiry:'', notes:'' })

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('drivers').select('*').order('created_at', { ascending: false })
    if (data) setDrivers(data as Driver[])
    setLoading(false)
  }

  async function save() {
    if (!form.name || !form.phone) return
    setSaving(true)
    const { error } = await supabase.from('drivers').insert([{ ...form, email: form.email||null, national_id: form.national_id||null, licence_number: form.licence_number||null, licence_expiry: form.licence_expiry||null, psv_badge_number: form.psv_badge_number||null, psv_expiry: form.psv_expiry||null, good_conduct_expiry: form.good_conduct_expiry||null, medical_expiry: form.medical_expiry||null, notes: form.notes||null, status:'available' }])
    setSaving(false)
    if (!error) { setShowAdd(false); load() } else alert(error.message)
  }

  const filtered = drivers.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search))

  const F = (label: string, key: string, type='text', opts?: string[]) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>{label}</div>
      {opts ? <select value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      : <input type={type} value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />}
    </div>
  )

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
        <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Drivers & Staff <span style={{ fontSize:'12px', fontWeight:400, color:'rgba(255,255,255,0.35)', marginLeft:'8px' }}>{drivers.length} registered</span></div>
        <div style={{ display:'flex', gap:'10px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'200px' }} />
          <button onClick={() => setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add driver</button>
        </div>
      </div>

      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
        : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>🧑‍✈️</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No drivers registered yet</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Add your first driver to get started</div>
            <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first driver</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Name','Status','Branch','Phone','Licence exp.','PSV exp.','Good Conduct','Action'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const sc = STATUS[d.status]
                return (
                  <tr key={d.id} onClick={() => setSelected(d)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.92)' }}>{d.name}</div></td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{sc.label}</span></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{d.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{d.phone}</div></td>
                    {[d.licence_expiry, d.psv_expiry, d.good_conduct_expiry].map((exp,i) => {
                      const ds = docStatus(exp)
                      return <td key={i} style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, color:ds.color }}>{ds.label}</span></td>
                    })}
                    <td style={{ padding:'12px' }}><button onClick={e=>{e.stopPropagation();setSelected(d)}} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit' }}>View</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'400px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1, padding:'24px' }}>
            <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>
            <div style={{ fontSize:'22px', fontWeight:800, color:'rgba(255,255,255,0.95)', marginBottom:'4px' }}>{selected.name}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'} · {selected.phone}</div>
            <div style={{ ...gl.panel, padding:'16px' }}>
              {[
                { label:'National ID',      value: selected.national_id || '—' },
                { label:'Licence number',   value: selected.licence_number || '—' },
                { label:'Licence class',    value: selected.licence_class || '—' },
                { label:'Licence expiry',   value: selected.licence_expiry || '—', doc: true, exp: selected.licence_expiry },
                { label:'PSV badge',        value: selected.psv_badge_number || '—' },
                { label:'PSV expiry',       value: selected.psv_expiry || '—', doc: true, exp: selected.psv_expiry },
                { label:'Good Conduct exp.',value: selected.good_conduct_expiry || '—', doc: true, exp: selected.good_conduct_expiry },
                { label:'Medical exp.',     value: selected.medical_expiry || '—', doc: true, exp: selected.medical_expiry },
              ].map((row,i,arr) => {
                const ds = row.doc ? docStatus((row as any).exp) : null
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i<arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color: ds ? ds.color : 'rgba(255,255,255,0.75)' }}>{row.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.60)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'520px', maxHeight:'88vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.60)' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>Add Driver</div>
              <button onClick={() => setShowAdd(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              {F('Full name *','name')} {F('Phone *','phone','tel')} {F('Email (optional)','email','email')}
              {F('Branch','branch','text',['eldoret','kisumu'])} {F('National ID','national_id')}
              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Documents</div>
              {F('Licence number','licence_number')} {F('Licence class','licence_class','text',['BCE','B','C','E','A','F'])}
              {F('Licence expiry','licence_expiry','date')} {F('PSV badge number','psv_badge_number')}
              {F('PSV expiry','psv_expiry','date')} {F('Good Conduct expiry','good_conduct_expiry','date')}
              {F('Medical certificate expiry','medical_expiry','date')}
              <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving?'Saving...':'Save Driver'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
