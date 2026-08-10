import { useNavigate } from 'react-router-dom'
const gl = { panel:{ background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties, label:{ fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' } }
export default function Settings() {
  const navigate = useNavigate()
  const BRANCHES = {
    eldoret: { name:'PSK Safaris & Car Rentals', branch:'Eldoret HQ', address:'64 Plaza, Eldoret', poBox:'P.O. Box 5079-30100', tel1:'+254 751 855 180', tel2:'+254 741 186 538', pin:'P051664556P' },
    kisumu:  { name:'PSK Safaris & Car Rentals', branch:'Kisumu Branch', address:'174 Pamba Road, Tom Mboya', poBox:'', tel1:'+254 741 186 538', tel2:'+254 740 355 180', pin:'P051664556P' },
  }
  return (
    <div style={{ padding:'24px 28px' }}>
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'18px' }}>← Home</div>
      <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'20px' }}>Settings</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {/* Branch details */}
        {Object.entries(BRANCHES).map(([key, b]) => (
          <div key={key} style={{ ...gl.panel, padding:'20px' }}>
            <div style={{ ...gl.label, marginBottom:'14px' }}>{b.branch}</div>
            {[['Company name', b.name],['Address', b.address],['P.O. Box', b.poBox || '—'],['Tel 1', b.tel1],['Tel 2', b.tel2],['Company PIN', b.pin]].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{l}</span>
                <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.75)' }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
        {/* Ratecard */}
        <div style={{ ...gl.panel, padding:'20px' }}>
          <div style={{ ...gl.label, marginBottom:'14px' }}>PSK Ratecard (KES)</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}><th style={{ ...gl.label, padding:'0 0 10px', textAlign:'left' }}>Vehicle Class</th><th style={{ ...gl.label, padding:'0 0 10px', textAlign:'right' }}>Driver only</th><th style={{ ...gl.label, padding:'0 0 10px', textAlign:'right' }}>≤100km</th><th style={{ ...gl.label, padding:'0 0 10px', textAlign:'right' }}>≤300km</th></tr></thead>
            <tbody>
              {[['Saloon Car',5500,9500,13500],['Rav 4',8500,13500,17500],['Noah',9500,14500,18500],['Prado',15000,20000,25000],['Land Cruiser',20000,26000,32000],['Van 11-seater',12000,17000,24000],['Van 14-seater',18000,24000,28000],['Coaster 22-seater',25000,32000,38000]].map(([name,...rates])=>(
                <tr key={name as string} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding:'9px 0', fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>{name}</td>
                  {(rates as number[]).map((r,i)=><td key={i} style={{ padding:'9px 0', textAlign:'right', fontSize:'12px', color:'rgba(255,215,0,0.70)', fontWeight:600 }}>{r.toLocaleString()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:'14px', paddingTop:'14px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:'24px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>Self-drive ≤250km: <span style={{ color:'rgba(255,215,0,0.70)', fontWeight:600 }}>KES 4,000/day</span></div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>Self-drive ≤500km: <span style={{ color:'rgba(255,215,0,0.70)', fontWeight:600 }}>KES 4,500/day</span></div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>Overnight driver: <span style={{ color:'rgba(255,215,0,0.70)', fontWeight:600 }}>KES 2,500/night</span></div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)' }}>VAT: <span style={{ color:'rgba(255,215,0,0.70)', fontWeight:600 }}>16%</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
