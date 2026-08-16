import { useNavigate } from 'react-router-dom'
export default function Partners() {
  const navigate = useNavigate()
  const cards = [
    { title:'Drivers & Staff', desc:'All drivers, document tracking, assignments and performance', route:'/partners/drivers', emoji:'🧑‍✈️', color:'rgba(100,181,246,0.35)' },
    { title:'Vehicle Owners', desc:'Private car owners who partner with PSK on 70/30 net profit split', route:'/partners/owners', emoji:'🚙', color:'rgba(255,215,0,0.35)' },
    { title:'Owner Payouts', desc:'Monthly payout tracking and M-Pesa disbursements', route:'/partners/payouts', emoji:'💵', color:'rgba(129,199,132,0.35)' },
    { title:'Owner Portal', desc:'Self-service portal for vehicle owners to view earnings', route:'/partners/portal', emoji:'🔗', color:'rgba(206,147,216,0.35)' },
  ]
  return (
    <div style={{ padding:'24px 28px' }}>
      <div onClick={()=>navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>
      <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'20px' }}>Partners</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
        {cards.map(c => (
          <div key={c.route} onClick={() => navigate(c.route)} style={{ background:'rgba(10,22,34,0.70)', border:`1.5px solid ${c.color}`, borderRadius:'14px', padding:'24px', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLElement).style.boxShadow='0 10px 32px rgba(0,0,0,0.24)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>{c.emoji}</div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'6px' }}>{c.title}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', lineHeight:'1.5' }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
