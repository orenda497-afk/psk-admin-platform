import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  lbl: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const EXPENSE_CATS = ['Fuel','Maintenance','Driver allowance','Insurance','Road licence','NTSA Inspection','Office supplies','Marketing','Utilities','Repairs','Tyres','Other']
const MPESA_TYPES  = ['Customer payment','Deposit received','Refund sent','Owner payout','Expense payment','Other']

export default function Finance({ currentBranch='eldoret', defaultTab='dashboard', userRole='owner' }: { currentBranch?:string; defaultTab?:string; userRole?:string }) {
  const navigate = useNavigate()
  const [tab, setTab]           = useState(defaultTab)

  // Sync tab when route changes (e.g. sidebar navigates to /finance/mpesa)
  useEffect(() => { setTab(defaultTab) }, [defaultTab])
  const [docs, setDocs]         = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [mpesa, setMpesa]       = useState<any[]>([])
  const [payouts, setPayouts]   = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [owners, setOwners]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showExp, setShowExp]   = useState(false)
  const [showMp,  setShowMp]    = useState(false)
  const [showPo,  setShowPo]    = useState(false)
  const [receipt, setReceipt]   = useState('')
  const camRef = useRef<HTMLInputElement>(null)
  const uplRef = useRef<HTMLInputElement>(null)

  const [ef, setEf] = useState({ date:new Date().toISOString().split('T')[0], category:'Fuel', description:'', amount:'' as any, vehicle_id:'', branch:currentBranch, notes:'' })
  const [mf, setMf] = useState({ date:new Date().toISOString().split('T')[0], mpesa_ref:'', type:'Customer payment', amount:'' as any, phone:'', name:'', invoice_ref:'', booking_ref:'', branch:currentBranch, notes:'' })
  const [pf, setPf] = useState({ owner_id:'', period:'', vehicle_id:'', gross_revenue:0, expenses:0, method:'M-Pesa', notes:'' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [d,e,m,p,v,o] = await Promise.all([
      supabase.from('psk_documents').select('*').order('created_at',{ascending:false}),
      supabase.from('expenses').select('*').order('date',{ascending:false}),
      supabase.from('mpesa_transactions').select('*').order('date',{ascending:false}),
      supabase.from('owner_payouts').select('*').order('created_at',{ascending:false}),
      supabase.from('vehicles').select('id,reg,make,model,owner_name,branch').order('reg'),
      supabase.from('vehicle_owners').select('id,name,phone,mpesa_number,bank_name').order('name'),
    ])
    if(d.data) setDocs(d.data)
    if(e.data) setExpenses(e.data)
    if(m.data) setMpesa(m.data)
    if(p.data) setPayouts(p.data)
    if(v.data) setVehicles(v.data)
    if(o.data) setOwners(o.data)
    setLoading(false)
  }

  const invoices    = docs.filter(d=>d.doc_type==='invoice')
  const totalRev    = invoices.reduce((s,d)=>s+(d.total||0),0)
  const totalColl   = invoices.filter(d=>d.status==='paid').reduce((s,d)=>s+(d.total||0),0)
  const totalOut    = invoices.filter(d=>d.status!=='paid'&&d.status!=='cancelled').reduce((s,d)=>s+(d.total||0),0)
  const collRate    = totalRev>0?Math.round((totalColl/totalRev)*100):0
  const totalExp    = expenses.reduce((s,e)=>s+(e.amount||0),0)
  const unmatched   = mpesa.filter(m=>!m.matched).length
  const mon         = new Date().toISOString().slice(0,7)
  const monExp      = expenses.filter(e=>e.date?.startsWith(mon)).reduce((s,e)=>s+(e.amount||0),0)

  async function saveExp() {
    if(!ef.description||!ef.amount){alert('Description and amount required');return}
    setSaving(true)
    const {error} = await supabase.from('expenses').insert([{
      date:ef.date, category:ef.category, description:ef.description,
      amount:ef.amount, vehicle_id:ef.vehicle_id||null, branch:ef.branch,
      receipt_url:receipt||null, notes:ef.notes||null,
    }])
    setSaving(false)
    if(!error){setShowExp(false);setReceipt('');setEf({date:new Date().toISOString().split('T')[0],category:'Fuel',description:'',amount:'' as any,vehicle_id:'',branch:currentBranch,notes:''});load()}
    else alert(error.message)
  }

  async function saveMp() {
    if(!mf.mpesa_ref||!mf.amount||!mf.name){alert('M-Pesa ref, amount and sender name required');return}
    setSaving(true)
    const matched = !!(mf.invoice_ref||mf.booking_ref)
    const {error} = await supabase.from('mpesa_transactions').insert([{
      date:mf.date, mpesa_ref:mf.mpesa_ref, type:mf.type, amount:mf.amount,
      phone:mf.phone, name:mf.name, invoice_ref:mf.invoice_ref||null,
      booking_ref:mf.booking_ref||null, branch:mf.branch, notes:mf.notes||null,
      matched, receipt_sent:false,
    }])
    if(!error && matched && mf.invoice_ref) {
      await supabase.from('psk_documents').update({status:'paid',amount_paid:mf.amount,balance:0}).eq('doc_ref',mf.invoice_ref)
      const inv = docs.find(d=>d.doc_ref===mf.invoice_ref)
      if(inv) {
        const rref = `PSK-REC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
        await supabase.from('psk_documents').insert([{
          doc_ref:rref, doc_type:'receipt', branch:inv.branch,
          client_id:inv.client_id, client_name:inv.client_name,
          client_phone:inv.client_phone, client_email:inv.client_email,
          issue_date:new Date().toISOString().split('T')[0],
          line_items:inv.line_items, subtotal:inv.subtotal,
          vat_rate:inv.vat_rate, vat_amount:inv.vat_amount, total:inv.total,
          amount_paid:mf.amount, balance:0,
          notes:`Payment via M-Pesa. Ref: ${mf.mpesa_ref}`,
          linked_doc_ref:mf.invoice_ref, status:'paid',
        }])
        if(inv.client_phone) {
          const ph = inv.client_phone.replace(/\D/g,'')
          const msg = `Dear ${inv.client_name},%0AThank you for your payment!%0AReceipt: ${rref}%0AInvoice: ${mf.invoice_ref}%0AM-Pesa Ref: ${mf.mpesa_ref}%0AAmount: KES ${mf.amount.toLocaleString()}%0ADate: ${new Date().toLocaleDateString('en-GB')}%0APSK Safaris %26 Car Rentals%0ATel: +254 751 855 180`
          window.open(`https://wa.me/${ph}?text=${msg}`,'_blank')
          await supabase.from('mpesa_transactions').update({receipt_sent:true}).eq('mpesa_ref',mf.mpesa_ref)
        }
      }
    }
    setSaving(false)
    if(!error){setShowMp(false);setMf({date:new Date().toISOString().split('T')[0],mpesa_ref:'',type:'Customer payment',amount:'' as any,phone:'',name:'',invoice_ref:'',booking_ref:'',branch:currentBranch,notes:''});load()}
    else alert(error.message)
  }

  async function matchTxn(txn:any, invoiceRef:string) {
    await supabase.from('mpesa_transactions').update({matched:true,invoice_ref:invoiceRef}).eq('id',txn.id)
    await supabase.from('psk_documents').update({status:'paid',amount_paid:txn.amount,balance:0}).eq('doc_ref',invoiceRef)
    const inv = docs.find(d=>d.doc_ref===invoiceRef)
    if(inv) {
      const rref = `PSK-REC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
      await supabase.from('psk_documents').insert([{
        doc_ref:rref, doc_type:'receipt', branch:inv.branch,
        client_id:inv.client_id, client_name:inv.client_name,
        client_phone:inv.client_phone, issue_date:new Date().toISOString().split('T')[0],
        line_items:inv.line_items, subtotal:inv.subtotal, vat_rate:inv.vat_rate,
        vat_amount:inv.vat_amount, total:inv.total, amount_paid:txn.amount, balance:0,
        notes:`Payment via M-Pesa. Ref: ${txn.mpesa_ref}`, linked_doc_ref:invoiceRef, status:'paid',
      }])
      if(inv.client_phone) {
        const ph = inv.client_phone.replace(/\D/g,'')
        const msg = `Dear ${inv.client_name},%0AThank you! Receipt: ${rref}%0AInvoice: ${invoiceRef}%0AM-Pesa: ${txn.mpesa_ref}%0AAmount: KES ${txn.amount?.toLocaleString()}%0APSK Safaris`
        window.open(`https://wa.me/${ph}?text=${msg}`,'_blank')
      }
    }
    await supabase.from('mpesa_transactions').update({receipt_sent:true}).eq('id',txn.id)
    load()
  }

  async function savePo() {
    const own = owners.find(o=>o.id===pf.owner_id)
    if(!own||!pf.period||!pf.gross_revenue){alert('Select owner, period and gross revenue');return}
    const net  = pf.gross_revenue - pf.expenses
    const osh  = Math.round(net*0.7)
    const psh  = Math.round(net*0.3)
    setSaving(true)
    const {error} = await supabase.from('owner_payouts').insert([{
      owner_id:pf.owner_id, owner_name:own.name, vehicle_id:pf.vehicle_id||null,
      period:pf.period, gross_revenue:pf.gross_revenue, expenses:pf.expenses,
      net_revenue:net, owner_share:osh, psk_share:psh,
      paid:false, method:pf.method, notes:pf.notes||null,
    }])
    setSaving(false)
    if(!error){setShowPo(false);setPf({owner_id:'',period:'',vehicle_id:'',gross_revenue:0,expenses:0,method:'M-Pesa',notes:''});load()}
    else alert(error.message)
  }

  async function markPaid(po:any) {
    await supabase.from('owner_payouts').update({paid:true,paid_date:new Date().toISOString().split('T')[0]}).eq('id',po.id)
    const own = owners.find(o=>o.id===po.owner_id)
    if(own?.phone) {
      const ph = own.phone.replace(/\D/g,'')
      const msg = `Dear ${po.owner_name},%0APSK Safaris Payout — ${po.period}%0AGross: KES ${po.gross_revenue?.toLocaleString()}%0AExpenses: KES ${po.expenses?.toLocaleString()}%0ANet: KES ${po.net_revenue?.toLocaleString()}%0AYour 70%%: KES ${po.owner_share?.toLocaleString()}%0APaid via ${po.method}.%0AThank you — PSK Safaris%0ATel: +254 751 855 180`
      window.open(`https://wa.me/${ph}?text=${msg}`,'_blank')
    }
    load()
  }

  const F = (label:string, children:React.ReactNode, req=false) => (
    <div style={{marginBottom:'13px'}}>
      <div style={{fontSize:'10px',fontWeight:600,color:'rgba(255,255,255,0.38)',letterSpacing:'0.5px',marginBottom:'5px',textTransform:'uppercase'}}>
        {label}{req&&<span style={{color:'rgba(239,154,154,0.80)',marginLeft:'3px'}}>*</span>}
      </div>
      {children}
    </div>
  )
  const I = (v:any,s:any,t='text',p='') => <input type={t} value={v} placeholder={p} onChange={e=>s(t==='number'?Number(e.target.value):e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:'9px',fontSize:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.80)',outline:'none',fontFamily:'inherit'}} />
  const S = (v:any,s:any,opts:{value:string;label:string}[]) => <select value={v} onChange={e=>s(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:'9px',fontSize:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.80)',outline:'none',fontFamily:'inherit',cursor:'pointer'}}>{opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>

  const TABS = [{id:'dashboard',label:'Dashboard'},{id:'documents',label:'Documents',go:'/finance/documents'},{id:'mpesa',label:'M-Pesa Recon'},{id:'expenses',label:'Expenses'},{id:'pl',label:'P&L by Vehicle'},{id:'receivables',label:'Receivables'},...(userRole==='owner'?[{id:'payouts',label:'Owner Payouts'}]:[]  ),{id:'monthly',label:'Monthly Summary'},{id:'reports',label:'Reports'}]

  return (
    <div style={{padding:'24px 28px 28px'}}>
      <div onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,215,0,0.70)',fontSize:'12px',fontWeight:500,cursor:'pointer',marginBottom:'18px'}}>← Home</div>
      <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
        {TABS.map(t=><button key={t.id} onClick={()=>(t as any).go?navigate((t as any).go):setTab(t.id)} style={{padding:'7px 15px',borderRadius:'20px',fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',background:tab===t.id?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.05)',border:`1px solid ${tab===t.id?'rgba(255,215,0,0.35)':'rgba(255,255,255,0.10)'}`,color:tab===t.id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.40)'}}>{t.label}</button>)}
      </div>

      {/* DASHBOARD */}
      {tab==='dashboard' && (
        loading ? <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.30)'}}>Loading...</div> :
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'}}>
            {[
              {label:'Total Invoiced',    value:`KES ${totalRev.toLocaleString()}`,   sub:'All invoices',                    c:'rgba(255,215,0,0.90)'},
              {label:'Collected',         value:`KES ${totalColl.toLocaleString()}`,  sub:`${collRate}% collection rate`,    c:'rgba(129,199,132,0.90)'},
              {label:'Outstanding',       value:`KES ${totalOut.toLocaleString()}`,   sub:`${invoices.filter(d=>d.status!=='paid'&&d.status!=='cancelled').length} unpaid`, c:'rgba(239,154,154,0.90)'},
              {label:'Expenses (month)',  value:`KES ${monExp.toLocaleString()}`,     sub:'This month total',                c:'rgba(255,183,77,0.90)'},
            ].map((s,i)=>(
              <div key={i} style={{...gl.panel,padding:'18px'}}>
                <div style={{...gl.lbl,marginBottom:'10px'}}>{s.label}</div>
                <div style={{fontSize:'22px',fontWeight:800,color:s.c,marginBottom:'4px'}}>{s.value}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)'}}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'16px'}}>
            <div style={{...gl.panel,padding:'18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
                <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)'}}>Recent Invoices</div>
                <button onClick={()=>navigate('/finance/documents')} style={{fontSize:'11px',color:'rgba(255,215,0,0.65)',cursor:'pointer',background:'none',border:'none',fontFamily:'inherit'}}>View all →</button>
              </div>
              {invoices.length===0 ? <div style={{textAlign:'center',padding:'30px',color:'rgba(255,255,255,0.25)',fontSize:'12px'}}>No invoices yet</div> : (
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>{['Ref','Client','Amount','Status'].map(h=><th key={h} style={{...gl.lbl,padding:'0 8px 8px',textAlign:h==='Amount'?'right':'left'}}>{h}</th>)}</tr></thead>
                  <tbody>{invoices.slice(0,6).map(d=>{
                    const paid=d.status==='paid'
                    return <tr key={d.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'9px 8px',fontSize:'11px',fontWeight:600,color:'rgba(255,215,0,0.75)'}}>{d.doc_ref}</td>
                      <td style={{padding:'9px 8px',fontSize:'12px',color:'rgba(255,255,255,0.75)'}}>{d.client_name}</td>
                      <td style={{padding:'9px 8px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(255,255,255,0.85)'}}>KES {d.total?.toLocaleString()}</td>
                      <td style={{padding:'9px 8px',textAlign:'right'}}><span style={{fontSize:'10px',fontWeight:600,padding:'2px 8px',borderRadius:'20px',color:paid?'rgba(129,199,132,0.95)':'rgba(239,154,154,0.90)',background:paid?'rgba(129,199,132,0.09)':'rgba(231,76,60,0.07)',border:`1px solid ${paid?'rgba(129,199,132,0.25)':'rgba(231,76,60,0.18)'}`}}>{d.status}</span></td>
                    </tr>
                  })}</tbody>
                </table>
              )}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{...gl.panel,padding:'16px'}}>
                <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)',marginBottom:'12px'}}>Finance Alerts</div>
                {[
                  {dot:'rgba(239,154,154,0.95)',label:`${invoices.filter(d=>d.status!=='paid'&&d.status!=='cancelled').length} unpaid invoices`,sub:`KES ${totalOut.toLocaleString()} outstanding`,go:()=>setTab('receivables')},
                  {dot:'rgba(255,215,0,0.80)',label:`${unmatched} unmatched M-Pesa`,sub:'Need matching to invoices',go:()=>setTab('mpesa')},
                  {dot:'rgba(255,183,77,0.85)',label:`KES ${monExp.toLocaleString()} expenses`,sub:'This month',go:()=>setTab('expenses')},
                ].map((a,i)=>(
                  <div key={i} onClick={a.go} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:'9px',marginBottom:'8px',cursor:'pointer',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:a.dot,flexShrink:0}} />
                    <div style={{flex:1}}>
                      <div style={{fontSize:'12px',fontWeight:600,color:'rgba(255,255,255,0.80)'}}>{a.label}</div>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'1px'}}>{a.sub}</div>
                    </div>
                    <span style={{fontSize:'11px',color:'rgba(255,215,0,0.55)'}}>→</span>
                  </div>
                ))}
              </div>
              <div style={{...gl.panel,padding:'16px'}}>
                <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)',marginBottom:'12px'}}>Quick Actions</div>
                {[
                  {label:'📱 Log M-Pesa payment',go:()=>setShowMp(true),c:'rgba(129,199,132,0.90)',bg:'rgba(129,199,132,0.09)',b:'rgba(129,199,132,0.25)'},
                  {label:'💸 Log expense',       go:()=>setShowExp(true),c:'rgba(255,183,77,0.90)',bg:'rgba(255,183,77,0.08)',b:'rgba(255,183,77,0.25)'},
                  {label:'🧾 New invoice',       go:()=>navigate('/finance/documents'),c:'rgba(100,181,246,0.90)',bg:'rgba(100,181,246,0.08)',b:'rgba(100,181,246,0.25)'},
                ].map((b,i)=><button key={i} onClick={b.go} style={{width:'100%',padding:'10px 14px',borderRadius:'9px',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginBottom:'8px',background:b.bg,border:`1px solid ${b.b}`,color:b.c,textAlign:'left'}}>{b.label}</button>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* M-PESA */}
      {tab==='mpesa' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'16px'}}>
            {[
              {label:'Total received', value:`KES ${mpesa.reduce((s,m)=>s+(m.amount||0),0).toLocaleString()}`, c:'rgba(129,199,132,0.90)'},
              {label:'Matched',        value:`${mpesa.filter(m=>m.matched).length}`,                          c:'rgba(255,215,0,0.80)'},
              {label:'Unmatched',      value:String(unmatched),                                               c:unmatched>0?'rgba(239,154,154,0.90)':'rgba(129,199,132,0.90)'},
              {label:'Receipts sent',  value:`${mpesa.filter(m=>m.receipt_sent).length}`,                    c:'rgba(100,181,246,0.90)'},
            ].map((s,i)=><div key={i} style={{...gl.panel,padding:'14px 16px'}}><div style={{...gl.lbl,marginBottom:'6px'}}>{s.label}</div><div style={{fontSize:'18px',fontWeight:800,color:s.c}}>{s.value}</div></div>)}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
            <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)'}}>M-Pesa Transactions {unmatched>0&&<span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'20px',background:'rgba(239,154,154,0.10)',border:'1px solid rgba(239,154,154,0.25)',color:'rgba(239,154,154,0.90)',marginLeft:'8px'}}>{unmatched} unmatched</span>}</div>
            <button onClick={()=>setShowMp(true)} style={{padding:'7px 16px',borderRadius:'9px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(129,199,132,0.16),rgba(45,95,63,0.09))',border:'1.5px solid rgba(129,199,132,0.32)',color:'rgba(129,199,132,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ Log M-Pesa</button>
          </div>
          <div style={{...gl.panel,padding:'18px'}}>
            {mpesa.length===0 ? (
              <div style={{textAlign:'center',padding:'60px'}}>
                <div style={{fontSize:'36px',marginBottom:'14px'}}>📱</div>
                <div style={{fontSize:'15px',fontWeight:600,color:'rgba(255,255,255,0.50)',marginBottom:'8px'}}>No M-Pesa transactions yet</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.28)',marginBottom:'20px'}}>Log payments received, match to invoices → receipt auto-created → WhatsApp sent to client instantly</div>
                <button onClick={()=>setShowMp(true)} style={{padding:'10px 22px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(129,199,132,0.16),rgba(45,95,63,0.09))',border:'1.5px solid rgba(129,199,132,0.32)',color:'rgba(129,199,132,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ Log first transaction</button>
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{['Date','M-Pesa Ref','Sender','Amount','Invoice','Matched','Receipt','Action'].map(h=><th key={h} style={{...gl.lbl,padding:'0 10px 10px',textAlign:h==='Amount'?'right':'left'}}>{h}</th>)}</tr></thead>
                <tbody>{mpesa.map(m=>(
                  <tr key={m.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:!m.matched?'rgba(239,154,154,0.03)':'transparent'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=!m.matched?'rgba(239,154,154,0.03)':'transparent'}>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(255,255,255,0.60)'}}>{m.date?new Date(m.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'—'}</td>
                    <td style={{padding:'11px 10px',fontSize:'12px',fontWeight:700,color:'rgba(129,199,132,0.80)'}}>{m.mpesa_ref}</td>
                    <td style={{padding:'11px 10px'}}>
                      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.80)'}}>{m.name}</div>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)'}}>{m.phone}</div>
                    </td>
                    <td style={{padding:'11px 10px',textAlign:'right',fontSize:'13px',fontWeight:700,color:'rgba(255,215,0,0.85)'}}>KES {m.amount?.toLocaleString()}</td>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(100,181,246,0.75)'}}>{m.invoice_ref||'—'}</td>
                    <td style={{padding:'11px 10px'}}><span style={{fontSize:'10px',fontWeight:600,padding:'2px 8px',borderRadius:'20px',color:m.matched?'rgba(129,199,132,0.95)':'rgba(239,154,154,0.90)',background:m.matched?'rgba(129,199,132,0.09)':'rgba(231,76,60,0.08)',border:`1px solid ${m.matched?'rgba(129,199,132,0.25)':'rgba(231,76,60,0.20)'}`}}>{m.matched?'✓ Matched':'Unmatched'}</span></td>
                    <td style={{padding:'11px 10px'}}><span style={{fontSize:'10px',color:m.receipt_sent?'rgba(129,199,132,0.80)':'rgba(255,255,255,0.25)'}}>{m.receipt_sent?'✓ Sent':'—'}</span></td>
                    <td style={{padding:'11px 10px'}}>
                      {!m.matched ? <MpesaMatch txn={m} docs={docs} onMatch={matchTxn} /> :
                        <button onClick={()=>{const ph=(m.phone||'').replace(/\D/g,'');window.open(`https://wa.me/${ph}?text=Dear%20${m.name}%2C%20receipt%20for%20M-Pesa%20${m.mpesa_ref}%3A%20KES%20${m.amount?.toLocaleString()}%20-%20PSK%20Safaris`,'_blank')}} style={{padding:'4px 10px',borderRadius:'7px',fontSize:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.22)',color:'rgba(37,211,102,0.80)',cursor:'pointer',fontFamily:'inherit'}}>📱 Resend</button>
                      }
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {tab==='expenses' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'16px'}}>
            {EXPENSE_CATS.slice(0,4).map(cat=>{
              const t = expenses.filter(e=>e.category===cat).reduce((s,e)=>s+(e.amount||0),0)
              return <div key={cat} style={{...gl.panel,padding:'14px 16px'}}><div style={{...gl.lbl,marginBottom:'6px'}}>{cat}</div><div style={{fontSize:'18px',fontWeight:800,color:'rgba(255,183,77,0.90)'}}>KES {t.toLocaleString()}</div></div>
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
            <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)'}}>All Expenses — <span style={{color:'rgba(255,183,77,0.90)'}}>KES {totalExp.toLocaleString()} total</span></div>
            <button onClick={()=>setShowExp(true)} style={{padding:'7px 16px',borderRadius:'9px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,183,77,0.16),rgba(255,149,0,0.09))',border:'1.5px solid rgba(255,183,77,0.32)',color:'rgba(255,183,77,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ Log expense</button>
          </div>
          <div style={{...gl.panel,padding:'18px'}}>
            {expenses.length===0 ? (
              <div style={{textAlign:'center',padding:'60px'}}>
                <div style={{fontSize:'36px',marginBottom:'14px'}}>💸</div>
                <div style={{fontSize:'15px',fontWeight:600,color:'rgba(255,255,255,0.50)',marginBottom:'8px'}}>No expenses logged yet</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.28)',marginBottom:'20px'}}>Track all operating costs — fuel, maintenance, driver allowances, insurance and more</div>
                <button onClick={()=>setShowExp(true)} style={{padding:'10px 22px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,183,77,0.16),rgba(255,149,0,0.09))',border:'1.5px solid rgba(255,183,77,0.32)',color:'rgba(255,183,77,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ Log first expense</button>
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{['Date','Category','Description','Vehicle','Amount','Receipt','Branch'].map(h=><th key={h} style={{...gl.lbl,padding:'0 10px 10px',textAlign:h==='Amount'?'right':'left'}}>{h}</th>)}</tr></thead>
                <tbody>{expenses.map(e=>{
                  const v = vehicles.find(x=>x.id===e.vehicle_id)
                  return <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}} onMouseEnter={x=>(x.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'} onMouseLeave={x=>(x.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(255,255,255,0.55)'}}>{e.date?new Date(e.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'}</td>
                    <td style={{padding:'11px 10px'}}><span style={{fontSize:'10px',fontWeight:600,padding:'2px 8px',borderRadius:'20px',background:'rgba(255,183,77,0.09)',border:'1px solid rgba(255,183,77,0.25)',color:'rgba(255,183,77,0.90)'}}>{e.category}</span></td>
                    <td style={{padding:'11px 10px',fontSize:'12px',color:'rgba(255,255,255,0.80)'}}>{e.description}</td>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(255,215,0,0.60)'}}>{v?`${v.reg} ${v.make}`:'—'}</td>
                    <td style={{padding:'11px 10px',textAlign:'right',fontSize:'13px',fontWeight:700,color:'rgba(255,183,77,0.90)'}}>KES {e.amount?.toLocaleString()}</td>
                    <td style={{padding:'11px 10px'}}>{e.receipt_url?<button onClick={()=>window.open(e.receipt_url,'_blank')} style={{padding:'3px 8px',borderRadius:'6px',fontSize:'10px',background:'rgba(100,181,246,0.08)',border:'1px solid rgba(100,181,246,0.22)',color:'rgba(100,181,246,0.80)',cursor:'pointer',fontFamily:'inherit'}}>📎 View</button>:<span style={{fontSize:'10px',color:'rgba(255,255,255,0.25)'}}>—</span>}</td>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(255,255,255,0.40)'}}>{e.branch==='eldoret'?'Eldoret':'Kisumu'}</td>
                  </tr>
                })}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* P&L */}
      {tab==='pl' && (
        <div style={{...gl.panel,padding:'18px'}}>
          <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)',marginBottom:'4px'}}>P&L by Vehicle — 70/30 Split</div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginBottom:'18px'}}>Revenue from paid invoices minus expenses per vehicle. Owners receive 70% of net.</div>
          {vehicles.length===0 ? <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.30)',fontSize:'12px'}}>No vehicles registered. Add vehicles in Registry Board.</div> : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{['Vehicle','Owner','Revenue','Expenses','Net','Owner 70%','PSK 30%'].map(h=><th key={h} style={{...gl.lbl,padding:'0 10px 10px',textAlign:['Revenue','Expenses','Net','Owner 70%','PSK 30%'].includes(h)?'right':'left'}}>{h}</th>)}</tr></thead>
              <tbody>{vehicles.map(v=>{
                const vRev = docs.filter(d=>d.doc_type==='invoice'&&d.status==='paid').reduce((s,d)=>{
                  const its=Array.isArray(d.line_items)?d.line_items:[] // items
                  return s+(its.some((i:any)=>(i.description||'').toLowerCase().includes(v.reg.toLowerCase()))?(d.total||0):0)
                },0)
                const vExp = expenses.filter(e=>e.vehicle_id===v.id).reduce((s,e)=>s+(e.amount||0),0)
                const net=vRev-vExp; const osh=Math.round(net*0.7); const psh=Math.round(net*0.3)
                const c=net>=0?'rgba(129,199,132,0.90)':'rgba(239,154,154,0.90)'
                return <tr key={v.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{padding:'12px 10px'}}><div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.90)'}}>{v.reg}</div><div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'1px'}}>{v.make} {v.model}</div></td>
                  <td style={{padding:'12px 10px',fontSize:'12px',color:'rgba(255,215,0,0.70)'}}>{v.owner_name||'—'}</td>
                  <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(255,255,255,0.80)'}}>{vRev>0?`KES ${vRev.toLocaleString()}`:'—'}</td>
                  <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(255,183,77,0.80)'}}>{vExp>0?`KES ${vExp.toLocaleString()}`:'—'}</td>
                  <td style={{padding:'12px 10px',textAlign:'right',fontSize:'13px',fontWeight:700,color:c}}>{net!==0?`KES ${net.toLocaleString()}`:'—'}</td>
                  <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(129,199,132,0.85)'}}>{osh>0?`KES ${osh.toLocaleString()}`:'—'}</td>
                  <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(100,181,246,0.85)'}}>{psh>0?`KES ${psh.toLocaleString()}`:'—'}</td>
                </tr>
              })}</tbody>
            </table>
          )}
        </div>
      )}

      {/* RECEIVABLES */}
      {tab==='receivables' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)'}}>Outstanding Receivables</div><div style={{fontSize:'11px',color:'rgba(239,154,154,0.80)',marginTop:'3px'}}>Total outstanding: KES {totalOut.toLocaleString()}</div></div>
            <button onClick={()=>navigate('/finance/documents')} style={{padding:'7px 16px',borderRadius:'9px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))',border:'1.5px solid rgba(255,215,0,0.32)',color:'rgba(255,215,0,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ New invoice</button>
          </div>
          <div style={{...gl.panel,padding:'18px'}}>
            {invoices.filter(d=>d.status!=='paid'&&d.status!=='cancelled').length===0 ? (
              <div style={{textAlign:'center',padding:'60px'}}><div style={{fontSize:'36px',marginBottom:'14px'}}>✅</div><div style={{fontSize:'15px',fontWeight:600,color:'rgba(129,199,132,0.80)'}}>All invoices paid!</div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.28)',marginTop:'8px'}}>No outstanding receivables.</div></div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{['Invoice','Client','Phone','Issued','Amount','Age','Actions'].map(h=><th key={h} style={{...gl.lbl,padding:'0 10px 10px',textAlign:h==='Amount'?'right':'left'}}>{h}</th>)}</tr></thead>
                <tbody>{invoices.filter(d=>d.status!=='paid'&&d.status!=='cancelled').map(d=>{
                  const days=d.issue_date?Math.floor((Date.now()-new Date(d.issue_date).getTime())/86400000):0
                  const ac=days>60?'rgba(239,154,154,0.95)':days>30?'rgba(255,183,77,0.95)':'rgba(255,255,255,0.55)'
                  return <tr key={d.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{padding:'11px 10px',fontSize:'12px',fontWeight:700,color:'rgba(255,215,0,0.80)'}}>{d.doc_ref}</td>
                    <td style={{padding:'11px 10px',fontSize:'12px',color:'rgba(255,255,255,0.80)'}}>{d.client_name}</td>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(255,255,255,0.50)'}}>{d.client_phone||'—'}</td>
                    <td style={{padding:'11px 10px',fontSize:'11px',color:'rgba(255,255,255,0.50)'}}>{d.issue_date}</td>
                    <td style={{padding:'11px 10px',textAlign:'right',fontSize:'13px',fontWeight:700,color:'rgba(239,154,154,0.90)'}}>KES {d.total?.toLocaleString()}</td>
                    <td style={{padding:'11px 10px',fontSize:'12px',fontWeight:600,color:ac}}>{days}d</td>
                    <td style={{padding:'11px 10px'}}>
                      <div style={{display:'flex',gap:'5px'}}>
                        <button onClick={async()=>{await supabase.from('psk_documents').update({status:'paid',amount_paid:d.total,balance:0}).eq('id',d.id);load()}} style={{padding:'4px 9px',borderRadius:'7px',fontSize:'10px',background:'rgba(129,199,132,0.10)',border:'1px solid rgba(129,199,132,0.28)',color:'rgba(129,199,132,0.90)',cursor:'pointer',fontFamily:'inherit'}}>✓ Paid</button>
                        <button onClick={()=>{const ph=(d.client_phone||'').replace(/\D/g,'');const msg=`Dear ${d.client_name},%0AReminder: Invoice ${d.doc_ref} for KES ${d.total?.toLocaleString()} is outstanding.%0APlease settle at your earliest.%0APSK Safaris%0ATel: +254 751 855 180`;window.open(`https://wa.me/${ph}?text=${msg}`,'_blank')}} style={{padding:'4px 9px',borderRadius:'7px',fontSize:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.22)',color:'rgba(37,211,102,0.80)',cursor:'pointer',fontFamily:'inherit'}}>📱</button>
                        {d.client_email&&<button onClick={()=>{const s=encodeURIComponent(`Payment Reminder — ${d.doc_ref}`);const b=encodeURIComponent(`Dear ${d.client_name},\n\nInvoice ${d.doc_ref} for KES ${d.total?.toLocaleString()} is outstanding.\n\nPSK Safaris\n+254 751 855 180`);window.open(`mailto:${d.client_email}?subject=${s}&body=${b}`,'_blank')}} style={{padding:'4px 9px',borderRadius:'7px',fontSize:'10px',background:'rgba(100,181,246,0.08)',border:'1px solid rgba(100,181,246,0.22)',color:'rgba(100,181,246,0.80)',cursor:'pointer',fontFamily:'inherit'}}>✉️</button>}
                      </div>
                    </td>
                  </tr>
                })}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* OWNER PAYOUTS */}
      {tab==='payouts' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)'}}>Owner Payouts</div><div style={{fontSize:'11px',color:'rgba(255,215,0,0.55)',marginTop:'3px'}}>70% of net revenue to vehicle owners</div></div>
            <button onClick={()=>setShowPo(true)} style={{padding:'7px 16px',borderRadius:'9px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))',border:'1.5px solid rgba(255,215,0,0.32)',color:'rgba(255,215,0,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ Calculate payout</button>
          </div>
          <div style={{...gl.panel,padding:'18px'}}>
            {payouts.length===0 ? (
              <div style={{textAlign:'center',padding:'60px'}}><div style={{fontSize:'36px',marginBottom:'14px'}}>💵</div><div style={{fontSize:'15px',fontWeight:600,color:'rgba(255,255,255,0.50)',marginBottom:'8px'}}>No payout records yet</div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.28)',marginBottom:'20px'}}>Calculate monthly payouts based on revenue and expenses</div><button onClick={()=>setShowPo(true)} style={{padding:'10px 22px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))',border:'1.5px solid rgba(255,215,0,0.32)',color:'rgba(255,215,0,0.95)',cursor:'pointer',fontFamily:'inherit'}}>+ First payout</button></div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{['Owner','Period','Gross','Expenses','Net','Owner 70%','PSK 30%','Status','Actions'].map(h=><th key={h} style={{...gl.lbl,padding:'0 10px 10px',textAlign:['Gross','Expenses','Net','Owner 70%','PSK 30%'].includes(h)?'right':'left'}}>{h}</th>)}</tr></thead>
                <tbody>{payouts.map(p=>(
                  <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{padding:'12px 10px',fontSize:'13px',fontWeight:600,color:'rgba(255,255,255,0.90)'}}>{p.owner_name}</td>
                    <td style={{padding:'12px 10px',fontSize:'11px',color:'rgba(255,255,255,0.55)'}}>{p.period}</td>
                    <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',color:'rgba(255,255,255,0.70)'}}>KES {p.gross_revenue?.toLocaleString()}</td>
                    <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',color:'rgba(255,183,77,0.80)'}}>KES {p.expenses?.toLocaleString()}</td>
                    <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(255,255,255,0.80)'}}>KES {p.net_revenue?.toLocaleString()}</td>
                    <td style={{padding:'12px 10px',textAlign:'right',fontSize:'13px',fontWeight:700,color:'rgba(129,199,132,0.90)'}}>KES {p.owner_share?.toLocaleString()}</td>
                    <td style={{padding:'12px 10px',textAlign:'right',fontSize:'12px',fontWeight:600,color:'rgba(100,181,246,0.80)'}}>KES {p.psk_share?.toLocaleString()}</td>
                    <td style={{padding:'12px 10px'}}><span style={{fontSize:'10px',fontWeight:600,padding:'2px 8px',borderRadius:'20px',color:p.paid?'rgba(129,199,132,0.95)':'rgba(255,183,77,0.90)',background:p.paid?'rgba(129,199,132,0.09)':'rgba(255,183,77,0.08)',border:`1px solid ${p.paid?'rgba(129,199,132,0.25)':'rgba(255,183,77,0.25)'}`}}>{p.paid?'Paid':'Pending'}</span></td>
                    <td style={{padding:'12px 10px'}}>
                      {!p.paid?<button onClick={()=>markPaid(p)} style={{padding:'4px 9px',borderRadius:'7px',fontSize:'10px',background:'rgba(129,199,132,0.10)',border:'1px solid rgba(129,199,132,0.28)',color:'rgba(129,199,132,0.90)',cursor:'pointer',fontFamily:'inherit'}}>✓ Paid + 📱</button>:
                        <button onClick={()=>{const o=owners.find(x=>x.id===p.owner_id);if(!o?.phone)return;const ph=o.phone.replace(/\D/g,'');const msg=`Dear ${p.owner_name},%0APSK Payout ${p.period}: KES ${p.owner_share?.toLocaleString()} paid.%0AThank you — PSK Safaris`;window.open(`https://wa.me/${ph}?text=${msg}`,'_blank')}} style={{padding:'4px 9px',borderRadius:'7px',fontSize:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.22)',color:'rgba(37,211,102,0.80)',cursor:'pointer',fontFamily:'inherit'}}>📱 Resend</button>
                      }
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* REPORTS */}
      {tab==='monthly' && (
        <div>
          <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.88)',marginBottom:'4px'}}>Monthly Income & Expenses</div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.40)',marginBottom:'18px'}}>All income from paid invoices + M-Pesa receipts vs expenses logged. Both branches combined.</div>

          {(() => {
            // Build last 12 months
            const months: string[] = []
            for (let i = 11; i >= 0; i--) {
              const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i)
              months.push(d.toISOString().slice(0, 7))
            }

            const rows = months.map(mon => {
              const label = new Date(mon + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
              const income = docs.filter((d:any) => d.status === 'paid' && d.issue_date?.startsWith(mon)).reduce((s:number,d:any) => s + (d.total||0), 0)
              const mpesaIn = mpesa.filter((m:any) => m.date?.startsWith(mon)).reduce((s:number,m:any) => s + (m.amount||0), 0)
              const totalIn = Math.max(income, mpesaIn) // use whichever is higher to avoid double-counting
              const exp = expenses.filter((e:any) => e.date?.startsWith(mon)).reduce((s:number,e:any) => s + (e.amount||0), 0)
              const net = totalIn - exp
              return { mon, label, income: totalIn, expenses: exp, net }
            }).filter(r => r.income > 0 || r.expenses > 0)

            if (rows.length === 0) return (
              <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.35)',fontSize:'13px'}}>
                No data yet. Income appears when invoices are marked paid and expenses are logged.
              </div>
            )

            const totIncome = rows.reduce((s,r)=>s+r.income,0)
            const totExp = rows.reduce((s,r)=>s+r.expenses,0)
            const totNet = totIncome - totExp

            return (
              <div>
                {/* Summary cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
                  {[
                    {label:'Total Income',value:totIncome,color:'rgba(129,199,132,0.95)',bg:'rgba(129,199,132,0.08)',border:'rgba(129,199,132,0.22)'},
                    {label:'Total Expenses',value:totExp,color:'rgba(239,154,154,0.90)',bg:'rgba(231,76,60,0.07)',border:'rgba(231,76,60,0.20)'},
                    {label:'Net Profit',value:totNet,color:totNet>=0?'rgba(255,215,0,0.95)':'rgba(239,154,154,0.90)',bg:totNet>=0?'rgba(255,215,0,0.07)':'rgba(231,76,60,0.07)',border:totNet>=0?'rgba(255,215,0,0.22)':'rgba(231,76,60,0.20)'},
                  ].map(c=>(
                    <div key={c.label} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:'12px',padding:'16px 18px'}}>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>{c.label}</div>
                      <div style={{fontSize:'20px',fontWeight:800,color:c.color}}>KES {c.value.toLocaleString()}</div>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.28)',marginTop:'3px'}}>Last 12 months</div>
                    </div>
                  ))}
                </div>

                {/* Monthly table */}
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',overflow:'hidden'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'rgba(255,255,255,0.05)'}}>
                        {['Month','Income','Expenses','Net Profit','Margin'].map(h=>(
                          <th key={h} style={{padding:'12px 16px',textAlign:h==='Month'?'left':'right',fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:'0.6px'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r,i)=>{
                        const margin = r.income > 0 ? Math.round((r.net/r.income)*100) : 0
                        return (
                          <tr key={r.mon} style={{borderTop:'1px solid rgba(255,255,255,0.05)',background:i%2===0?'transparent':'rgba(255,255,255,0.02)'}}>
                            <td style={{padding:'12px 16px',fontSize:'13px',fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{r.label}</td>
                            <td style={{padding:'12px 16px',textAlign:'right',fontSize:'13px',color:'rgba(129,199,132,0.90)',fontWeight:600}}>KES {r.income.toLocaleString()}</td>
                            <td style={{padding:'12px 16px',textAlign:'right',fontSize:'13px',color:'rgba(239,154,154,0.85)',fontWeight:600}}>KES {r.expenses.toLocaleString()}</td>
                            <td style={{padding:'12px 16px',textAlign:'right',fontSize:'13px',fontWeight:700,color:r.net>=0?'rgba(255,215,0,0.95)':'rgba(239,154,154,0.90)'}}>KES {r.net.toLocaleString()}</td>
                            <td style={{padding:'12px 16px',textAlign:'right',fontSize:'12px',color:margin>=50?'rgba(129,199,132,0.85)':margin>=0?'rgba(255,183,77,0.85)':'rgba(239,154,154,0.85)'}}>{margin}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Export button */}
                <button onClick={()=>{
                  const header = ['Month','Income (KES)','Expenses (KES)','Net Profit (KES)','Margin %']
                  const csvRows = rows.map(r=>[r.label,r.income,r.expenses,r.net,r.income>0?Math.round((r.net/r.income)*100)+'%':'0%'])
                  const csv = [header,...csvRows].map(r=>r.join(',')).join('\n')
                  const b = new Blob([csv],{type:'text/csv'})
                  const a = document.createElement('a'); a.href=URL.createObjectURL(b); a.download='psk_monthly_summary.csv'; a.click()
                }} style={{marginTop:'14px',padding:'10px 20px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,149,0,0.07))',border:'1px solid rgba(255,215,0,0.28)',color:'rgba(255,215,0,0.85)',cursor:'pointer',fontFamily:'inherit'}}>
                  ⬇ Export to CSV
                </button>
              </div>
            )
          })()}
        </div>
      )}

      {tab==='reports' && (
        <div style={{...gl.panel,padding:'40px',textAlign:'center'}}>
          <div style={{fontSize:'36px',marginBottom:'16px'}}>📊</div>
          <div style={{fontSize:'16px',fontWeight:700,color:'rgba(255,255,255,0.70)',marginBottom:'24px'}}>Export Reports</div>
          {[
            {label:'⬇ Export all invoices (CSV)',action:()=>{const rows=[['Ref','Client','Date','Total','Status'],...docs.filter(d=>d.doc_type==='invoice').map(d=>[d.doc_ref,d.client_name,d.issue_date,d.total,d.status])];const csv=rows.map(r=>r.join(',')).join('\n');const b=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='psk_invoices.csv';a.click()}},
            {label:'⬇ Export all expenses (CSV)',action:()=>{const rows=[['Date','Category','Description','Amount','Branch'],...expenses.map(e=>[e.date,e.category,e.description,e.amount,e.branch])];const csv=rows.map(r=>r.join(',')).join('\n');const b=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='psk_expenses.csv';a.click()}},
            {label:'⬇ Export M-Pesa log (CSV)', action:()=>{const rows=[['Date','Ref','Sender','Amount','Matched','Invoice'],...mpesa.map(m=>[m.date,m.mpesa_ref,m.name,m.amount,m.matched?'Yes':'No',m.invoice_ref||''])];const csv=rows.map(r=>r.join(',')).join('\n');const b=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='psk_mpesa.csv';a.click()}},
          ].map((r,i)=><button key={i} onClick={r.action} style={{display:'block',width:'300px',margin:'0 auto 12px',padding:'12px 20px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,149,0,0.07))',border:'1px solid rgba(255,215,0,0.28)',color:'rgba(255,215,0,0.85)',cursor:'pointer',fontFamily:'inherit'}}>{r.label}</button>)}
        </div>
      )}

      {/* EXPENSE MODAL */}
      {showExp && (
        <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)'}}>
          <div style={{background:'rgba(8,18,30,0.97)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'18px',width:'500px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.65)'}}>
            <div style={{padding:'20px 26px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:'15px',fontWeight:700,color:'rgba(255,255,255,0.92)'}}>{editExpId ? '✏️ Edit Expense' : '💸 Log Expense'}</div>
              <button onClick={()=>{setShowExp(false);setReceipt('');setEditExpId(null)}} style={{width:'28px',height:'28px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.45)',cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>
            <div style={{padding:'22px 26px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {F('Date',I(ef.date,(v:string)=>setEf(f=>({...f,date:v})),'date'))}
                {F('Category',S(ef.category,(v:string)=>setEf(f=>({...f,category:v})),EXPENSE_CATS.map(c=>({value:c,label:c}))))}
                {F('Branch',S(ef.branch,(v:string)=>setEf(f=>({...f,branch:v})),[{value:'eldoret',label:'Eldoret HQ'},{value:'kisumu',label:'Kisumu Branch'}]))}
                {F('Vehicle (optional)',S(ef.vehicle_id,(v:string)=>setEf(f=>({...f,vehicle_id:v})),[{value:'',label:'Not vehicle-specific'},...vehicles.map(v=>({value:v.id,label:`${v.reg} — ${v.make} ${v.model}`}))]))}
              </div>
              {F('Description *',I(ef.description,(v:string)=>setEf(f=>({...f,description:v})),'text','e.g. Fuel — Shell Eldoret'),true)}
              {F('Amount (KES) *',I(ef.amount,(v:number)=>setEf(f=>({...f,amount:v})),'number','0'),true)}
              <div style={{marginBottom:'14px'}}>
                <div style={{fontSize:'10px',fontWeight:600,color:'rgba(255,255,255,0.38)',letterSpacing:'0.5px',marginBottom:'8px',textTransform:'uppercase'}}>Receipt (optional)</div>
                <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={e=>{if(e.target.files?.[0]){const r=new FileReader();r.onload=ev=>setReceipt(ev.target?.result as string);r.readAsDataURL(e.target.files![0])}}} style={{display:'none'}} />
                <input type="file" accept="image/*,application/pdf" ref={uplRef} onChange={e=>{if(e.target.files?.[0]){const r=new FileReader();r.onload=ev=>setReceipt(ev.target?.result as string);r.readAsDataURL(e.target.files![0])}}} style={{display:'none'}} />
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <button type="button" onClick={()=>camRef.current?.click()} style={{padding:'7px 14px',borderRadius:'8px',fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',background:'rgba(255,215,0,0.08)',border:'1px solid rgba(255,215,0,0.22)',color:'rgba(255,215,0,0.80)'}}>📷 Camera</button>
                  <button type="button" onClick={()=>uplRef.current?.click()} style={{padding:'7px 14px',borderRadius:'8px',fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.55)'}}>📁 Upload</button>
                  {receipt&&<span style={{fontSize:'11px',color:'rgba(129,199,132,0.90)'}}>✓ Receipt attached</span>}
                </div>
                {receipt&&<img src={receipt} alt="Receipt" style={{width:'100%',maxHeight:'120px',objectFit:'cover',borderRadius:'8px',marginTop:'10px',border:'1px solid rgba(255,255,255,0.10)'}} />}
              </div>
              {F('Notes',<textarea value={ef.notes} onChange={e=>setEf(f=>({...f,notes:e.target.value}))} style={{width:'100%',padding:'10px 12px',borderRadius:'9px',fontSize:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.80)',outline:'none',fontFamily:'inherit',height:'56px',resize:'none'}} />)}
              <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                <button onClick={()=>{setShowExp(false);setReceipt('');setEditExpId(null)}} style={{flex:1,padding:'12px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.55)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                <button onClick={saveExp} disabled={saving} style={{flex:2,padding:'12px',borderRadius:'10px',fontSize:'13px',fontWeight:700,background:'linear-gradient(135deg,rgba(255,183,77,0.18),rgba(255,149,0,0.10))',border:'1.5px solid rgba(255,183,77,0.38)',color:'rgba(255,183,77,0.95)',cursor:saving?'not-allowed':'pointer',fontFamily:'inherit',opacity:saving?0.7:1}}>{saving?'Saving...':'Save Expense'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* M-PESA MODAL */}
      {showMp && (
        <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)'}}>
          <div style={{background:'rgba(8,18,30,0.97)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'18px',width:'500px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.65)'}}>
            <div style={{padding:'20px 26px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:'15px',fontWeight:700,color:'rgba(255,255,255,0.92)'}}>📱 Log M-Pesa Transaction</div><div style={{fontSize:'11px',color:'rgba(129,199,132,0.65)',marginTop:'2px'}}>Match to invoice → receipt auto-created → WhatsApp sent to client</div></div>
              <button onClick={()=>setShowMp(false)} style={{width:'28px',height:'28px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.45)',cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>
            <div style={{padding:'22px 26px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {F('Date',I(mf.date,(v:string)=>setMf(f=>({...f,date:v})),'date'))}
                {F('Type',S(mf.type,(v:string)=>setMf(f=>({...f,type:v})),MPESA_TYPES.map(t=>({value:t,label:t}))))}
                {F('M-Pesa Ref *',I(mf.mpesa_ref,(v:string)=>setMf(f=>({...f,mpesa_ref:v})),'text','e.g. RGJ4K8L9QP'),true)}
                {F('Amount (KES) *',I(mf.amount,(v:number)=>setMf(f=>({...f,amount:v})),'number','0'),true)}
                {F('Sender name *',I(mf.name,(v:string)=>setMf(f=>({...f,name:v})),'text','e.g. JOHN KAMAU'),true)}
                {F('Sender phone',I(mf.phone,(v:string)=>setMf(f=>({...f,phone:v})),'tel','+254...'))}
              </div>
              {F('Match to invoice (triggers receipt + WhatsApp)',S(mf.invoice_ref,(v:string)=>setMf(f=>({...f,invoice_ref:v})),[{value:'',label:'Not matched yet'},...docs.filter(d=>d.doc_type==='invoice'&&d.status!=='paid').map(d=>({value:d.doc_ref,label:`${d.doc_ref} — ${d.client_name} — KES ${d.total?.toLocaleString()}`}))]))}
              {F('Branch',S(mf.branch,(v:string)=>setMf(f=>({...f,branch:v})),[{value:'eldoret',label:'Eldoret HQ'},{value:'kisumu',label:'Kisumu Branch'}]))}
              {F('Notes',<textarea value={mf.notes} onChange={e=>setMf(f=>({...f,notes:e.target.value}))} style={{width:'100%',padding:'10px 12px',borderRadius:'9px',fontSize:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.80)',outline:'none',fontFamily:'inherit',height:'56px',resize:'none'}} />)}
              {mf.invoice_ref&&<div style={{padding:'10px 14px',background:'rgba(129,199,132,0.06)',border:'1px solid rgba(129,199,132,0.20)',borderRadius:'9px',fontSize:'11px',color:'rgba(129,199,132,0.80)',marginBottom:'14px'}}>✓ Will mark invoice paid, create receipt, and open WhatsApp to client</div>}
              <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                <button onClick={()=>setShowMp(false)} style={{flex:1,padding:'12px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.55)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                <button onClick={saveMp} disabled={saving} style={{flex:2,padding:'12px',borderRadius:'10px',fontSize:'13px',fontWeight:700,background:'linear-gradient(135deg,rgba(129,199,132,0.18),rgba(45,95,63,0.10))',border:'1.5px solid rgba(129,199,132,0.38)',color:'rgba(129,199,132,0.95)',cursor:saving?'not-allowed':'pointer',fontFamily:'inherit',opacity:saving?0.7:1}}>{saving?'Saving...':'Log M-Pesa Transaction'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYOUT MODAL */}
      {showPo && (
        <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)'}}>
          <div style={{background:'rgba(8,18,30,0.97)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'18px',width:'460px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.65)'}}>
            <div style={{padding:'20px 26px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:'15px',fontWeight:700,color:'rgba(255,255,255,0.92)'}}>💵 Calculate Owner Payout</div><div style={{fontSize:'11px',color:'rgba(255,215,0,0.55)',marginTop:'2px'}}>Owner receives 70% of net revenue</div></div>
              <button onClick={()=>setShowPo(false)} style={{width:'28px',height:'28px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.45)',cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>
            <div style={{padding:'22px 26px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {F('Vehicle Owner *',S(pf.owner_id,(v:string)=>setPf(f=>({...f,owner_id:v})),[{value:'',label:'Select owner...'},...owners.map(o=>({value:o.id,label:o.name}))]))}
                {F('Period *',I(pf.period,(v:string)=>setPf(f=>({...f,period:v})),'text','e.g. January 2026'))}
                {F('Vehicle',S(pf.vehicle_id,(v:string)=>setPf(f=>({...f,vehicle_id:v})),[{value:'',label:'All vehicles'},...vehicles.map(v=>({value:v.id,label:`${v.reg} ${v.make}`}))]))}
                {F('Payment method',S(pf.method,(v:string)=>setPf(f=>({...f,method:v})),[{value:'M-Pesa',label:'M-Pesa'},{value:'Bank',label:'Bank transfer'},{value:'Cash',label:'Cash'}]))}
                {F('Gross Revenue (KES) *',I(pf.gross_revenue,(v:number)=>setPf(f=>({...f,gross_revenue:v})),'number','0'),true)}
                {F('Direct Expenses (KES)',I(pf.expenses,(v:number)=>setPf(f=>({...f,expenses:v})),'number','0'))}
              </div>
              {pf.gross_revenue>0&&(
                <div style={{padding:'14px 16px',background:'rgba(255,215,0,0.06)',border:'1px solid rgba(255,215,0,0.20)',borderRadius:'10px',marginBottom:'16px'}}>
                  <div style={{fontSize:'10px',fontWeight:600,color:'rgba(255,215,0,0.55)',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:'10px'}}>Payout Calculation</div>
                  {[
                    {label:'Gross Revenue',value:`KES ${pf.gross_revenue.toLocaleString()}`},
                    {label:'Less: Expenses',value:`KES ${pf.expenses.toLocaleString()}`},
                    {label:'Net Revenue',value:`KES ${(pf.gross_revenue-pf.expenses).toLocaleString()}`},
                    {label:'Owner 70%',value:`KES ${Math.round((pf.gross_revenue-pf.expenses)*0.7).toLocaleString()}`,gold:true},
                    {label:'PSK 30%',value:`KES ${Math.round((pf.gross_revenue-pf.expenses)*0.3).toLocaleString()}`},
                  ].map((r,i,arr)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.07)':'none'}}><span style={{fontSize:'11px',color:'rgba(255,255,255,0.45)'}}>{r.label}</span><span style={{fontSize:'12px',fontWeight:(r as any).gold?800:600,color:(r as any).gold?'rgba(255,215,0,0.95)':'rgba(255,255,255,0.75)'}}>{r.value}</span></div>)}
                </div>
              )}
              {F('Notes',<textarea value={pf.notes} onChange={e=>setPf(f=>({...f,notes:e.target.value}))} style={{width:'100%',padding:'10px 12px',borderRadius:'9px',fontSize:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.80)',outline:'none',fontFamily:'inherit',height:'56px',resize:'none'}} />)}
              <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                <button onClick={()=>setShowPo(false)} style={{flex:1,padding:'12px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.55)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                <button onClick={savePo} disabled={saving} style={{flex:2,padding:'12px',borderRadius:'10px',fontSize:'13px',fontWeight:700,background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))',border:'1.5px solid rgba(255,215,0,0.38)',color:'rgba(255,215,0,0.95)',cursor:saving?'not-allowed':'pointer',fontFamily:'inherit',opacity:saving?0.7:1}}>{saving?'Saving...':'Save Payout Record'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MpesaMatch({txn,docs,onMatch}:{txn:any;docs:any[];onMatch:(t:any,r:string)=>void}) {
  const [sel,setSel]=useState('')
  const unpaid=docs.filter(d=>d.doc_type==='invoice'&&d.status!=='paid')
  return <div style={{display:'flex',gap:'5px'}}>
    <select value={sel} onChange={e=>setSel(e.target.value)} style={{padding:'4px 8px',borderRadius:'7px',fontSize:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.75)',outline:'none',fontFamily:'inherit',cursor:'pointer',maxWidth:'120px'}}>
      <option value="">Match to...</option>
      {unpaid.map(d=><option key={d.id} value={d.doc_ref}>{d.doc_ref}</option>)}
    </select>
    {sel&&<button onClick={()=>onMatch(txn,sel)} style={{padding:'4px 9px',borderRadius:'7px',fontSize:'10px',background:'rgba(129,199,132,0.10)',border:'1px solid rgba(129,199,132,0.28)',color:'rgba(129,199,132,0.90)',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Match + Receipt</button>}
  </div>
}
