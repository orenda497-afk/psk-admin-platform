import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import DocumentEditor from '../components/DocumentEditor'

const EXPENSE_ACCOUNTS = ['M-Pesa','Cash','SBM/KEN','KCB','I&M Bank','Written off','Liability','Non Cash Receipts']

const EXPENSE_CATS = [
  'Stationery','Advertisement & Marketing','Meals & Entertainment','Travel/Transport','Cost of Gas/Fuel',
  'Branch Expenses','Repairs & Maintenance','Remittances','Professional Expert','Employees Wages & Deductibles',
  'Insurance','Tires','Licences, Permits & Fees','Shipping','Taxes','Bad Debts','Transactional Costs',
  'Office Cleaning & Hygiene','Park Fees','Office Supplies','Airtime','Furniture','Hire Payments','Commissions',
  'Director\'s Expense',
  'Rent','Charities/Bonus','Renovations & Office Repairs','Computer & Accessories','Web Hosting & Domain',
  'Depreciation','Legal Fees','Interest Income','Income from Other Cars','Cost of Outsourcing Cars',
  'Account Transfer','Miscellaneous/Others',
]

export default function AddExpense({ currentBranch='eldoret', staffName='' }: { currentBranch?:string; staffName?:string }) {
  const [ef, setEf] = useState({
    name: staffName,
    date: new Date().toISOString().split('T')[0],
    account: 'M-Pesa',
    category: 'Cost of Gas/Fuel',
    description: '',
    amount: '' as any,
    branch: currentBranch,
    notes: '',
  })
  const [receipt, setReceipt] = useState('')
  const [editingReceipt, setEditingReceipt] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const camRef = useRef<HTMLInputElement>(null)
  const uplRef = useRef<HTMLInputElement>(null)

  async function save() {
    setErr('')
    if (!ef.name.trim())        { setErr('Your name is required.'); return }
    if (!ef.description.trim()) { setErr('Description is required.'); return }
    if (!ef.amount)             { setErr('Amount is required.'); return }
    setSaving(true)
    const { error } = await supabase.from('expenses').insert([{
      date: ef.date, account: ef.account, category: ef.category, description: ef.description,
      amount: ef.amount, branch: ef.branch, receipt_url: receipt || null, notes: ef.notes || null,
      submitted_by: ef.name.trim(),
    }])
    setSaving(false)
    if (error) { setErr(error.message); return }
    setDone(true)
    setEf({ name: staffName, date: new Date().toISOString().split('T')[0], account:'M-Pesa', category:'Cost of Gas/Fuel', description:'', amount:'' as any, branch:currentBranch, notes:'' })
    setReceipt('')
    setTimeout(() => setDone(false), 3500)
  }

  const wrap: React.CSSProperties = { maxWidth:'560px', margin:'0 auto', padding:'20px 16px 60px' }
  const panel: React.CSSProperties = { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'16px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)', padding:'22px' }
  const lbl: React.CSSProperties = { fontSize:'10px', fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.38)', marginBottom:'8px', display:'block' }
  const input: React.CSSProperties = { width:'100%', padding:'11px 13px', borderRadius:'9px', fontSize:'13px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
  const field = (label: string, children: React.ReactNode, required=false) => (
    <div style={{ marginBottom:'16px' }}>
      <label style={lbl}>{label}{required && <span style={{ color:'rgba(255,183,77,0.90)' }}> *</span>}</label>
      {children}
    </div>
  )

  return (
    <div style={wrap}>
      <div style={{ marginBottom:'18px' }}>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.94)' }}>💸 Add Expense</div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.42)', marginTop:'4px' }}>Log a business expense. Your name is required so Finance knows who submitted it.</div>
      </div>

      <div style={panel}>
        {field('Your Name', (
          <input style={{ ...input, border: !ef.name.trim() ? '1.5px solid rgba(255,183,77,0.45)' : input.border }}
            value={ef.name} placeholder="e.g. Evans Kiptoo"
            onChange={e => setEf(f => ({ ...f, name: e.target.value }))} />
        ), true)}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {field('Date', <input type="date" style={input} value={ef.date} onChange={e => setEf(f => ({ ...f, date: e.target.value }))} />)}
          {field('Branch', (
            <select style={input} value={ef.branch} onChange={e => setEf(f => ({ ...f, branch: e.target.value }))}>
              <option value="eldoret">Eldoret HQ</option>
              <option value="kisumu">Kisumu Branch</option>
            </select>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {field('Account', (
            <select style={input} value={ef.account} onChange={e => setEf(f => ({ ...f, account: e.target.value }))}>
              {EXPENSE_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          ))}
          {field('Category', (
            <select style={input} value={ef.category} onChange={e => setEf(f => ({ ...f, category: e.target.value }))}>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ))}
        </div>

        {field('Description', (
          <input style={input} value={ef.description} placeholder="e.g. Fuel — Shell Eldoret"
            onChange={e => setEf(f => ({ ...f, description: e.target.value }))} />
        ), true)}

        {field('Amount (KES)', (
          <input type="number" style={input} value={ef.amount} placeholder="0"
            onChange={e => setEf(f => ({ ...f, amount: Number(e.target.value) }))} />
        ), true)}

        {field('Receipt (optional)', (
          <>
            <input type="file" accept="image/*" capture="environment" ref={camRef} style={{ display:'none' }}
              onChange={e => { if (e.target.files?.[0]) { const r = new FileReader(); r.onload = ev => { setReceipt(ev.target?.result as string); setEditingReceipt(true) }; r.readAsDataURL(e.target.files[0]) } }} />
            <input type="file" accept="image/*,application/pdf" ref={uplRef} style={{ display:'none' }}
              onChange={e => { if (e.target.files?.[0]) { const r = new FileReader(); r.onload = ev => { setReceipt(ev.target?.result as string); setEditingReceipt(true) }; r.readAsDataURL(e.target.files[0]) } }} />
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <button type="button" onClick={() => camRef.current?.click()} style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.22)', color:'rgba(255,215,0,0.80)' }}>📷 Camera</button>
              <button type="button" onClick={() => uplRef.current?.click()} style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' }}>📁 Upload</button>
              {receipt && <button type="button" onClick={() => setEditingReceipt(true)} style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.20)', color:'rgba(255,215,0,0.75)' }}>✏️ Edit</button>}
              {receipt && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.90)' }}>✓ Attached</span>}
            </div>
            {receipt && <img src={receipt} alt="Receipt" onClick={() => setEditingReceipt(true)} style={{ width:'100%', maxHeight:'140px', objectFit:'cover', borderRadius:'8px', marginTop:'10px', border:'1px solid rgba(255,255,255,0.10)', cursor:'pointer' }} />}
          </>
        ))}

        {field('Notes (optional)', (
          <textarea style={{ ...input, height:'60px', resize:'none' }} value={ef.notes}
            onChange={e => setEf(f => ({ ...f, notes: e.target.value }))} />
        ))}

        {err && <div style={{ fontSize:'12px', color:'rgba(239,154,154,0.90)', marginBottom:'14px', padding:'9px 13px', background:'rgba(231,76,60,0.10)', borderRadius:'8px' }}>{err}</div>}
        {done && <div style={{ fontSize:'12px', color:'rgba(129,199,132,0.90)', marginBottom:'14px', padding:'9px 13px', background:'rgba(45,95,63,0.15)', borderRadius:'8px' }}>✓ Expense saved. Thank you.</div>}

        <button onClick={save} disabled={saving} style={{ width:'100%', padding:'13px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,183,77,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,183,77,0.38)', color:'rgba(255,183,77,0.95)', cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Expense'}
        </button>
      </div>

      {editingReceipt && receipt && (
        <DocumentEditor
          fileUrl={receipt}
          fileName="expense-receipt"
          onClose={() => setEditingReceipt(false)}
          onSave={(edited) => { setReceipt(edited); setEditingReceipt(false) }}
        />
      )}
    </div>
  )
}
