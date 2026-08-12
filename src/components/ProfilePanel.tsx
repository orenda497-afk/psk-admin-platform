import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface ProfilePanelProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
  userRole: string
  userName: string
  userEmail: string
  userTitle: string
  userBranch: string
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner', finance: 'Finance Manager', manager: 'Branch Manager',
  ops: 'Operations', intern: 'Intern',
}
const ROLE_COLOR: Record<string, string> = {
  owner: '#FFD700', finance: '#64B5F6', manager: '#81C784',
  ops: '#CE93D8', intern: '#9E9E9E',
}

const AVATAR_OPTIONS = ['🦁','🐆','🦒','🦓','🐘','🦏','🦅','🌍','🌿','⚡','🔥','💎','🏔️','🌊','🎯']

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const STORAGE_KEY = (email: string) => `psk_avatar_${email}`

export default function ProfilePanel({
  open, onClose, onLogout,
  userRole, userName, userEmail, userTitle, userBranch,
}: ProfilePanelProps) {
  const [tab, setTab] = useState<'profile'|'password'|'pin'>('profile')

  // Avatar
  const [avatar, setAvatar] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(userTitle || '')
  const [titleSaved, setTitleSaved] = useState(false)

  // Password change
  const [showCurPw, setShowCurPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConPw, setShowConPw] = useState(false)
  const [curPw, setCurPw]         = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg]         = useState('')
  const [pwErr, setPwErr]         = useState('')
  const [pwBusy, setPwBusy]       = useState(false)

  // Finance PIN
  const [newPin, setNewPin]         = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinStep, setPinStep]       = useState<'new'|'confirm'>('new')
  const [pinMsg, setPinMsg]         = useState('')
  const [pinErr, setPinErr]         = useState('')
  const [pinBusy, setPinBusy]       = useState(false)

  const [lastLogin, setLastLogin] = useState('')
  const pinLength = 4
  const canFinance = ['owner','finance'].includes(userRole)
  const color = ROLE_COLOR[userRole] || '#FFD700'

  useEffect(() => {
    if (!open) return
    setTab('profile')
    setPwMsg(''); setPwErr(''); setCurPw(''); setNewPw(''); setConfirmPw('')
    setPinMsg(''); setPinErr(''); setNewPin(''); setConfirmPin(''); setPinStep('new')
    setShowAvatarPicker(false); setEditingTitle(false); setTitleSaved(false)
    setTitleVal(userTitle || '')

    // Load saved avatar
    const saved = localStorage.getItem(STORAGE_KEY(userEmail))
    if (saved) {
      if (saved.startsWith('data:') || saved.startsWith('http')) setPhotoUrl(saved)
      else setAvatar(saved)
    }

    // Last login
    ;(async () => {
      const { data } = await supabase.from('audit_log').select('created_at')
        .eq('action','Signed in').order('created_at',{ascending:false}).limit(2)
      if (data && data.length >= 2) {
        const d = new Date(data[1].created_at)
        setLastLogin(d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}) +
          ' at ' + d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}))
      } else setLastLogin('First login')
    })()
  }, [open, userEmail, userTitle])

  function pickEmoji(e: string) {
    setAvatar(e); setPhotoUrl('')
    localStorage.setItem(STORAGE_KEY(userEmail), e)
    setShowAvatarPicker(false)
  }

  function handlePhoto(file: File) {
    const r = new FileReader()
    r.onload = ev => {
      const url = ev.target?.result as string
      setPhotoUrl(url); setAvatar('')
      localStorage.setItem(STORAGE_KEY(userEmail), url)
      setShowAvatarPicker(false)
    }
    r.readAsDataURL(file)
  }

  async function saveTitle() {
    if (!titleVal.trim()) return
    const { error } = await supabase.from('profiles')
      .update({ title: titleVal.trim() }).eq('email', userEmail)
    if (!error) {
      setTitleSaved(true); setEditingTitle(false)
      setTimeout(() => setTitleSaved(false), 2000)
    }
  }

  async function handleChangePassword() {
    setPwErr(''); setPwMsg('')
    if (!curPw) { setPwErr('Enter your current password.'); return }
    if (newPw.length < 8) { setPwErr('New password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setPwErr('Passwords do not match.'); return }
    if (newPw === curPw) { setPwErr('New password must be different.'); return }
    setPwBusy(true)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: curPw })
    if (signInErr) { setPwBusy(false); setPwErr('Current password is incorrect.'); return }
    const { error: updErr } = await supabase.auth.updateUser({ password: newPw })
    setPwBusy(false)
    if (updErr) { setPwErr(updErr.message || 'Could not update password.'); return }
    await supabase.from('profiles').update({ must_change_pw: false }).eq('email', userEmail)
    setPwMsg('Password changed successfully.')
    setCurPw(''); setNewPw(''); setConfirmPw('')
  }

  async function handleSetPin() {
    setPinErr(''); setPinMsg('')
    if (!/^[0-9]+$/.test(newPin) || newPin.length !== pinLength) {
      setPinErr(`PIN must be exactly ${pinLength} digits.`); return
    }
    if (pinStep === 'new') { setPinStep('confirm'); return }
    if (confirmPin !== newPin) {
      setPinErr('PINs do not match. Try again.')
      setNewPin(''); setConfirmPin(''); setPinStep('new'); return
    }
    setPinBusy(true)
    const { error } = await supabase.rpc('set_finance_pin', { new_pin: newPin })
    setPinBusy(false)
    if (error) { setPinErr(error.message || 'Could not save PIN.'); return }
    sessionStorage.removeItem(`fin_unlocked_${userRole}`)
    setPinMsg('Finance PIN updated successfully.')
    setNewPin(''); setConfirmPin(''); setPinStep('new')
  }

  // Shared input style
  const inpStyle: React.CSSProperties = {
    width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'13px',
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
    color:'rgba(255,255,255,0.88)', outline:'none', fontFamily:'inherit',
    marginBottom:'10px', boxSizing:'border-box',
  }

  const pwField = (val: string, set: (v:string)=>void, placeholder: string, show: boolean, setShow: (v:boolean)=>void) => (
    <div style={{ marginBottom:'10px' }}>
      <div style={{ position:'relative' }}>
        <input type={show?'text':'password'} value={val} placeholder={placeholder}
          onChange={e => set(e.target.value)}
          style={{ ...inpStyle, marginBottom:0, paddingRight:'44px' }} />
        <button type="button" onClick={()=>setShow(!show)}
          style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.28)',
            fontSize:'9px', letterSpacing:'0.3px', lineHeight:1, padding:'3px 4px',
            fontFamily:'inherit', whiteSpace:'nowrap' }}>
          {show ? 'HIDE' : 'SHOW'}
        </button>
      </div>
    </div>
  )

  const btn = (label: string, onClick: ()=>void, busy=false, danger=false) => (
    <button onClick={onClick} disabled={busy}
      style={{ width:'100%', padding:'11px', borderRadius:'10px', fontSize:'13px',
        fontWeight:700, cursor:busy?'not-allowed':'pointer', fontFamily:'inherit',
        opacity:busy?0.55:1, marginTop:'4px',
        background: danger ? 'rgba(231,76,60,0.12)' : 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))',
        border: danger ? '1.5px solid rgba(231,76,60,0.35)' : '1.5px solid rgba(255,215,0,0.38)',
        color: danger ? 'rgba(239,154,154,0.90)' : 'rgba(255,215,0,0.95)',
      }}>{busy ? 'Please wait…' : label}</button>
  )

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200,
        background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }} />

      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:'310px', zIndex:201,
        background:'rgba(8,18,30,0.97)', borderRight:'1.5px solid rgba(255,215,0,0.15)',
        boxShadow:'6px 0 40px rgba(0,0,0,0.60)', display:'flex', flexDirection:'column',
        backdropFilter:'blur(24px)', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ padding:'28px 22px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.45)',
              letterSpacing:'1px', textTransform:'uppercase' }}>My Profile</div>
            <button onClick={onClose} style={{ background:'none', border:'none',
              color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'18px' }}>✕</button>
          </div>

          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div onClick={() => setShowAvatarPicker(v=>!v)}
                style={{ width:'60px', height:'60px', borderRadius:'50%', cursor:'pointer',
                  background: photoUrl ? 'transparent' : `linear-gradient(135deg,${color}22,${color}44)`,
                  border:`2px solid ${color}66`, display:'flex', alignItems:'center',
                  justifyContent:'center', overflow:'hidden',
                  boxShadow:`0 0 20px ${color}33`, fontSize: photoUrl ? undefined : avatar ? '28px' : '20px',
                  fontWeight:800, color }}>
                {photoUrl
                  ? <img src={photoUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : avatar || initials(userName)}
              </div>
              <div onClick={() => setShowAvatarPicker(v=>!v)}
                style={{ position:'absolute', bottom:0, right:0, width:'18px', height:'18px',
                  borderRadius:'50%', background:'rgba(255,215,0,0.85)', border:'1.5px solid rgba(0,0,0,0.4)',
                  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                  fontSize:'10px' }}>✏️</div>
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.93)',
                marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName}</div>

              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', marginBottom:'5px' }}>
                {titleVal || userTitle || ROLE_LABEL[userRole] || userRole}
                {titleSaved && <span style={{ color:'rgba(129,199,132,0.80)', fontSize:'10px', marginLeft:'4px' }}>✓ saved</span>}
              </div>

              <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px',
                  background:`${color}18`, color, border:`1px solid ${color}44` }}>
                  {ROLE_LABEL[userRole] || userRole}
                </span>
                <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px',
                  background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.45)',
                  border:'1px solid rgba(255,255,255,0.12)', textTransform:'capitalize' }}>
                  📍 {userBranch}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar picker */}
          {showAvatarPicker && (
            <div style={{ marginTop:'14px', padding:'14px', borderRadius:'12px',
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', marginBottom:'10px',
                fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Choose avatar</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px', marginBottom:'10px' }}>
                {AVATAR_OPTIONS.map(e => (
                  <button key={e} onClick={()=>pickEmoji(e)}
                    style={{ fontSize:'22px', padding:'6px', borderRadius:'8px', cursor:'pointer',
                      background: avatar===e ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.05)',
                      border: avatar===e ? '1.5px solid rgba(255,215,0,0.50)' : '1px solid rgba(255,255,255,0.10)' }}>
                    {e}
                  </button>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
              <button onClick={()=>fileRef.current?.click()}
                style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px',
                  fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                  color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>
                📷 Upload a photo instead
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', padding:'12px 16px 0',
          borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {([['profile','Profile'],['password','Password'],...(canFinance?[['pin','Finance PIN']]:[])] as [string,string][]).map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id as any)}
              style={{ padding:'7px 12px', borderRadius:'8px 8px 0 0', fontSize:'12px', fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', border:'none', marginBottom:'-1px',
                background: tab===id ? 'rgba(255,215,0,0.10)' : 'transparent',
                color: tab===id ? 'rgba(255,215,0,0.90)' : 'rgba(255,255,255,0.35)',
                borderBottom: tab===id ? '2px solid rgba(255,215,0,0.60)' : '2px solid transparent',
              }}>{label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:'20px' }}>

          {/* PROFILE */}
          {tab==='profile' && (
            <div>
              {[['Full name',userName],['Email',userEmail],
                ['Role',ROLE_LABEL[userRole]||userRole],
                ['Branch',userBranch.charAt(0).toUpperCase()+userBranch.slice(1)],
                ['Last sign-in',lastLogin||'—']
              ].map(([label,value])=>(
                <div key={label} style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'10px', fontWeight:600, letterSpacing:'1px',
                    textTransform:'uppercase', color:'rgba(255,255,255,0.30)', marginBottom:'4px' }}>{label}</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.82)',
                    fontWeight:label==='Full name'?600:400 }}>{value}</div>
                </div>
              ))}
              {/* Title editor */}
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'10px', fontWeight:600, letterSpacing:'1px',
                  textTransform:'uppercase', color:'rgba(255,255,255,0.30)', marginBottom:'8px' }}>Job Title</div>
                <input value={titleVal} onChange={e=>setTitleVal(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') saveTitle() }}
                  placeholder="e.g. Operations Manager"
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'13px',
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)',
                    color:'rgba(255,255,255,0.88)', outline:'none', fontFamily:'inherit',
                    boxSizing:'border-box', marginBottom:'10px' }} />
                <button onClick={saveTitle}
                  style={{ width:'100%', padding:'12px', borderRadius:'10px', fontSize:'14px',
                    fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    background:'linear-gradient(135deg,rgba(255,215,0,0.25),rgba(255,149,0,0.18))',
                    border:'2px solid rgba(255,215,0,0.60)',
                    color:'rgba(255,215,0,1)', letterSpacing:'0.3px' }}>
                  Save Title
                </button>
                {titleSaved && <div style={{ fontSize:'12px', color:'rgba(129,199,132,0.90)',
                  marginTop:'8px', textAlign:'center' }}>✓ Title saved successfully</div>}
              </div>

              <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)', fontSize:'11px',
                color:'rgba(255,255,255,0.28)', lineHeight:'1.6' }}>
                To change your name, role or branch contact Kevin.
              </div>
            </div>
          )}

          {/* PASSWORD */}
          {tab==='password' && (
            <div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginBottom:'18px', lineHeight:'1.6' }}>
                Choose a strong password — at least 8 characters.
              </div>
              {pwField(curPw, setCurPw, 'Current password', showCurPw, setShowCurPw)}
              {pwField(newPw, setNewPw, 'New password (min 8 chars)', showNewPw, setShowNewPw)}
              {pwField(confirmPw, setConfirmPw, 'Confirm new password', showConPw, setShowConPw)}
              {pwErr && <div style={{ fontSize:'12px', color:'rgba(239,154,154,0.90)', marginBottom:'10px',
                padding:'8px 12px', background:'rgba(231,76,60,0.10)', borderRadius:'8px' }}>{pwErr}</div>}
              {pwMsg && <div style={{ fontSize:'12px', color:'rgba(129,199,132,0.90)', marginBottom:'10px',
                padding:'8px 12px', background:'rgba(45,95,63,0.15)', borderRadius:'8px' }}>{pwMsg}</div>}
              {btn('Update password', handleChangePassword, pwBusy)}
            </div>
          )}

          {/* FINANCE PIN */}
          {tab==='pin' && canFinance && (
            <div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginBottom:'18px', lineHeight:'1.6' }}>
                {pinStep==='new'
                  ? `Choose a new ${pinLength}-digit Finance PIN.`
                  : 'Enter your new PIN again to confirm.'}
              </div>
              <input type="password" value={pinStep==='new'?newPin:confirmPin}
                onChange={e=>pinStep==='new'?setNewPin(e.target.value):setConfirmPin(e.target.value)}
                placeholder={`${pinLength}-digit PIN`} maxLength={pinLength}
                style={inpStyle} />
              {pinErr && <div style={{ fontSize:'12px', color:'rgba(239,154,154,0.90)', marginBottom:'10px',
                padding:'8px 12px', background:'rgba(231,76,60,0.10)', borderRadius:'8px' }}>{pinErr}</div>}
              {pinMsg && <div style={{ fontSize:'12px', color:'rgba(129,199,132,0.90)', marginBottom:'10px',
                padding:'8px 12px', background:'rgba(45,95,63,0.15)', borderRadius:'8px' }}>{pinMsg}</div>}
              {btn(pinStep==='new'?'Continue':'Save PIN', handleSetPin, pinBusy)}
              {pinStep==='confirm' && (
                <button onClick={()=>{setPinStep('new');setNewPin('');setConfirmPin('');setPinErr('')}}
                  style={{ width:'100%', marginTop:'8px', padding:'9px', borderRadius:'9px', fontSize:'11px',
                    background:'transparent', border:'1px solid rgba(255,255,255,0.10)',
                    color:'rgba(255,255,255,0.35)', cursor:'pointer', fontFamily:'inherit' }}>
                  ← Start over
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sign out */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          {btn('🚪  Sign out', ()=>{ if(window.confirm('Sign out of PSK Admin?')) onLogout() }, false, true)}
        </div>
      </div>
    </>
  )
}
