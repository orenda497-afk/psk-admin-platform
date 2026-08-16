import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const TIP = { contentStyle:{ background:'rgba(6,16,28,0.96)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', fontSize:'11px' }, labelStyle:{ color:'rgba(255,255,255,0.80)' }, itemStyle:{ color:'rgba(255,255,255,0.65)' } }

export default function Analytics() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles]   = useState<any[]>([])
  const [bookings, setBookings]   = useState<any[]>([])
  const [docs, setDocs]           = useState<any[]>([])
  const [expenses, setExpenses]   = useState<any[]>([])
  const [clients, setClients]     = useState<any[]>([])
  const [services, setServices]   = useState<any[]>([])
  const [fuel, setFuel]           = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [v,b,d,e,c,s,f] = await Promise.all([
      supabase.from('vehicles').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('psk_documents').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('maintenance_logs').select('*'),
      supabase.from('fuel_logs').select('*'),
    ])
    if(v.data) setVehicles(v.data)
    if(b.data) setBookings(b.data)
    if(d.data) setDocs(d.data)
    if(e.data) setExpenses(e.data)
    if(c.data) setClients(c.data)
    if(s.data) setServices(s.data)
    if(f.data) setFuel(f.data)
    setLoading(false)
  }

  // ── COMPUTED ANALYTICS ──
  const invoices = docs.filter(d=>d.doc_type==='invoice')
  const totalRevenue = invoices.filter(d=>d.status==='paid').reduce((s,d)=>s+(d.total||0),0)
  const totalExpenses = expenses.reduce((s,e)=>s+(e.amount||0),0)
  const netProfit = totalRevenue - totalExpenses
  const available = vehicles.filter(v=>v.status==='available').length
  const onHire    = vehicles.filter(v=>['chauffeured','safari','self-drive','airport'].includes(v.status)).length
  const utilRate  = vehicles.length > 0 ? Math.round((onHire/vehicles.length)*100) : 0

  // Bookings by trip type
  const tripTypes = ['chauffeured','safari','self-drive','airport']
  const bookingsByType = tripTypes.map(t => ({
    name: t.charAt(0).toUpperCase()+t.slice(1),
    value: bookings.filter(b=>b.trip_type===t).length,
  })).filter(t=>t.value>0)

  // Revenue by month (from paid invoices)
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-5+i)
    return { key:d.toISOString().slice(0,7), label:d.toLocaleDateString('en-GB',{month:'short'}) }
  })
  const revenueByMonth = months.map(m => ({
    month: m.label,
    revenue: invoices.filter(d=>d.status==='paid'&&d.issue_date?.startsWith(m.key)).reduce((s,d)=>s+(d.total||0),0),
    expenses: expenses.filter(e=>e.date?.startsWith(m.key)).reduce((s,e)=>s+(e.amount||0),0),
  }))

  // Expenses by category
  const expCats = [...new Set(expenses.map(e=>e.category))].map(cat=>({
    name: cat,
    value: expenses.filter(e=>e.category===cat).reduce((s,e)=>s+(e.amount||0),0),
  })).filter(c=>c.value>0).sort((a,b)=>b.value-a.value)

  // Vehicle status breakdown
  const statusData = [
    { name:'Available',  value:vehicles.filter(v=>v.status==='available').length,  color:'rgba(129,199,132,0.85)' },
    { name:'Out on hire',value:onHire,                                               color:'rgba(100,181,246,0.85)' },
    { name:'In service', value:vehicles.filter(v=>v.status==='service').length,     color:'rgba(255,183,77,0.85)' },
    { name:'Grounded',   value:vehicles.filter(v=>v.status==='grounded').length,    color:'rgba(239,154,154,0.85)' },
  ].filter(s=>s.value>0)

  // Clients by type
  const clientTypes = ['individual','corporate','agency','government'].map(t=>({
    name: t.charAt(0).toUpperCase()+t.slice(1),
    value: clients.filter(c=>c.type===t).length,
  })).filter(c=>c.value>0)

  // Top vehicles by bookings
  const vehicleBookings = vehicles.map(v=>({
    reg: v.reg, make: v.make, model: v.model,
    bookings: bookings.filter(b=>b.vehicle_id===v.id).length,
    services: services.filter(s=>s.vehicle_id===v.id).length,
  })).sort((a,b)=>b.bookings-a.bookings).slice(0,6)

  const PIE_COLORS = ['rgba(255,215,0,0.85)','rgba(129,199,132,0.85)','rgba(100,181,246,0.85)','rgba(206,147,216,0.85)','rgba(255,183,77,0.85)','rgba(239,154,154,0.85)']

  if (loading) return (
    <div style={{padding:'24px 28px'}}>
      <div style={{textAlign:'center',padding:'80px',color:'rgba(255,255,255,0.30)',fontSize:'12px'}}>Loading analytics...</div>
    </div>
  )

  const noData = vehicles.length===0 && bookings.length===0 && docs.length===0

  return (
    <div style={{padding:'24px 28px 28px'}}>
      <div onClick={()=>navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

      {noData ? (
        <div style={{...gl.panel,padding:'60px',textAlign:'center'}}>
          <div style={{fontSize:'40px',marginBottom:'16px'}}>📊</div>
          <div style={{fontSize:'16px',fontWeight:700,color:'rgba(255,255,255,0.55)',marginBottom:'8px'}}>No data yet</div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.28)',marginBottom:'24px'}}>Analytics populate automatically as you add vehicles, bookings, invoices and expenses. Start using the platform and check back here.</div>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
            {[{label:'Register vehicles',go:'/registry'},{label:'Add clients',go:'/clients/individual'},{label:'Create bookings',go:'/bookings'},{label:'Log expenses',go:'/finance'}].map((b,i)=>(
              <button key={i} onClick={()=>navigate(b.go)} style={{padding:'9px 18px',borderRadius:'9px',fontSize:'11px',fontWeight:600,background:'rgba(255,215,0,0.08)',border:'1px solid rgba(255,215,0,0.22)',color:'rgba(255,215,0,0.80)',cursor:'pointer',fontFamily:'inherit'}}>{b.label}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px',marginBottom:'20px'}}>
            {[
              {label:'Total Revenue',    value:`KES ${totalRevenue.toLocaleString()}`,  sub:'From paid invoices',      c:'rgba(255,215,0,0.90)'},
              {label:'Total Expenses',   value:`KES ${totalExpenses.toLocaleString()}`, sub:'All categories',          c:'rgba(255,183,77,0.90)'},
              {label:'Net Profit',       value:`KES ${netProfit.toLocaleString()}`,     sub:'Revenue minus expenses',  c:netProfit>=0?'rgba(129,199,132,0.90)':'rgba(239,154,154,0.90)'},
              {label:'Fleet Utilisation',value:`${utilRate}%`,                          sub:`${onHire} of ${vehicles.length} on hire`, c:'rgba(100,181,246,0.90)'},
              {label:'Total Clients',    value:String(clients.length),                  sub:`${bookings.length} bookings total`, c:'rgba(206,147,216,0.90)'},
            ].map((s,i)=>(
              <div key={i} style={{...gl.panel,padding:'16px'}}>
                <div style={{...gl.label,marginBottom:'8px'}}>{s.label}</div>
                <div style={{fontSize:'20px',fontWeight:800,color:s.c,marginBottom:'3px'}}>{s.value}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.32)'}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Revenue vs Expenses — 6 months */}
          <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <div style={{...gl.panel,padding:'20px'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,0.80)',marginBottom:'16px'}}>📈 Revenue vs Expenses — Last 6 months</div>
              {revenueByMonth.every(m=>m.revenue===0&&m.expenses===0) ? (
                <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No financial data yet. Create paid invoices and log expenses to see trends.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueByMonth} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.30)" tick={{fontSize:10}} />
                    <YAxis stroke="rgba(255,255,255,0.30)" tick={{fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                    <Tooltip {...TIP} formatter={(v:any)=>`KES ${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{fontSize:'11px'}} />
                    <Bar dataKey="revenue" name="Revenue" fill="rgba(129,199,132,0.75)" radius={[4,4,0,0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="rgba(255,183,77,0.70)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Fleet status donut */}
            <div style={{...gl.panel,padding:'20px'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,0.80)',marginBottom:'16px'}}>🚗 Fleet Status</div>
              {statusData.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No vehicles registered yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                      {statusData.map((s,i)=><Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip {...TIP} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            {/* Bookings by trip type */}
            <div style={{...gl.panel,padding:'20px'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,0.80)',marginBottom:'16px'}}>📅 Bookings by Type</div>
              {bookingsByType.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No bookings yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={bookingsByType} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                      {bookingsByType.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...TIP} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Expenses by category */}
            <div style={{...gl.panel,padding:'20px'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,0.80)',marginBottom:'16px'}}>💸 Top Expense Categories</div>
              {expCats.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No expenses logged yet.</div>
              ) : (
                expCats.slice(0,6).map((c,i)=>{
                  const pct = Math.round((c.value/totalExpenses)*100)
                  return (
                    <div key={i} style={{marginBottom:'10px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontSize:'11px',color:'rgba(255,255,255,0.65)'}}>{c.name}</span>
                        <span style={{fontSize:'11px',fontWeight:600,color:'rgba(255,183,77,0.85)'}}>KES {c.value.toLocaleString()}</span>
                      </div>
                      <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.07)'}}>
                        <div style={{height:'100%',borderRadius:'2px',background:`rgba(255,183,77,${0.4+pct/200})`,width:`${pct}%`,transition:'width 0.5s'}} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Clients by type */}
            <div style={{...gl.panel,padding:'20px'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,0.80)',marginBottom:'16px'}}>👥 Clients by Type</div>
              {clientTypes.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No clients registered yet.</div>
              ) : (
                clientTypes.map((c,i)=>{
                  const pct = Math.round((c.value/clients.length)*100)
                  return (
                    <div key={i} style={{marginBottom:'12px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontSize:'11px',color:'rgba(255,255,255,0.65)'}}>{c.name}</span>
                        <span style={{fontSize:'11px',fontWeight:600,color:'rgba(255,215,0,0.80)'}}>{c.value} ({pct}%)</span>
                      </div>
                      <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.07)'}}>
                        <div style={{height:'100%',borderRadius:'2px',background:PIE_COLORS[i],width:`${pct}%`,transition:'width 0.5s'}} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Top vehicles table */}
          <div style={{...gl.panel,padding:'20px'}}>
            <div style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,0.80)',marginBottom:'16px'}}>🏆 Vehicle Performance</div>
            {vehicleBookings.length===0 ? (
              <div style={{textAlign:'center',padding:'30px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No vehicles registered yet.</div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    {['Vehicle','Make/Model','Bookings','Services','Utilisation'].map(h=>(
                      <th key={h} style={{...gl.label,padding:'0 12px 10px',textAlign:h==='Bookings'||h==='Services'||h==='Utilisation'?'right':'left'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicleBookings.map((v,i)=>{
                    const bar = bookings.length>0?Math.round((v.bookings/Math.max(...vehicleBookings.map(x=>x.bookings),1))*100):0
                    return (
                      <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                        <td style={{padding:'11px 12px',fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.90)'}}>{v.reg}</td>
                        <td style={{padding:'11px 12px',fontSize:'12px',color:'rgba(255,255,255,0.55)'}}>{v.make} {v.model}</td>
                        <td style={{padding:'11px 12px',textAlign:'right',fontSize:'13px',fontWeight:700,color:'rgba(255,215,0,0.85)'}}>{v.bookings}</td>
                        <td style={{padding:'11px 12px',textAlign:'right',fontSize:'12px',color:'rgba(255,183,77,0.75)'}}>{v.services}</td>
                        <td style={{padding:'11px 12px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'flex-end'}}>
                            <div style={{width:'80px',height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.07)'}}>
                              <div style={{height:'100%',borderRadius:'2px',background:'rgba(129,199,132,0.70)',width:`${bar}%`}} />
                            </div>
                            <span style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',width:'28px',textAlign:'right'}}>{bar}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
