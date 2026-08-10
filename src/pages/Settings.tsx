import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const BRANCHES = {
  eldoret: { name:'PSK Safaris & Car Rentals', branch:'Eldoret HQ', address:'64 Plaza, Eldoret', poBox:'P.O. Box 5079-30100', tel1:'+254 751 855 180', tel2:'+254 741 186 538', email:'info@psksafariskenya.com', pin:'P051664556P', website:'www.psksafariskenya.com' },
  kisumu:  { name:'PSK Safaris & Car Rentals', branch:'Kisumu Branch', address:'174 Pamba Road, Tom Mboya, Kisumu', poBox:'', tel1:'+254 741 186 538', tel2:'+254 740 355 180', email:'info@psksafariskenya.com', pin:'P051664556P', website:'www.psksafariskenya.com' },
}

const RATECARD = [
  { class:'Saloon Car',        driverOnly:5500,  fuel100:9500,  fuel300:13500  },
  { class:'Rav 4',             driverOnly:8500,  fuel100:13500, fuel300:17500  },
  { class:'Noah',              driverOnly:9500,  fuel100:14500, fuel300:18500  },
  { class:'Prado',             driverOnly:15000, fuel100:20000, fuel300:25000  },
  { class:'Land Cruiser',      driverOnly:20000, fuel100:26000, fuel300:32000  },
  { class:'Van 11-seater',     driverOnly:12000, fuel100:17000, fuel300:24000  },
  { class:'Van 14-seater',     driverOnly:18000, fuel100:24000, fuel300:28000  },
  { class:'Coaster 22-seater', driverOnly:25000, fuel100:32000, fuel300:38000  },
]

const ROLES = [
  { role:'Ken Mulanya',    title:'Owner',                         access:'Full access — all branches, all sections including Finance Owner Payouts', pin:'4-digit PIN', color:'rgba(255,215,0,0.90)' },
  { role:'Miriam Wanjiku', title:'Finance Manager (Eldoret)',     access:'All branches read access, full Finance access', pin:'6-digit generated code', color:'rgba(100,181,246,0.90)' },
  { role:'Faith',          title:'Kisumu Branch Manager',         access:'Read + edit both branches, can book and amend Eldoret bookings', pin:'6-digit generated code', color:'rgba(129,199,132,0.90)' },
]

