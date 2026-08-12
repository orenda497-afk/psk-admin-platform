import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MASTER_KEY = 'PSK-KEVIN-2026-SUPER'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  lbl: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

// Staff accounts live in Supabase Auth. Passwords are hashed there and
// cannot be read back by anyone, including this panel. That is deliberate:
// this file ships to the browser.

export default function SuperAdmin() {
  const [key, setKey]           = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError]       = useState('')
  const [users, setUsers]       = useState<any[]>([])
  const [loadErr, setLoadErr]   = useState('')
  const [editing, setEditing]   = useState<number|null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [newUser, setNewUser]   = useState(false)
  const [nf, setNf]             = useState({ email:'', password:'', role:'ops', name:'', title:'', finPin:'N/A' })
  const [saved, setSaved]       = useState('')
  const [activeTab, setActiveTab] = useState('users')

  function unlock() {
    if (key === MASTER_KEY) { setUnlocked(true); setError('') }
    else { setError('Invalid master key.'); setKey('') }
  }

  useEffect(() => {
    if (!unlocked) return
    ;(async () => {
      const { data, error: e } = await supabase
        .from('profiles')
        .select('id,email,name,title,role,branch,active,must_change_pw,backup_email,finance_pin_hash')
        .order('role')
      if (e) { setLoadErr('Could not load staff. You must be signed in as Ken to view this list.'); return }
      setUsers((data || []).map(u => ({ ...u, hasPin: !!u.finance_pin_hash })))
    })()
  }, [unlocked])

  async function sendReset(email: string) {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/' })
    setSaved('Reset link sent to ' + email + ' \u2713')
    setTimeout(() => setSaved(''), 3000)
  }

  async function clearFinancePin(id: string, name: string) {
    if (!confirm(`Clear ${name}'s Finance PIN? They will set a new one next time they open Finance.`)) return
    const { error: e } = await supabase.from('profiles')
      .update({ finance_pin_hash: null, pin_attempts: 0, pin_locked_until: null }).eq('id', id)
    if (e) { setSaved('Failed \u2014 ' + e.message); return }
    setUsers(us => us.map(u => u.id === id ? { ...u, hasPin: false } : u))
    setSaved('PIN cleared \u2713')
    setTimeout(() => setSaved(''), 3000)
  }

  async function saveUsers(updated: any[]) {
    setUsers(updated)
    setSaved('Saved \u2713')
    setTimeout(() => setSaved(''), 2000)
  }

  function startEdit(i: number) {
    setEditing(i)
    setEditForm({ ...users[i] })
  }

  async function saveEdit() {
    const { error: e } = await supabase.from('profiles')
      .update({ name: editForm.name, title: editForm.title, role: editForm.role, branch: editForm.branch })
      .eq('id', editForm.id)
    if (e) { setSaved('Failed \u2014 ' + e.message); setTimeout(()=>setSaved(''),4000); return }
    saveUsers(users.map((u: any, i: number) => i === editing ? editForm : u))
    setEditing(null)
  }

  async function deleteUser(i: number) {
    if (!confirm(`Deactivate ${users[i].name}? They will no longer be able to sign in.`)) return
    const { error: e } = await supabase.from('profiles').update({ active: false }).eq('id', users[i].id)
    if (e) { setSaved('Failed \u2014 ' + e.message); return }
    saveUsers(users.map((u:any,idx:number) => idx===i ? {...u, active:false} : u))
  }

  function addUser() {
    alert(
      'New staff are created in Supabase, not here.\n\n' +
      '1. Supabase dashboard \u2192 Authentication \u2192 Add user\n' +
      '2. Tick Auto Confirm, set a temporary password\n' +
      '3. Come back here and set their role\n\n' +
      'Creating users from the browser would require the service role key, ' +
      'and that key must never ship in this bundle.'
    )
  }

  async function resetPins() {
    if (!confirm('Clear the Finance PIN for Ken and Miriam? Each will set a new one on next entry.')) return
    const { error: e } = await supabase.from('profiles')
      .update({ finance_pin_hash: null, pin_attempts: 0, pin_locked_until: null })
      .in('role', ['owner','finance'])
    if (e) { setSaved('Failed \u2014 ' + e.message); return }
    setUsers(us => us.map(u => ['owner','finance'].includes(u.role) ? { ...u, hasPin:false } : u))
    setSaved('Finance PINs cleared \u2713')
    setTimeout(() => setSaved(''), 3000)
  }

  const inp = (val: any, set: any, type='text', placeholder='') => (
    <input type={type} value={val} placeholder={placeholder} onChange={e=>set(e.target.value)}
      style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', outline:'none', fontFamily:'inherit' }} />
  )

  const sel = (val: any, set: any) => (
    <select value={val} onChange={e=>set(e.target.value)}
      style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
      <option value="owner">Owner (full access)</option>
      <option value="finance">Finance Manager</option>
      <option value="manager">Branch Manager</option>
      <option value="ops">Operations</option>
      <option value="intern">Intern</option>
    </select>
  )

  const ROLE_COLOR: Record<string,string> = {
    owner:'rgba(255,215,0,0.90)', finance:'rgba(100,181,246,0.90)',
    manager:'rgba(129,199,132,0.90)', ops:'rgba(206,147,216,0.90)', intern:'rgba(150,150,150,0.70)'
  }

  if (!unlocked) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#060f1a' }}>
      <div style={{ ...gl.panel, padding:'40px 36px', width:'360px', textAlign:'center' }}>
        <div style={{ fontSize:'36px', marginBottom:'12px' }}>🛡️</div>
        <div style={{ fontSize:'18px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'4px' }}>Super Admin</div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginBottom:'24px' }}>Restricted access — authorised personnel only</div>
        <input
          type="password" value={key} placeholder="Enter master key"
          onChange={e=>setKey(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&unlock()}
          style={{ width:'100%', padding:'12px 14px', borderRadius:'10px', fontSize:'13px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', outline:'none', fontFamily:'inherit', marginBottom:'12px', textAlign:'center', letterSpacing:'4px' }}
        />
        {error && <div style={{ fontSize:'11px', color:'rgba(239,154,154,0.90)', marginBottom:'12px' }}>{error}</div>}
        <button onClick={unlock} style={{ width:'100%', padding:'13px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Unlock</button>
        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.15)', marginTop:'16px' }}>This panel is invisible to PSK staff</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#060f1a', padding:'32px 36px', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <img src="/branding/psk-logo.png" alt="" style={{ width:'32px', height:'32px', borderRadius:'50%' }} />
            <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)' }}>PSK Platform — Super Admin</div>
          </div>
          <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)' }}>Kevin's private control panel · Not visible to PSK staff</div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {saved && <span style={{ fontSize:'12px', color:'rgba(129,199,132,0.90)', fontWeight:600 }}>{saved}</span>}
          <button onClick={()=>window.open('/','_blank')} style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>↗ Open platform</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'24px' }}>
        {[['users','👥 Staff & Access'],['pins','🔐 Finance PINs'],['info','📋 Platform Info']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{ padding:'8px 18px', borderRadius:'20px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:activeTab===id?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${activeTab===id?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:activeTab===id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{label}</button>
        ))}
      </div>

      {/* USERS TAB */}
      {activeTab==='users' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.85)' }}>All Users ({users.length})</div>
            <button onClick={()=>setNewUser(true)} style={{ padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>+ Add user</button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {users.map((u: any, i: number) => (
              <div key={i} style={{ ...gl.panel, padding:'18px 20px' }}>
                {editing === i ? (
                  <div>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'14px' }}>Editing: {u.name}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                      <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Name</div>{inp(editForm.name, (v:string)=>setEditForm((f:any)=>({...f,name:v})))}</div>
                      <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Email</div>{inp(editForm.email, (v:string)=>setEditForm((f:any)=>({...f,email:v})), 'email')}</div>
                      <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Title</div>{inp(editForm.title, (v:string)=>setEditForm((f:any)=>({...f,title:v})))}</div>
                      <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Branch</div>{inp(editForm.branch, (v:string)=>setEditForm((f:any)=>({...f,branch:v})), 'text', 'eldoret or kisumu')}</div>
                      <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Role</div>{sel(editForm.role, (v:string)=>setEditForm((f:any)=>({...f,role:v})))}</div>
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={saveEdit} style={{ padding:'8px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(129,199,132,0.16),rgba(45,95,63,0.09))', border:'1px solid rgba(129,199,132,0.30)', color:'rgba(129,199,132,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Save changes</button>
                      <button onClick={()=>setEditing(null)} style={{ padding:'8px 16px', borderRadius:'8px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'14px', flex:1 }}>
                      <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:`${ROLE_COLOR[u.role]}22`, border:`1.5px solid ${ROLE_COLOR[u.role]}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                        {u.role==='owner'?'👑':u.role==='finance'?'💰':u.role==='manager'?'🏢':u.role==='ops'?'⚙️':'🎓'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                          <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.90)' }}>{u.name}</span>
                          <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', color:ROLE_COLOR[u.role], background:`${ROLE_COLOR[u.role]}18`, border:`1px solid ${ROLE_COLOR[u.role]}40` }}>{u.role}</span>
                        </div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>{u.email} · {u.title}</div>
                      </div>
                      {/* Password shown to Kevin only */}
                      <div style={{ background:'rgba(0,0,0,0.30)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'8px 14px' }}>
                        <div style={{ ...gl.lbl, marginBottom:'3px' }}>Password</div>
                        <button onClick={()=>sendReset(u.email)} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'11px', fontWeight:600, background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.28)', color:'rgba(255,215,0,0.85)', cursor:'pointer', fontFamily:'inherit' }}>Send reset link</button>
                      </div>
                      {['owner','finance'].includes(u.role) && (
                        <div style={{ background:'rgba(0,0,0,0.30)', border:'1px solid rgba(255,215,0,0.12)', borderRadius:'8px', padding:'8px 14px' }}>
                          <div style={{ ...gl.lbl, marginBottom:'3px' }}>Default Finance PIN</div>
                          <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.45)' }}>{u.hasPin ? 'Set \u2014 hidden' : 'Not set yet'}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                      <button onClick={()=>startEdit(i)} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.85)', cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
                      <button onClick={()=>deleteUser(i)} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.75)', cursor:'pointer', fontFamily:'inherit' }}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new user */}
          {newUser && (
            <div style={{ ...gl.panel, padding:'20px', marginTop:'12px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'14px' }}>New User</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Full name *</div>{inp(nf.name, (v:string)=>setNf(f=>({...f,name:v})), 'text', 'e.g. Sarah Kamau')}</div>
                <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Email *</div>{inp(nf.email, (v:string)=>setNf(f=>({...f,email:v})), 'email', 'sarah@psksafaris.com')}</div>
                <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Title</div>{inp(nf.title, (v:string)=>setNf(f=>({...f,title:v})), 'text', 'e.g. Driver')}</div>
                <div><div style={{ ...gl.lbl, marginBottom:'5px' }}>Role</div>{sel(nf.role, (v:string)=>setNf(f=>({...f,role:v})))}</div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={addUser} style={{ padding:'8px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>Add user</button>
                <button onClick={()=>setNewUser(false)} style={{ padding:'8px 16px', borderRadius:'8px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PINS TAB */}
      {activeTab==='pins' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ ...gl.panel, padding:'20px' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:'16px' }}>Finance PIN Management</div>
            {[
              { role:'owner', name:'Ken Mulanya', digits:4 },
              { role:'finance', name:'Miriam Wanjiku', digits:6 },
            ].map((u,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', marginBottom:'10px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'3px' }}>{u.name}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{u.digits}-digit PIN · stored hashed, cannot be displayed</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.30)', marginTop:'2px' }}>
                    Current: <span style={{ fontFamily:'monospace', color:'rgba(129,199,132,0.70)' }}>{localStorage.getItem(`fin_pin_${u.role}`) || `${u.defaultPin} (default)`}</span>
                  </div>
                </div>
                <button onClick={()=>{ localStorage.removeItem(`fin_pin_${u.role}`); sessionStorage.removeItem(`fin_unlocked_${u.role}`); setSaved(`${u.name}'s PIN reset to default`); setTimeout(()=>setSaved(''),2500) }} style={{ padding:'7px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, background:'rgba(239,154,154,0.10)', border:'1px solid rgba(239,154,154,0.25)', color:'rgba(239,154,154,0.80)', cursor:'pointer', fontFamily:'inherit' }}>Reset to default</button>
              </div>
            ))}
            <button onClick={resetPins} style={{ width:'100%', padding:'11px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.80)', cursor:'pointer', fontFamily:'inherit', marginTop:'4px' }}>Reset ALL Finance PINs to defaults</button>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.20)', marginTop:'10px' }}>Note: PINs are stored in the browser on the user's device. Resetting here clears this device only.</div>
          </div>
        </div>
      )}

      {/* INFO TAB */}
      {activeTab==='info' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {[
            { title:'Platform', rows:[['Live URL','psk-admin-platform.onrender.com'],['Custom domain','admin.psksafariskenya.com'],['GitHub','github.com/orenda497-afk/psk-admin-platform'],['Render service','See Render dashboard'],['Supabase project','svijjousbophivmgsftm']] },
            { title:'Access Info (Kevin only)', rows:[['Render API key','Stored in Kevin notes'],['GitHub token','Stored in Kevin notes'],['Supabase URL','https://svijjousbophivmgsftm.supabase.co'],['M-Pesa Paybill','4563877'],['Super admin key','PSK-KEVIN-2026-SUPER']] },
            { title:'Monthly Costs', rows:[['Render (current)','Free (sleeps)'],['Render Starter','$7/month (recommended)'],['Supabase','Free tier'],['Supabase Pro','$25/month (when needed)'],['PSK charges','KES 20,000-25,000/month']] },
            { title:'Daraja Webhook', rows:[['Paybill','4563877'],['Callback URL','https://svijjousbophivmgsftm.supabase.co/functions/v1/mpesa-callback'],['Status','Deploy Edge Function in Supabase'],['Register at','developer.safaricom.co.ke']] },
          ].map((s,i)=>(
            <div key={i} style={{ ...gl.panel, padding:'18px' }}>
              <div style={{ ...gl.lbl, marginBottom:'14px' }}>{s.title}</div>
              {s.rows.map(([k,v],j)=>(
                <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:j<s.rows.length-1?'1px solid rgba(255,255,255,0.06)':'none', gap:'12px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:'11px', fontWeight:500, color:'rgba(255,215,0,0.75)', textAlign:'right', fontFamily:'monospace', wordBreak:'break-all' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
