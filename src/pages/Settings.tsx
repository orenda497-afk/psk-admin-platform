import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  lbl: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const BRANCHES = {
  eldoret: { name:'PSK Safaris & Car Rentals', branch:'Eldoret HQ', address:'64 Plaza, Eldoret', poBox:'P.O. Box 5079-30100', tel1:'+254 751 855 180', tel2:'+254 741 186 538', email:'info@psksafariskenya.com', pin:'P051664556P' },
  kisumu:  { name:'PSK Safaris & Car Rentals', branch:'Kisumu Branch', address:'174 Pamba Road, Tom Mboya, Kisumu', poBox:'', tel1:'+254 741 186 538', tel2:'+254 740 355 180', email:'info@psksafariskenya.com', pin:'P051664556P' },
}

const RATECARD = [
  { cl:'Saloon Car',        d:5500,  f1:9500,  f3:13500 },
  { cl:'Rav 4',             d:8500,  f1:13500, f3:17500 },
  { cl:'Noah',              d:9500,  f1:14500, f3:18500 },
  { cl:'Prado',             d:15000, f1:20000, f3:25000 },
  { cl:'Land Cruiser',      d:20000, f1:26000, f3:32000 },
  { cl:'Van 11-seater',     d:12000, f1:17000, f3:24000 },
  { cl:'Van 14-seater',     d:18000, f1:24000, f3:28000 },
  { cl:'Coaster 22-seater', d:25000, f1:32000, f3:38000 },
]