export default function Settings() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('company')

  const sections = [
    { id:'company',  label:'Company Info' },
    { id:'ratecard', label:'Ratecard' },
    { id:'roles',    label:'Roles & Access' },
    { id:'system',   label:'System' },
  ]

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>
      <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'20px' }}>Settings</div>

      {/* Section tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:activeSection===s.id?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${activeSection===s.id?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:activeSection===s.id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{s.label}</button>
        ))}
      </div>

      {/* COMPANY INFO */}
      {activeSection==='company' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {Object.entries(BRANCHES).map(([key, b]) => (
            <div key={key} style={{ ...gl.panel, padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <img src="/branding/psk-logo.png" alt="PSK" style={{ width:'44px', height:'44px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,215,0,0.25)' }} />
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{b.name}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.65)', marginTop:'2px' }}>{b.branch}</div>
                </div>
              </div>
              {[
                ['Address',      b.address],
                ['P.O. Box',     b.poBox || '—'],
                ['Tel 1',        b.tel1],
                ['Tel 2',        b.tel2],
                ['Email',        b.email],
                ['Website',      b.website],
                ['Company PIN',  b.pin],
              ].map(([l,v],i,arr)=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none', gap:'12px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{l}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.78)', textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ ...gl.panel, padding:'14px 18px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)', lineHeight:'1.6' }}>
              ⚙️ To update company details, contact the platform administrator. Branch details auto-fill all documents, letterheads and reports.
            </div>
          </div>
        </div>
      )}

      {/* RATECARD */}
      {activeSection==='ratecard' && (
        <div style={{ ...gl.panel, padding:'20px' }}>
          <div style={{ ...gl.label, marginBottom:'16px' }}>PSK Safaris Ratecard (KES per day)</div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'16px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Vehicle Class','Driver only (no fuel)','With fuel ≤100km','With fuel ≤300km'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 12px 12px', textAlign:h==='Vehicle Class'?'left':'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATECARD.map((r,i)=>(
                <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'11px 12px', fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{r.class}</td>
                  {[r.driverOnly, r.fuel100, r.fuel300].map((v,j)=>(
                    <td key={j} style={{ padding:'11px 12px', textAlign:'right', fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.85)' }}>
                      {v.toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label:'Self-drive ≤250km/day', value:'KES 4,000' },
              { label:'Self-drive ≤500km/day', value:'KES 4,500' },
              { label:'Overnight driver',       value:'KES 2,500/night' },
              { label:'VAT',                    value:'16% (optional)' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'9px', padding:'12px 14px' }}>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'4px' }}>{s.label}</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,215,0,0.85)' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'14px', padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'9px', fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
            ⚙️ Ratecard is locked in the system and auto-applies to bookings. To update rates, contact the platform administrator.
          </div>
        </div>
      )}

      {/* ROLES & ACCESS */}
      {activeSection==='roles' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ ...gl.panel, padding:'16px', marginBottom:'4px' }}>
            <div style={{ fontSize:'12px', color:'rgba(255,215,0,0.70)', lineHeight:'1.7' }}>
              🔒 Finance section is PIN-protected. Each role has a different access level. The Owner Payouts tab is completely hidden from non-owner roles — not just locked, but absent from the DOM.
            </div>
          </div>
          {ROLES.map((r,i)=>(
            <div key={i} style={{ ...gl.panel, padding:'18px', borderLeft:`4px solid ${r.color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{r.role}</div>
                  <div style={{ fontSize:'11px', color:r.color, marginTop:'2px' }}>{r.title}</div>
                </div>
                <div style={{ fontSize:'10px', fontWeight:600, padding:'4px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.50)', alignSelf:'flex-start' }}>{r.pin}</div>
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6' }}>{r.access}</div>
            </div>
          ))}
        </div>
      )}

      {/* SYSTEM */}
      {activeSection==='system' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {[
            { title:'Platform', items:[['Product','PSK Safaris Admin Platform'],['Version','1.0.0'],['Built by','Kevin (SaaS Owner)'],['Deployed on','Render'],['Database','Supabase (PostgreSQL)'],['GitHub','github.com/orenda497-afk/psk-admin-platform']] },
            { title:'Hosting', items:[['Live URL','psk-admin-platform.onrender.com'],['Custom domain','admin.psksafariskenya.com'],['Hosting','Render (free tier)'],['Database','Supabase (free tier)'],['File storage','Supabase Storage'],['DNS','Hostinger (CNAME)'],['Render upgrade','$7/month Starter recommended — stops sleep']] },
            { title:'Supabase Tables', items:[['clients','Client profiles — all 4 types'],['vehicles','Fleet registry'],['drivers','Driver profiles + document expiry'],['vehicle_owners','Private car owner partners'],['bookings','All bookings'],['psk_documents','Invoices, quotations, receipts, credit/debit notes'],['rental_agreements','Digital rental agreements'],['handover_checklists','Check-out/check-in + photos'],['maintenance_logs','Vehicle service history'],['fuel_logs','Fuel consumption records'],['expenses','All operating expenses'],['mpesa_transactions','M-Pesa payments + reconciliation'],['owner_payouts','70/30 payout records'],['reminders','Auto + manual reminders'],['audit_log','System audit trail (create with SQL)']]] },
          ].map((section,i)=>(
            <div key={i} style={{ ...gl.panel, padding:'18px' }}>
              <div style={{ ...gl.label, marginBottom:'14px' }}>{section.title}</div>
              {section.items.map(([k,v],j,arr)=>(
                <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:j<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none', gap:'16px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:'11px', fontWeight:500, color:'rgba(255,255,255,0.65)', textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
