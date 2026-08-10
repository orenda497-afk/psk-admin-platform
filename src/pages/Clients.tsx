import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Client {
  id: string
  type: 'individual' | 'corporate' | 'agency' | 'government'
  name: string
  phone: string
  secondary_phone?: string
  email?: string
  id_type?: string
  id_number?: string
  address?: string
  city?: string
  kra_pin?: string
  contact_person?: string
  credit_limit?: number
  payment_terms?: number
  branch: 'eldoret' | 'kisumu'
  notes?: string
  created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const TYPE_COLORS: Record<string,{color:string;bg:string;border:string}> = {
  individual: { color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  corporate:  { color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  agency:     { color:'rgba(206,147,216,0.95)', bg:'rgba(206,147,216,0.08)', border:'rgba(206,147,216,0.25)' },
  government: { color:'rgba(255,183,77,0.95)',  bg:'rgba(255,183,77,0.08)',  border:'rgba(255,183,77,0.25)'  },
}

export default function Clients({ defaultTab = 'all' }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState(defaultTab)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const [clientType, setClientType] = useState<'individual'|'corporate'>('individual')
  const [form, setForm] = useState({ name:'', phone:'', secondary_phone:'', email:'', id_type:'National ID', id_number:'', address:'', city:'', kra_pin:'', contact_person:'', credit_limit:0, payment_terms:30, branch:'eldoret', notes:'' })

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (data) setClients(data as Client[])
    setLoading(false)
  }

  async function saveClient() {
    if (!form.name || !form.phone) return
    setSaving(true)
    const payload = {
      type: clientType,
      name: form.name, phone: form.phone,
      secondary_phone: form.secondary_phone || null,
      email: form.email || null,
      id_type: clientType === 'individual' ? form.id_type : null,
      id_number: clientType === 'individual' ? form.id_number || null : null,
      address: form.address || null, city: form.city || null,
      kra_pin: clientType === 'corporate' ? form.kra_pin || null : null,
      contact_person: clientType === 'corporate' ? form.contact_person || null : null,
      credit_limit: form.credit_limit || 0,
      payment_terms: form.payment_terms || 0,
      branch: form.branch, notes: form.notes || null,
    }
    const { error } = await supabase.from('clients').insert([payload])
    setSaving(false)
    if (!error) { setShowAdd(false); loadClients() }
    else alert('Error: ' + error.message)
  }

  const filtered = clients.filter(c => {
    const mt = tab === 'all' || c.type === tab
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    return mt && ms
  })

  const F = (label: string, key: string, type = 'text', opts?: string[]) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>{label}</div>
      {opts ? (
        <select value={(form as any)[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={(form as any)[key]} onChange={e => setForm(f=>({...f,[key]: type==='number' ? Number(e.target.value) : e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
      )}
    </div>
  )

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>

      {/* Tabs */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'8px' }}>
          {['all','individual','corporate','agency','government'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: tab===t ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${tab===t ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.10)'}`, color: tab===t ? 'rgba(255,215,0,0.90)' : 'rgba(255,255,255,0.40)' }}>
              {t === 'all' ? `All (${clients.length})` : t.charAt(0).toUpperCase()+t.slice(1)} {t !== 'all' && `(${clients.filter(c=>c.type===t).length})`}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone..." style={{ padding:'7px 13px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', width:'200px' }} />
          <button onClick={() => setShowAdd(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ New client</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>👥</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>{clients.length === 0 ? 'No clients registered yet' : 'No clients match your search'}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Add your first client to get started</div>
            <button onClick={() => setShowAdd(true)} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add first client</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Name','Type','Phone','Email','Branch','City','Action'].map(h => (
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const tc = TYPE_COLORS[c.type]
                return (
                  <tr key={c.id} onClick={() => setSelected(c)} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.92)' }}>{c.name}</div></td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:tc.color, background:tc.bg, border:`1px solid ${tc.border}` }}>{c.type}</span></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{c.phone}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>{c.email || '—'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{c.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div></td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{c.city || '—'}</div></td>
                    <td style={{ padding:'12px' }}><button onClick={e=>{e.stopPropagation();setSelected(c)}} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit' }}>View</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Client detail slide-over */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={() => setSelected(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
          <div style={{ position:'relative', width:'400px', height:'100vh', background:'rgba(6,16,28,0.97)', backdropFilter:'blur(32px)', borderLeft:'1px solid rgba(255,255,255,0.12)', overflowY:'auto', zIndex:1 }}>
            <div style={{ padding:'24px' }}>
              <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', marginBottom:'20px' }}>✕ Close</button>
              <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:TYPE_COLORS[selected.type].color, background:TYPE_COLORS[selected.type].bg, border:`1px solid ${TYPE_COLORS[selected.type].border}` }}>{selected.type}</span>
              <div style={{ fontSize:'22px', fontWeight:800, color:'rgba(255,255,255,0.95)', margin:'12px 0 4px' }}>{selected.name}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>{selected.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div>
              <div style={{ ...gl.panel, padding:'16px', marginBottom:'16px' }}>
                {[
                  { label:'Phone',          value: selected.phone },
                  { label:'Secondary phone',value: selected.secondary_phone || '—' },
                  { label:'Email',          value: selected.email || '—' },
                  { label:'ID number',      value: selected.id_number || '—' },
                  { label:'Address',        value: selected.address || '—' },
                  { label:'City',           value: selected.city || '—' },
                  { label:'KRA PIN',        value: selected.kra_pin || '—' },
                  { label:'Credit limit',   value: selected.credit_limit ? `KES ${selected.credit_limit.toLocaleString()}` : '—' },
                ].map((row,i,arr) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i<arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {[{ label:'+ New booking', primary:true },{ label:'New quote', primary:false }].map((btn,i) => (
                  <button key={i} style={{ padding:'8px 14px', borderRadius:'9px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: btn.primary ? 'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))' : 'rgba(255,255,255,0.06)', border:`1px solid ${btn.primary ? 'rgba(255,215,0,0.32)' : 'rgba(255,255,255,0.12)'}`, color: btn.primary ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.60)' }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CLIENT MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.60)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'520px', maxHeight:'88vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.60)' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>New Client</div>
              <button onClick={() => setShowAdd(false)} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              {/* Client type selector */}
              <div style={{ marginBottom:'20px' }}>
                <div style={{ ...gl.label, marginBottom:'10px' }}>Client type</div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {(['individual','corporate','agency','government'] as const).map(t => (
                    <button key={t} onClick={() => setClientType(t as any)} style={{ flex:1, padding:'8px', borderRadius:'9px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: clientType===t ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${clientType===t ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.10)'}`, color: clientType===t ? 'rgba(255,215,0,0.90)' : 'rgba(255,255,255,0.40)', textTransform:'capitalize' }}>{t}</button>
                  ))}
                </div>
              </div>

              {F('Full name *','name')}
              {F('Phone number *','phone','tel')}
              {F('Secondary phone','secondary_phone','tel')}
              {F('Email (optional)','email','email')}
              {clientType === 'individual' && F('ID type','id_type','text',['National ID','Passport','Driving Licence'])}
              {clientType === 'individual' && F('ID number','id_number')}
              {clientType === 'corporate' && F('KRA PIN','kra_pin')}
              {clientType === 'corporate' && F('Contact person','contact_person')}
              {F('Address','address')}
              {F('City / Town','city')}
              {F('Branch','branch','text',['eldoret','kisumu'])}
              {F('Credit limit (KES)','credit_limit','number')}
              {F('Payment terms (days)','payment_terms','number')}
              <div style={{ marginBottom:'13px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>Notes</div>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'60px', resize:'none' }} />
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveClient} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.35)', color:'rgba(255,215,0,0.95)', cursor: saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>{saving ? 'Saving...' : 'Save Client'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