const ROLES = [
  { name:'Ken Mulanya',    title:'Owner',                     access:'Full access — all branches, all sections including Owner Payouts', pin:'4-digit PIN', c:'rgba(255,215,0,0.90)' },
  { name:'Miriam Wanjiku', title:'Finance Manager (Eldoret)', access:'All branches read, full Finance access', pin:'6-digit code', c:'rgba(100,181,246,0.90)' },
  { name:'Faith',          title:'Kisumu Branch Manager',     access:'Read and edit both branches, can book and amend Eldoret', pin:'6-digit code', c:'rgba(129,199,132,0.90)' },
]

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{k}</span>
      <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)', textAlign:'right' }}>{v}</span>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const [sec, setSec] = useState('company')

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>
      <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'20px' }}>Settings</div>

      <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
        {[['company','Company Info'],['ratecard','Ratecard'],['roles','Roles'],['system','System']].map(([id,label])=>(
          <button key={id} onClick={()=>setSec(id)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:sec===id?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${sec===id?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`, color:sec===id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)' }}>{label}</button>
        ))}
      </div>

      {sec==='company' && (
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
              <Row k="Address" v={b.address} />
              <Row k="P.O. Box" v={b.poBox || 'N/A'} />
              <Row k="Tel 1" v={b.tel1} />
              <Row k="Tel 2" v={b.tel2} />
              <Row k="Email" v={b.email} />
              <Row k="Company PIN" v={b.pin} />
            </div>
          ))}
          <div style={{ ...gl.panel, padding:'14px 18px', fontSize:'11px', color:'rgba(255,215,0,0.55)', lineHeight:'1.6' }}>
            Branch details auto-fill all documents, letterheads and reports. To update, contact the platform administrator.
          </div>
        </div>
      )}

      {sec==='ratecard' && (
        <div style={{ ...gl.panel, padding:'20px' }}>
          <div style={{ ...gl.lbl, marginBottom:'16px' }}>PSK Safaris Ratecard (KES per day)</div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'16px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ ...gl.lbl, padding:'0 12px 12px', textAlign:'left' }}>Vehicle Class</th>
                <th style={{ ...gl.lbl, padding:'0 12px 12px', textAlign:'right' }}>Driver only</th>
                <th style={{ ...gl.lbl, padding:'0 12px 12px', textAlign:'right' }}>With fuel up to 100km</th>
                <th style={{ ...gl.lbl, padding:'0 12px 12px', textAlign:'right' }}>With fuel up to 300km</th>
              </tr>
            </thead>
            <tbody>
              {RATECARD.map((r,i) => (
                <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'11px 12px', fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{r.cl}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.85)' }}>{r.d.toLocaleString()}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.85)' }}>{r.f1.toLocaleString()}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.85)' }}>{r.f3.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
            {[
              { label:'Self-drive (up to 250km/day)', value:'KES 4,000' },
              { label:'Self-drive (up to 500km/day)', value:'KES 4,500' },
              { label:'Overnight driver',              value:'KES 2,500/night' },
              { label:'VAT',                           value:'16% (optional toggle)' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'9px', padding:'12px 14px' }}>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'4px' }}>{s.label}</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,215,0,0.85)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec==='roles' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ ...gl.panel, padding:'14px 18px', fontSize:'12px', color:'rgba(255,215,0,0.70)', lineHeight:'1.7' }}>
            The Finance section is PIN-protected. The Owner Payouts tab is completely hidden from non-owner roles — not just locked, but absent from the page.
          </div>
          {ROLES.map((r,i) => (
            <div key={i} style={{ ...gl.panel, padding:'18px', borderLeft:`4px solid ${r.c}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{r.name}</div>
                  <div style={{ fontSize:'11px', color:r.c, marginTop:'2px' }}>{r.title}</div>
                </div>
                <span style={{ fontSize:'10px', fontWeight:600, padding:'4px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.50)', alignSelf:'flex-start' }}>{r.pin}</span>
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6' }}>{r.access}</div>
            </div>
          ))}
        </div>
      )}

      {sec==='system' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ ...gl.panel, padding:'18px' }}>
            <div style={{ ...gl.lbl, marginBottom:'14px' }}>Platform</div>
            <Row k="Product" v="PSK Safaris Admin Platform" />
            <Row k="Version" v="1.0.0" />
            <Row k="Built by" v="Kevin (SaaS Owner)" />
            <Row k="Deployed on" v="Render" />
            <Row k="Database" v="Supabase (PostgreSQL)" />
            <Row k="GitHub" v="github.com/orenda497-afk/psk-admin-platform" />
          </div>
          <div style={{ ...gl.panel, padding:'18px' }}>
            <div style={{ ...gl.lbl, marginBottom:'14px' }}>Hosting</div>
            <Row k="Live URL" v="psk-admin-platform.onrender.com" />
            <Row k="Custom domain" v="admin.psksafariskenya.com" />
            <Row k="Hosting" v="Render (free tier - sleeps after inactivity)" />
            <Row k="Database" v="Supabase (free tier)" />
            <Row k="DNS" v="Hostinger CNAME" />
            <Row k="Upgrade" v="Render $7/month Starter removes sleeping" />
          </div>
          <div style={{ ...gl.panel, padding:'18px' }}>
            <div style={{ ...gl.lbl, marginBottom:'14px' }}>Database Tables (15 total)</div>
            <Row k="clients" v="All client profiles (4 types)" />
            <Row k="vehicles" v="Fleet registry" />
            <Row k="drivers" v="Driver profiles and document expiry" />
            <Row k="vehicle_owners" v="Private car owner partners" />
            <Row k="bookings" v="All bookings" />
            <Row k="psk_documents" v="Invoices, quotations, receipts, credit and debit notes" />
            <Row k="rental_agreements" v="Digital rental agreements" />
            <Row k="handover_checklists" v="Check-out and check-in records" />
            <Row k="maintenance_logs" v="Vehicle service history" />
            <Row k="fuel_logs" v="Fuel consumption records" />
            <Row k="expenses" v="All operating expenses" />
            <Row k="mpesa_transactions" v="M-Pesa payments and reconciliation" />
            <Row k="owner_payouts" v="70/30 payout records" />
            <Row k="reminders" v="Auto and manual reminders" />
            <Row k="audit_log" v="System audit trail (run SQL to enable)" />
          </div>
        </div>
      )}
    </div>
  )
}
