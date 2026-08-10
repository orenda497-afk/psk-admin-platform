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
      <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,215,0,0.70)', fontSize:'12px', fontWeight:500, cursor:'pointer', marginBottom:'24px' }}>← Home</div>
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
