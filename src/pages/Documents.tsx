import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type DocType = 'quotation' | 'invoice' | 'receipt' | 'credit_note' | 'debit_note'
type DocStatus = 'draft' | 'sent' | 'paid' | 'accepted' | 'rejected' | 'expired' | 'cancelled'

interface LineItem { description: string; qty: number; unitPrice: number }

interface PSKDocument {
  id: string
  doc_ref: string
  doc_type: DocType
  branch: 'eldoret' | 'kisumu'
  client_id?: string
  client_name: string
  client_phone?: string
  client_email?: string
  client_address?: string
  booking_ref?: string
  issue_date: string
  due_date?: string
  valid_until?: string
  line_items: LineItem[]
  subtotal: number
  vat_rate: number
  vat_amount: number
  total: number
  amount_paid?: number
  balance?: number
  notes?: string
  status: DocStatus
  linked_doc_ref?: string
  created_at: string
}

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)', boxShadow:'0 4px 24px rgba(0,0,0,0.22)' } as React.CSSProperties,
  label: { fontSize:'9px', fontWeight:600, letterSpacing:'1.2px', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.32)' },
}

const DOC_CONFIG: Record<DocType,{label:string;prefix:string;color:string;bg:string;border:string;emoji:string}> = {
  quotation:   { label:'Quotation',   prefix:'PSK-Q',   color:'rgba(255,215,0,0.95)',  bg:'rgba(255,215,0,0.09)',  border:'rgba(255,215,0,0.28)',  emoji:'📄' },
  invoice:     { label:'Invoice',     prefix:'PSK-INV', color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.09)', border:'rgba(100,181,246,0.28)', emoji:'🧾' },
  receipt:     { label:'Receipt',     prefix:'PSK-REC', color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.28)', emoji:'✅' },
  credit_note: { label:'Credit Note', prefix:'PSK-CN',  color:'rgba(206,147,216,0.95)', bg:'rgba(206,147,216,0.09)', border:'rgba(206,147,216,0.28)', emoji:'🔵' },
  debit_note:  { label:'Debit Note',  prefix:'PSK-DN',  color:'rgba(255,183,77,0.95)',  bg:'rgba(255,183,77,0.09)',  border:'rgba(255,183,77,0.28)',  emoji:'🔴' },
}

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;border:string}> = {
  draft:     { label:'',     color:'transparent', bg:'transparent', border:'transparent' },
  sent:      { label:'Sent',      color:'rgba(100,181,246,0.95)', bg:'rgba(100,181,246,0.08)', border:'rgba(100,181,246,0.25)' },
  paid:      { label:'Paid',      color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  accepted:  { label:'Accepted',  color:'rgba(129,199,132,0.95)', bg:'rgba(129,199,132,0.09)', border:'rgba(129,199,132,0.25)' },
  rejected:  { label:'Rejected',  color:'rgba(239,154,154,0.80)', bg:'rgba(231,76,60,0.07)',   border:'rgba(231,76,60,0.18)'   },
  expired:   { label:'Expired',   color:'rgba(150,150,150,0.70)', bg:'rgba(150,150,150,0.06)', border:'rgba(150,150,150,0.15)' },
  cancelled: { label:'Cancelled', color:'rgba(150,150,150,0.70)', bg:'rgba(150,150,150,0.06)', border:'rgba(150,150,150,0.15)' },
}

const BRANCHES = {
  eldoret: { name:'PSK Safaris & Car Rentals', branch:'Eldoret HQ', address:'64 Plaza, Eldoret', poBox:'P.O. Box 5079-30100', tel:'+254 751 855 180 / +254 741 186 538', email:'info@psksafaris.com', pin:'P051664556P' },
  kisumu:  { name:'PSK Safaris & Car Rentals', branch:'Kisumu Branch', address:'174 Pamba Road, Tom Mboya, Kisumu', poBox:'', tel:'+254 741 186 538 / +254 740 355 180', email:'info@psksafaris.co.ke', pin:'P051664556P' },
}

const emptyItem = (): LineItem => ({ description: '', qty: 1, unitPrice: 0 })

export default function Documents({ defaultTab }: { defaultTab?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [docs, setDocs]           = useState<PSKDocument[]>([])
  const [clients, setClients]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [activeTab, setActiveTab] = useState<DocType>((defaultTab as DocType) || 'quotation')
  const [showAdd, setShowAdd]     = useState(false)
  const [previewDoc, setPreviewDoc] = useState<PSKDocument | null>(null)
  const [editDoc, setEditDoc]     = useState<PSKDocument | null>(null)

  const [form, setForm] = useState({
    doc_type: 'quotation' as DocType,
    branch: 'eldoret',
    client_id: '', client_name: '', client_phone: '', client_email: '', client_address: '',
    booking_ref: '', issue_date: new Date().toISOString().split('T')[0],
    due_date: '', valid_until: '',
    vat_rate: 0,
    notes: '',
    linked_doc_ref: '',
    trip_purpose: '', trip_vehicle_type: '', trip_pickup_location: '', trip_dropoff_location: '',
    trip_pickup_datetime: '', trip_return_datetime: '', trip_days: '', trip_passengers: '', trip_instructions: '',
    rec_received_from: '', rec_amount_words: '', rec_payment_for: '', rec_payment_method: 'M-Pesa', rec_mpesa_ref: '', rec_vehicle_plate: '', rec_vehicle_model: '',
    line_items: [emptyItem()] as LineItem[],
  })

  useEffect(() => { loadAll() }, [])
  useEffect(() => {
    const st = location.state as any
    if (st?.openAdd) {
      setActiveTab((st.docType as any) || activeTab)
      setShowAdd(true)
      if (st.clientName) setForm(f => ({ ...f, client_name: st.clientName || '', client_phone: st.clientPhone || '', doc_type: st.docType || f.doc_type }))
    }
  }, [location.state])

  async function loadAll() {
    setLoading(true)
    const [d, c] = await Promise.all([
      supabase.from('psk_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name, phone, email, address, city').order('name'),
    ])
    if (d.data) setDocs(d.data as PSKDocument[])
    if (c.data) setClients(c.data)
    setLoading(false)
  }

  const subtotal = form.line_items.reduce((s, i) => s + (i.qty * i.unitPrice), 0)
  const vatAmt   = subtotal * (form.vat_rate / 100)
  const total    = subtotal + vatAmt

  function onClientSelect(clientId: string) {
    const c = clients.find(x => x.id === clientId)
    if (!c) return
    setForm(f => ({ ...f, client_id: clientId, client_name: c.name, client_phone: c.phone || '', client_email: c.email || '', client_address: c.address ? `${c.address}, ${c.city || ''}` : '' }))
  }

  function updateItem(idx: number, field: keyof LineItem, val: string | number) {
    setForm(f => {
      const items = [...f.line_items]
      items[idx] = { ...items[idx], [field]: field === 'description' ? val : Number(val) }
      return { ...f, line_items: items }
    })
  }

  async function saveDoc() {
    if (!form.client_name || form.line_items.every(i => !i.description)) {
      alert('Please add client name and at least one line item')
      return
    }
    setSaving(true)
    const cfg = DOC_CONFIG[form.doc_type]
    const year = new Date().getFullYear()
    const num  = String(Math.floor(Math.random() * 9000) + 1000)
    const ref  = `${cfg.prefix}-${year}-${num}`
    const { error } = await supabase.from('psk_documents').insert([{
      doc_ref: ref, doc_type: form.doc_type, branch: form.branch,
      client_id: form.client_id || null, client_name: form.client_name,
      client_phone: form.client_phone || null, client_email: form.client_email || null,
      client_address: form.client_address || null,
      booking_ref: form.booking_ref || null,
      issue_date: form.issue_date,
      due_date: form.due_date || null,
      valid_until: form.valid_until || null,
      line_items: form.line_items.filter(i => i.description),
      subtotal, vat_rate: form.vat_rate, vat_amount: vatAmt, total,
      amount_paid: 0, balance: total,
      notes: form.notes || null,
      linked_doc_ref: form.linked_doc_ref || null,
      trip_purpose: form.trip_purpose || null, trip_vehicle_type: form.trip_vehicle_type || null,
      trip_pickup_location: form.trip_pickup_location || null, trip_dropoff_location: form.trip_dropoff_location || null,
      trip_pickup_datetime: form.trip_pickup_datetime || null, trip_return_datetime: form.trip_return_datetime || null,
      trip_days: form.trip_days || null, trip_passengers: form.trip_passengers || null,
      trip_instructions: form.trip_instructions || null,
      rec_received_from: (form as any).rec_received_from || null,
      rec_amount_words: (form as any).rec_amount_words || null,
      rec_payment_for: (form as any).rec_payment_for || null,
      rec_payment_method: (form as any).rec_payment_method || null,
      rec_mpesa_ref: (form as any).rec_mpesa_ref || null,
      rec_vehicle_plate: (form as any).rec_vehicle_plate || null,
      rec_vehicle_model: (form as any).rec_vehicle_model || null,
      status: 'draft',
    }])
    setSaving(false)
    if (!error) {
      setShowAdd(false)
      setForm({ doc_type:'quotation', branch:'eldoret', client_id:'', client_name:'', client_phone:'', client_email:'', client_address:'', booking_ref:'', issue_date: new Date().toISOString().split('T')[0], due_date:'', valid_until:'', vat_rate:0, notes:'', linked_doc_ref:'', line_items:[emptyItem()] })
      loadAll()
    } else {
      if (error.message.includes('relation')) alert('Run the psk_documents SQL in Supabase first.')
      else alert('Error: ' + error.message)
    }
  }

  async function deleteDoc(id: string) {
    if (!confirm('Delete this document permanently?')) return
    await supabase.from('psk_documents').delete().eq('id', id)
    loadAll()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('psk_documents').update({ status }).eq('id', id)
    // If marking invoice paid, auto-create receipt if not exists
    if (status === 'paid') {
      const doc = docs.find(d => d.id === id)
      if (doc && doc.doc_type === 'invoice') {
        const rref = `PSK-REC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
        await supabase.from('psk_documents').insert([{
          doc_ref: rref, doc_type: 'receipt', branch: doc.branch,
          client_id: doc.client_id, client_name: doc.client_name,
          client_phone: doc.client_phone, client_email: doc.client_email,
          issue_date: new Date().toISOString().split('T')[0],
          line_items: doc.line_items, subtotal: doc.subtotal,
          vat_rate: doc.vat_rate, vat_amount: doc.vat_amount,
          total: doc.total, amount_paid: doc.total, balance: 0,
          notes: 'Receipt for payment received.', linked_doc_ref: doc.doc_ref, status: 'paid',
        }])
        // Send WhatsApp receipt to client
        if (doc.client_phone) {
          const ph = doc.client_phone.replace(/\D/g,'')
          const msg = encodeURIComponent(`Dear ${doc.client_name},\nThank you for your payment!\nReceipt: ${rref}\nInvoice: ${doc.doc_ref}\nAmount: KES ${doc.total?.toLocaleString()}\nPSK Safaris & Car Rentals\nTel: +254 751 855 180`)
          window.open(`https://wa.me/${ph}?text=${msg}`,'_blank')
        }
      }
    }
    loadAll()
  }

  const filtered = docs.filter(d => d.doc_type === activeTab)

  const fld = (label: string, children: React.ReactNode, req = false) => (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'0.5px', marginBottom:'5px', textTransform:'uppercase' }}>
        {label}{req && <span style={{ color:'rgba(239,154,154,0.80)', marginLeft:'3px' }}>*</span>}
      </div>
      {children}
    </div>
  )

  const inp = (key: string, type = 'text', placeholder = '') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
  )

  // ── PSK DOCUMENT PREVIEW (Concept B Warm Safari) ──────────────────────────
  const DocPreview = ({ doc }: { doc: PSKDocument }) => {
    const br   = BRANCHES[doc.branch as 'eldoret'|'kisumu']
    const cfg  = DOC_CONFIG[doc.doc_type]
    const sc   = STATUS_CFG[doc.status] || STATUS_CFG.draft
    const items: LineItem[] = Array.isArray(doc.line_items) ? doc.line_items : []

    const [pdfBusy, setPdfBusy] = useState(false)
    const [pdfReady, setPdfReady] = useState(false)
    const [pdfUrl, setPdfUrl] = useState<string>('')

    const generatePDF = async (): Promise<Blob | null> => {
      const el = document.querySelector('.psk-document') as HTMLElement
      if (!el) return null
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FFFDF7' })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, h)
      return pdf.output('blob')
    }

    const preparePDF = async () => {
      if (pdfUrl) return pdfUrl // already generated
      setPdfBusy(true)
      const blob = await generatePDF()
      setPdfBusy(false)
      if (!blob) return ''
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPdfReady(true)
      return url
    }

    const downloadPDF = async () => {
      setPdfBusy(true)
      const blob = await generatePDF()
      setPdfBusy(false)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${doc.doc_ref}.pdf`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      setPdfReady(true)
    }

    const sendWhatsApp = async () => {
      // Download PDF first so staff have it ready to attach
      await downloadPDF()
      const phone = (doc.client_phone || '').replace(/\D/g, '')
      const msg = `Dear ${doc.client_name},%0A%0APlease find your ${cfg.label} from PSK Safaris %26 Car Rentals.%0A%0ARef: ${doc.doc_ref}%0ADate: ${doc.issue_date}%0ATotal: KES ${doc.total?.toLocaleString()}%0A%0APaybill: 4563877%0ATel: ${br.tel}`
      setTimeout(() => window.open(`https://wa.me/${phone}?text=${msg}`, '_blank'), 1200)
    }

    const sendEmail = async () => {
      await downloadPDF()
      const subject = encodeURIComponent(`PSK Safaris — ${cfg.label} ${doc.doc_ref}`)
      const body = encodeURIComponent(`Dear ${doc.client_name},\n\nPlease find your ${cfg.label} from PSK Safaris & Car Rentals.\n\nRef: ${doc.doc_ref}\nDate: ${doc.issue_date}\nTotal: KES ${doc.total?.toLocaleString()}\n\nThank you for choosing PSK Safaris & Car Rentals.\n${br.name}\nTel: ${br.tel}\nPaybill: 4563877`)
      setTimeout(() => window.open(`mailto:${doc.client_email || ''}?subject=${subject}&body=${body}`, '_blank'), 1200)
    }

    return (
      <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', background:'rgba(0,0,0,0.82)', backdropFilter:'blur(12px)', overflowY:'auto', padding:'32px 20px' }}>
        <div style={{ width:'760px', maxWidth:'100%' }}>
          {/* Action bar */}
          <div className="psk-no-print" style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={downloadPDF} disabled={pdfBusy}
                style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.22),rgba(255,149,0,0.14))', border:'1.5px solid rgba(255,215,0,0.45)', color:'rgba(255,215,0,0.98)', cursor:pdfBusy?'wait':'pointer', fontFamily:'inherit', opacity:pdfBusy?0.7:1 }}>
                {pdfBusy ? '⏳ Generating...' : '⬇ Download PDF'}
              </button>
              {pdfReady && <span style={{ fontSize:'11px', color:'rgba(129,199,132,0.85)', alignSelf:'center' }}>✓ PDF saved to Downloads</span>}
              <button onClick={sendWhatsApp} disabled={pdfBusy}
                style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'rgba(37,211,102,0.12)', border:'1.5px solid rgba(37,211,102,0.35)', color:'rgba(37,211,102,0.95)', cursor:pdfBusy?'wait':'pointer', fontFamily:'inherit', opacity:pdfBusy?0.7:1 }}>
                📱 WhatsApp
              </button>
              <button onClick={sendEmail} disabled={pdfBusy}
                style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:700, background:'rgba(100,181,246,0.10)', border:'1.5px solid rgba(100,181,246,0.30)', color:'rgba(100,181,246,0.92)', cursor:pdfBusy?'wait':'pointer', fontFamily:'inherit', opacity:pdfBusy?0.7:1 }}>
                ✉️ Email
              </button>
              {doc.status === 'draft' && <button onClick={async()=>{ await updateStatus(doc.id,'sent'); setPreviewDoc({...doc,status:'sent'}) }} style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(100,181,246,0.10)', border:'1px solid rgba(100,181,246,0.25)', color:'rgba(100,181,246,0.88)', cursor:'pointer', fontFamily:'inherit' }}>📤 Mark as Sent</button>}
              {doc.doc_type === 'invoice' && doc.status !== 'paid' && <button onClick={async()=>{ await updateStatus(doc.id,'paid'); setPreviewDoc({...doc,status:'paid'}) }} style={{ padding:'8px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(129,199,132,0.12)', border:'1px solid rgba(129,199,132,0.30)', color:'rgba(129,199,132,0.95)', cursor:'pointer', fontFamily:'inherit' }}>✓ Mark Paid</button>}
            </div>
            <button onClick={() => setPreviewDoc(null)} style={{ padding:'8px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.60)', cursor:'pointer', fontFamily:'inherit' }}>✕ Close</button>
          </div>

          {/* ── THE DOCUMENT ── */}
          <div className="psk-document" id="psk-document-print" style={{ background:'#F8F6F1', fontFamily:'"Helvetica Neue", Arial, sans-serif', color:'#111', display:'flex', boxShadow:'0 20px 60px rgba(0,0,0,0.50)', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>

            {/* LEFT TEAL BAR */}
            <div style={{ width:'12px', background:'#1B4D5C', flexShrink:0, printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }} />

            {/* MAIN CONTENT */}
            <div style={{ flex:1, padding:'40px 44px' }}>

              {/* HEADER — logo + company left, doc type + ref right */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px', flexShrink:0 }}>
                  <img src="/branding/psk-logo.png" alt="PSK" style={{ width:'72px', height:'72px', borderRadius:'50%', border:'2.5px solid #1B4D5C', objectFit:'cover', flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:'18px', fontWeight:900, color:'#111', whiteSpace:'nowrap' }}>{br.name}</div>
                    <div style={{ fontSize:'9px', fontWeight:700, color:'#555', marginTop:'5px', lineHeight:1.85, whiteSpace:'nowrap' }}>
                      {br.address}{br.poBox ? ` | ${br.poBox}` : ''}<br/>
                      Tel: {br.tel}<br/>
                      PIN: {br.pin}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0, paddingLeft:'40px' }}>
                  <div style={{ fontSize:'38px', fontWeight:900, color:'#1B4D5C', letterSpacing:'6px', textTransform:'uppercase', marginBottom:'10px' }}>{cfg.label}</div>
                  <div style={{ fontSize:'9px', fontWeight:900, letterSpacing:'2px', textTransform:'uppercase', color:'#111' }}>
                    {doc.doc_type === 'invoice' ? 'Invoice Number' :
                     doc.doc_type === 'quotation' ? 'Quotation Number' :
                     doc.doc_type === 'receipt' ? 'Receipt Number' :
                     doc.doc_type === 'credit_note' ? 'Credit Note Number' : 'Debit Note Number'}
                  </div>
                  <div style={{ fontSize:'22px', fontWeight:900, color:'#111', letterSpacing:'1px' }}>{doc.doc_ref}</div>
                  <div style={{ fontSize:'11px', fontWeight:800, color:'#333', marginTop:'4px' }}>{doc.issue_date}</div>
                  {doc.valid_until && <div style={{ fontSize:'10px', fontWeight:700, color:'#555', marginTop:'2px' }}>Valid until: {doc.valid_until}</div>}
                </div>
              </div>

              {/* TEAL RULE */}
              <div style={{ height:'2.5px', background:'#1B4D5C', margin:'22px 0', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }} />

              {/* LINKED DOC (credit/debit note) */}
              {doc.linked_doc_ref && (
                <div style={{ fontSize:'11px', fontWeight:800, color:'#555', paddingBottom:'12px', borderBottom:'1px solid #ddd', marginBottom:'18px' }}>
                  Linked to: <strong style={{ color:'#111' }}>{doc.linked_doc_ref}</strong>
                  {doc.notes && <span style={{ marginLeft:'16px', color:'#666' }}>{doc.notes}</span>}
                </div>
              )}

              {/* RECEIPT — completely different body layout */}
              {doc.doc_type === 'receipt' ? (
                <>
                  {/* Receipt body rows */}
                  <div style={{ marginBottom:'32px' }}>
                    {[
                      ['Received From', (doc as any).rec_received_from || doc.client_name],
                      ['Sum of Kenya Shillings', (doc as any).rec_amount_words || ''],
                      ['Payment For', (doc as any).rec_payment_for || (doc.notes || '')],
                      ['Payment Method', [(doc as any).rec_payment_method, (doc as any).rec_mpesa_ref].filter(Boolean).join(' · Ref: ')],
                    ].map(([label, value], i) => (
                      <div key={label as string} style={{ display:'flex', alignItems:'baseline', borderBottom:'1px solid #ddd', padding:'14px 0', borderTop: i===0 ? '1px solid #ddd' : 'none' }}>
                        <div style={{ fontSize:'11px', fontWeight:900, color:'#1B4D5C', textTransform:'uppercase', letterSpacing:'1px', minWidth:'220px', flexShrink:0 }}>{label as string}</div>
                        <div style={{ fontSize:'14px', fontWeight:900, color:'#111', flex:1 }}>{value as string}</div>
                      </div>
                    ))}
                    {((doc as any).rec_vehicle_model || (doc as any).rec_vehicle_plate) && (
                      <div style={{ display:'flex', alignItems:'baseline', borderBottom:'1px solid #ddd', padding:'14px 0' }}>
                        <div style={{ fontSize:'11px', fontWeight:900, color:'#1B4D5C', textTransform:'uppercase', letterSpacing:'1px', minWidth:'220px', flexShrink:0 }}>Vehicle</div>
                        <div style={{ fontSize:'14px', fontWeight:900, color:'#111', flex:1 }}>{[(doc as any).rec_vehicle_model, (doc as any).rec_vehicle_plate].filter(Boolean).join(' · ')}</div>
                      </div>
                    )}
                  </div>

                  {/* Amount box */}
                  <div style={{ border:'2px solid #1B4D5C', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0 0 32px' }}>
                    <div style={{ fontSize:'11px', fontWeight:900, letterSpacing:'2px', textTransform:'uppercase', color:'#1B4D5C' }}>Amount Received</div>
                    <div style={{ fontSize:'28px', fontWeight:900, color:'#111', letterSpacing:'1px' }}>
                      <span style={{ fontSize:'14px', fontWeight:700, color:'#555', marginRight:'6px' }}>Kshs.</span>
                      {doc.total?.toLocaleString()}
                    </div>
                  </div>

                  {/* With Thanks + stamp */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'40px' }}>
                    <div>
                      <div style={{ fontSize:'16px', fontWeight:900, color:'#1B4D5C', marginBottom:'8px', letterSpacing:'0.5px' }}>With Thanks</div>
                      <div style={{ fontSize:'11px', fontWeight:800, color:'#444' }}>For PSK Safaris & Car Rentals</div>
                    </div>
                    <div style={{ width:'110px', height:'110px', borderRadius:'50%', border:'3px solid #1B4D5C', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.25 }}>
                      <div style={{ fontSize:'8px', fontWeight:900, color:'#1B4D5C', textAlign:'center', textTransform:'uppercase', letterSpacing:'1px', lineHeight:1.6 }}>PSK Safaris<br/>&amp; Car<br/>Rentals Ltd<br/>★ Eldoret ★</div>
                    </div>
                  </div>
                </>
              ) : doc.doc_type === 'quotation' ? (
                <div style={{ marginBottom:'22px', paddingBottom:'18px', borderBottom:'1px solid #ddd' }}>
                  <div style={{ fontSize:'16px', fontWeight:900, textTransform:'uppercase', color:'#1B4D5C', marginBottom:'10px' }}>Quotation For</div>
                  <div style={{ fontSize:'13px', fontWeight:900, color:'#111', marginBottom:'5px' }}>{doc.client_name}</div>
                  <div style={{ fontSize:'11.5px', fontWeight:900, color:'#222', lineHeight:1.85 }}>
                    {doc.client_address && <div>{doc.client_address}</div>}
                    {doc.client_phone && <div>Tel: {doc.client_phone}</div>}
                    {doc.client_email && <div>{doc.client_email}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', marginBottom:'28px' }}>
                  <div style={{ paddingRight:'28px' }}>
                    <div style={{ fontSize:'16px', fontWeight:900, textTransform:'uppercase', color:'#1B4D5C', marginBottom:'10px' }}>
                      {doc.doc_type === 'receipt' ? 'Received From' :
                       doc.doc_type === 'credit_note' ? 'Credit Issued To' :
                       doc.doc_type === 'debit_note' ? 'Charged To' : 'Billed To'}
                    </div>
                    <div style={{ fontSize:'13px', fontWeight:900, color:'#111', marginBottom:'5px' }}>{doc.client_name}</div>
                    <div style={{ fontSize:'11.5px', fontWeight:900, color:'#222', lineHeight:1.85 }}>
                      {doc.client_address && <div>{doc.client_address}</div>}
                      {doc.client_phone && <div>Tel: {doc.client_phone}</div>}
                      {doc.client_email && <div>{doc.client_email}</div>}
                    </div>
                  </div>
                  <div style={{ paddingLeft:'28px', borderLeft:'2px solid #1B4D5C' }}>
                    <div style={{ fontSize:'16px', fontWeight:900, textTransform:'uppercase', color:'#1B4D5C', marginBottom:'10px' }}>
                      {doc.doc_type === 'receipt' ? 'Received By' : 'Payment Details'}
                    </div>
                    <div style={{ fontSize:'13px', fontWeight:900, color:'#111', marginBottom:'5px' }}>{br.name}</div>
                    <div style={{ fontSize:'11.5px', fontWeight:900, color:'#222', lineHeight:1.85 }}>
                      <div>M-Pesa Paybill: 4563877</div>
                      <div>Account No: {doc.doc_ref}</div>
                      <div>PIN: {br.pin}</div>
                      {doc.booking_ref && <div>Booking Ref: {doc.booking_ref}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* TRIP DETAILS BLOCK — quotation only */}
              {doc.doc_type === 'quotation' && ((doc as any).trip_purpose || (doc as any).trip_vehicle_type) && (
                <div style={{ border:'1.5px solid #1B4D5C', marginBottom:'26px' }}>
                  <div style={{ fontSize:'14px', fontWeight:900, letterSpacing:'2px', textTransform:'uppercase', color:'#1B4D5C', background:'rgba(27,77,92,0.12)', padding:'8px 14px' }}>TRIP DETAILS</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
                    {[
                      ['Purpose of Trip', (doc as any).trip_purpose],
                      ['Vehicle Type', (doc as any).trip_vehicle_type],
                      ['Pickup Location', (doc as any).trip_pickup_location],
                      ['Drop-off Location', (doc as any).trip_dropoff_location],
                      ['Pickup Date & Time', (doc as any).trip_pickup_datetime],
                      ['Return Date & Time', (doc as any).trip_return_datetime],
                      ['Number of Days', (doc as any).trip_days],
                      ['Number of Passengers', (doc as any).trip_passengers],
                    ].filter(([,v]) => v).map(([label, value], i, arr) => (
                      <div key={label as string} style={{ padding:'12px 14px', borderBottom: i < arr.length - 2 ? '1px solid #ddd' : 'none', borderRight: i % 2 === 0 ? '1px solid #ddd' : 'none' }}>
                        <div style={{ fontSize:'8px', fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', color:'#1B4D5C', marginBottom:'4px' }}>{label as string}</div>
                        <div style={{ fontSize:'13px', fontWeight:900, color:'#111' }}>{value as string}</div>
                      </div>
                    ))}
                    {(doc as any).trip_instructions && (
                      <div style={{ gridColumn:'1/-1', padding:'12px 14px', borderTop:'1px solid #ddd' }}>
                        <div style={{ fontSize:'8px', fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', color:'#1B4D5C', marginBottom:'4px' }}>Special Instructions</div>
                        <div style={{ fontSize:'13px', fontWeight:900, color:'#111' }}>{(doc as any).trip_instructions}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LINE ITEMS TABLE */}
              <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:0 }}>
                <thead>
                  <tr style={{ borderTop:'2.5px solid #1B4D5C', borderBottom:'2.5px solid #1B4D5C' }}>
                    {['#','Description','Price (KES)','Qty','Amount (KES)'].map(h => (
                      <th key={h} style={{ padding:'11px 12px', fontSize:'9px', fontWeight:900, letterSpacing:'1px', textTransform:'uppercase', color:'#1B4D5C', textAlign: h==='#' ? 'left' : h==='Description' ? 'left' : 'right', paddingLeft: h==='#' ? 0 : '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #e0ddd6' }}>
                      <td style={{ padding:'12px 12px 12px 0', fontSize:'12px', fontWeight:900, color:'#1B4D5C' }}>{String(i+1).padStart(2,'0')}</td>
                      <td style={{ padding:'12px', fontSize:'12px', fontWeight:800, color:'#111' }}>{item.description}</td>
                      <td style={{ padding:'12px', fontSize:'12px', fontWeight:700, color:'#333', textAlign:'right' }}>{item.unitPrice.toLocaleString()}</td>
                      <td style={{ padding:'12px', fontSize:'12px', fontWeight:700, color:'#333', textAlign:'right' }}>{item.qty}</td>
                      <td style={{ padding:'12px', fontSize:'12px', fontWeight:800, color:'#111', textAlign:'right' }}>{(item.qty * item.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALS */}
              <div style={{ display:'flex', justifyContent:'flex-end', borderTop:'2.5px solid #1B4D5C', marginBottom:'40px' }}>
                <div style={{ minWidth:'250px', borderLeft:'2px solid #1B4D5C' }}>
                  {[
                    { label:'Subtotal', value:`KES ${doc.subtotal?.toLocaleString()}`, grand:false },
                    ...(doc.vat_rate > 0 ? [{ label:`VAT (${doc.vat_rate}%)`, value:`KES ${doc.vat_amount?.toLocaleString()}`, grand:false }] : []),
                    ...(doc.amount_paid && doc.amount_paid > 0 ? [{ label:'Amount Paid', value:`KES ${doc.amount_paid?.toLocaleString()}`, grand:false }] : []),
                    { label: doc.doc_type === 'receipt' ? 'Total Received' : doc.doc_type === 'credit_note' ? 'Total Credit' : doc.doc_type === 'debit_note' ? 'Additional Amount Due' : 'Total Amount', value:`KES ${doc.total?.toLocaleString()}`, grand:true },
                    ...(doc.doc_type === 'invoice' && doc.balance && doc.balance > 0 ? [{ label:'Balance Due', value:`KES ${doc.balance?.toLocaleString()}`, grand:true, red:true }] : []),
                  ].map((row:any, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 14px', borderBottom: row.grand ? 'none' : '1px solid #e0ddd6', borderTop: row.grand ? '2.5px solid #1B4D5C' : 'none' }}>
                      <span style={{ fontSize: row.grand ? '13px' : '12px', fontWeight:900, color: row.red ? '#c00' : row.grand ? '#1B4D5C' : '#555' }}>{row.label}</span>
                      <span style={{ fontSize: row.grand ? '16px' : '12px', fontWeight:900, color: row.red ? '#c00' : row.grand ? '#1B4D5C' : '#111' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTES (only if not linked doc — already shown above) */}
              {doc.notes && !doc.linked_doc_ref && (
                <div style={{ borderLeft:'3px solid #1B4D5C', paddingLeft:'14px', marginBottom:'28px' }}>
                  <div style={{ fontSize:'9px', fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', color:'#1B4D5C', marginBottom:'5px' }}>Notes</div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#444', lineHeight:1.75 }}>{doc.notes}</div>
                </div>
              )}

              {/* SIGNATURES — Date left, Signature right only */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderTop:'1.5px solid #333', paddingTop:'30px' }}>
                <div>
                  <div style={{ borderBottom:'1.5px solid #333', width:'220px', marginBottom:'8px', height:'44px' }} />
                  <div style={{ fontSize:'10px', fontWeight:900, color:'#333', letterSpacing:'0.5px' }}>Date</div>
                </div>
                <div>
                  <div style={{ borderBottom:'1.5px solid #333', width:'220px', marginBottom:'8px', height:'44px' }} />
                  <div style={{ fontSize:'10px', fontWeight:900, color:'#333', letterSpacing:'0.5px' }}>Signature</div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ background:'#2D5F3F', padding:'12px 32px', textAlign:'center', printColorAdjust:'exact', WebkitPrintColorAdjust:'exact' }}>
              <div style={{ fontSize:'11px', color:'#FFFFFF', fontWeight:500 }}>
                Easy car rentals · Self drive/chauffeur driven · Airport transfers · Safaris and excursion
              </div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.80)', marginTop:'3px' }}>
                {br.name} | {br.tel} | PIN: {br.pin}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding:'24px 28px 28px' }}>
      <div onClick={()=>navigate('/finance')} style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px', cursor:'pointer', padding:'8px 16px', borderRadius:'20px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.18)', transition:'all 0.2s ease', userSelect:'none' as any }}
        onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.12)'; el.style.borderColor='rgba(255,215,0,0.35)'; el.style.transform='translateX(-2px)' }}
        onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.06)'; el.style.borderColor='rgba(255,215,0,0.18)'; el.style.transform='translateX(0)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', letterSpacing:'0.1px' }}>Back</span>
      </div>

      {/* Doc type tabs */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {(Object.entries(DOC_CONFIG) as [DocType, typeof DOC_CONFIG[DocType]][]).map(([type, cfg]) => (
            <button key={type} onClick={() => setActiveTab(type)} style={{ padding:'7px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              background: activeTab===type ? cfg.bg : 'rgba(255,255,255,0.05)',
              border:`1px solid ${activeTab===type ? cfg.border : 'rgba(255,255,255,0.10)'}`,
              color: activeTab===type ? cfg.color : 'rgba(255,255,255,0.40)',
            }}>
              {cfg.emoji} {cfg.label} ({docs.filter(d=>d.doc_type===type).length})
            </button>
          ))}
        </div>
        <button onClick={() => { setForm(f => ({...f, doc_type: activeTab})); setShowAdd(true) }} style={{ padding:'7px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
          + New {DOC_CONFIG[activeTab].label}
        </button>
      </div>

      {/* Table */}
      <div style={{ ...gl.panel, padding:'18px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.30)', fontSize:'12px' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>{DOC_CONFIG[activeTab].emoji}</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.50)', marginBottom:'8px' }}>No {DOC_CONFIG[activeTab].label}s yet</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginBottom:'20px' }}>Create your first {DOC_CONFIG[activeTab].label.toLowerCase()} to get started</div>
            <button onClick={() => { setForm(f=>({...f,doc_type:activeTab})); setShowAdd(true) }} style={{ padding:'10px 22px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))', border:'1.5px solid rgba(255,215,0,0.32)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit' }}>
              + Create first {DOC_CONFIG[activeTab].label.toLowerCase()}
            </button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Reference','Client','Date','Total','Status','Actions'].map(h=>(
                  <th key={h} style={{ ...gl.label, padding:'0 12px 10px', textAlign: h==='Total' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const sc = STATUS_CFG[doc.status] || STATUS_CFG.draft
                return (
                  <tr key={doc.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,215,0,0.80)' }}>{doc.doc_ref}</div></td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.85)' }}>{doc.client_name}</div>
                      {doc.client_phone && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>{doc.client_phone}</div>}
                    </td>
                    <td style={{ padding:'12px' }}><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{doc.issue_date}</div></td>
                    <td style={{ padding:'12px', textAlign:'right' }}><div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.85)' }}>KES {doc.total?.toLocaleString()}</div></td>
                    <td style={{ padding:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{sc.label}</span></td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => setPreviewDoc(doc)} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,149,0,0.06))', border:'1px solid rgba(255,215,0,0.28)', color:'rgba(255,215,0,0.85)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
                        <button onClick={() => setPreviewDoc(doc)} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(100,181,246,0.08)', border:'1px solid rgba(100,181,246,0.22)', color:'rgba(100,181,246,0.85)', cursor:'pointer', fontFamily:'inherit' }}>🖨</button>
                        <button onClick={() => {
                          const phone = (doc.client_phone||'').replace(/\D/g,'')
                          const msg = `Dear ${doc.client_name},%0APSK Safaris ${DOC_CONFIG[doc.doc_type].label}: ${doc.doc_ref}%0ATotal: KES ${doc.total?.toLocaleString()}%0ADate: ${doc.issue_date}%0ATel: +254751855180`
                          window.open(`https://wa.me/${phone}?text=${msg}`,'_blank')
                        }} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.22)', color:'rgba(37,211,102,0.85)', cursor:'pointer', fontFamily:'inherit' }}>📱</button>
                        <button onClick={() => deleteDoc(doc.id)} style={{ padding:'4px 10px', borderRadius:'7px', fontSize:'11px', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.80)', cursor:'pointer', fontFamily:'inherit' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview */}
      {previewDoc && <DocPreview doc={previewDoc} />}

      {/* NEW DOCUMENT MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.70)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'rgba(8,18,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'18px', width:'660px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.70)' }}>
            <div style={{ padding:'22px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(8,18,30,0.97)', zIndex:1 }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>New {DOC_CONFIG[form.doc_type].label}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.30)', marginTop:'2px' }}>Total: KES {total.toLocaleString()}</div>
              </div>
              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                {/* Doc type switcher */}
                <div style={{ display:'flex', gap:'4px' }}>
                  {(Object.entries(DOC_CONFIG) as [DocType, typeof DOC_CONFIG[DocType]][]).map(([type, cfg]) => (
                    <button key={type} onClick={() => setForm(f=>({...f,doc_type:type}))} style={{ padding:'5px 10px', borderRadius:'7px', fontSize:'10px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                      background: form.doc_type===type ? cfg.bg : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${form.doc_type===type ? cfg.border : 'rgba(255,255,255,0.08)'}`,
                      color: form.doc_type===type ? cfg.color : 'rgba(255,255,255,0.30)',
                    }}>{cfg.label}</button>
                  ))}
                </div>
                <button onClick={() => setShowAdd(false)} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit', fontSize:'16px' }}>✕</button>
              </div>
            </div>

            <div style={{ padding:'24px 28px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Branch', <select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}><option value="eldoret">Eldoret HQ</option><option value="kisumu">Kisumu Branch</option></select>)}
                {fld('Issue date', inp('issue_date','date'))}
                {form.doc_type === 'invoice' && fld('Due date', inp('due_date','date'))}
                {form.doc_type === 'quotation' && fld('Valid until', inp('valid_until','date'))}
              </div>

              <div style={{ ...gl.label, margin:'8px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Client</div>
              {fld('Select existing client',
                <select value={form.client_id} onChange={e=>onClientSelect(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                  <option value="">Select client or fill manually...</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {fld('Client name *', inp('client_name','text','Full name'), true)}
                {fld('Phone', inp('client_phone','tel','+254...'))}
                {fld('Email (optional)', inp('client_email','email','client@email.com'))}
                {fld('Address', inp('client_address','text','Address'))}
              </div>

              {fld('Booking reference (optional)', inp('booking_ref','text','e.g. BK-2026-1234'))}
              {(form.doc_type === 'credit_note' || form.doc_type === 'debit_note') && fld('Linked invoice/document ref', inp('linked_doc_ref','text','e.g. PSK-INV-2026-1234'))}

              {/* RECEIPT DETAILS — only for receipts */}
              {form.doc_type === 'receipt' && (
                <>
                  <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,215,0,0.70)', fontSize:'11px' }}>Receipt Details</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    {fld('Received From *', inp('rec_received_from','text','Full name of payer'), true)}
                    {fld('Amount in Words *', inp('rec_amount_words','text','e.g. Four thousand shillings only'), true)}
                    {fld('Vehicle Model', <select value={(form as any).rec_vehicle_model} onChange={e=>setForm(f=>({...f,rec_vehicle_model:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                      <option value="">Select model...</option>
                      <option>Toyota Fielder</option>
                      <option>Toyota Prado</option>
                      <option>Toyota Land Cruiser V8</option>
                      <option>Toyota Hiace Noah</option>
                      <option>Toyota Corolla</option>
                      <option>Nissan X-Trail</option>
                      <option>Subaru Forester</option>
                      <option>Subaru Outback</option>
                      <option>Mercedes E-Class</option>
                      <option>Toyota Minibus 25-Seater</option>
                      <option>Other</option>
                    </select>)}
                    {fld('Plate Number', inp('rec_vehicle_plate','text','e.g. KCX 493X'))}
                    {fld('Payment Method', <select value={(form as any).rec_payment_method} onChange={e=>setForm(f=>({...f,rec_payment_method:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                      <option>M-Pesa</option>
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Card</option>
                      <option>Cheque</option>
                    </select>)}
                    {fld('M-Pesa Ref (if applicable)', inp('rec_mpesa_ref','text','e.g. QGH7823KL'))}
                  </div>
                  {fld('Payment For *', inp('rec_payment_for','text','e.g. Saloon hire on 11/07/2026'), true)}
                </>
              )}

              {/* TRIP DETAILS — only for quotations */}
              {form.doc_type === 'quotation' && (
                <>
                  <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,215,0,0.70)', fontSize:'11px' }}>Trip Details</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    {fld('Purpose of Trip', inp('trip_purpose','text','e.g. Corporate staff transfers'))}
                    {fld('Vehicle Type', <select value={(form as any).trip_vehicle_type} onChange={e=>setForm(f=>({...f,trip_vehicle_type:e.target.value}))} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                      <option value="">Select vehicle type...</option>
                      <option>Saloon — Chauffeured</option>
                      <option>Saloon — Self Drive</option>
                      <option>SUV — Chauffeured</option>
                      <option>SUV — Self Drive</option>
                      <option>Toyota Prado — Chauffeured</option>
                      <option>Toyota Prado — Self Drive</option>
                      <option>Land Cruiser V8 — Chauffeured</option>
                      <option>Station Wagon — Chauffeured</option>
                      <option>Pickup Truck — Chauffeured</option>
                      <option>Minibus 25-Seater — Chauffeured</option>
                      <option>Noah/Van — Chauffeured</option>
                      <option>Sub Driver</option>
                    </select>)}
                    {fld('Pickup Location', inp('trip_pickup_location','text','e.g. PSK Office, Eldoret'))}
                    {fld('Drop-off Location', inp('trip_dropoff_location','text','e.g. Kisumu CBD'))}
                    {fld('Pickup Date & Time', inp('trip_pickup_datetime','text','e.g. 14 Aug 2026 · 07:00 AM'))}
                    {fld('Return Date & Time', inp('trip_return_datetime','text','e.g. 16 Aug 2026 · 06:00 PM'))}
                    {fld('Number of Days', inp('trip_days','text','e.g. 3 Days'))}
                    {fld('Number of Passengers', inp('trip_passengers','text','e.g. 4 Passengers'))}
                  </div>
                  {fld('Special Instructions (optional)', <textarea value={(form as any).trip_instructions} onChange={e=>setForm(f=>({...f,trip_instructions:e.target.value}))} placeholder="e.g. Driver to pick up at hotel. Fuel and accommodation for driver included." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'64px', resize:'none' }} />)}
                </>
              )}

              {/* Line items */}
              <div style={{ ...gl.label, margin:'16px 0 12px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Line Items</div>
              <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'10px' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    {['Description','Qty','Unit Price (KES)','Amount'].map(h=>(
                      <th key={h} style={{ ...gl.label, padding:'0 8px 8px', textAlign: h==='Description' ? 'left' : 'right' }}>{h}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {form.line_items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding:'4px 8px 4px 0' }}>
                        <input value={item.description} onChange={e=>updateItem(idx,'description',e.target.value)} placeholder="e.g. Prado hire — Chauffeur — 2 days" style={{ width:'100%', padding:'8px 10px', borderRadius:'7px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit' }} />
                      </td>
                      <td style={{ padding:'4px 6px', width:'60px' }}>
                        <input type="number" value={item.qty} onChange={e=>updateItem(idx,'qty',e.target.value)} style={{ width:'100%', padding:'8px 6px', borderRadius:'7px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', textAlign:'center' }} />
                      </td>
                      <td style={{ padding:'4px 6px', width:'130px' }}>
                        <input type="number" value={item.unitPrice} onChange={e=>updateItem(idx,'unitPrice',e.target.value)} style={{ width:'100%', padding:'8px 8px', borderRadius:'7px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', textAlign:'right' }} />
                      </td>
                      <td style={{ padding:'4px 6px', width:'110px', textAlign:'right', fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.80)' }}>
                        {(item.qty * item.unitPrice).toLocaleString()}
                      </td>
                      <td style={{ padding:'4px 0 4px 6px', width:'30px' }}>
                        {form.line_items.length > 1 && (
                          <button onClick={()=>setForm(f=>({...f,line_items:f.line_items.filter((_,i)=>i!==idx)}))} style={{ width:'24px', height:'24px', borderRadius:'6px', background:'rgba(231,76,60,0.10)', border:'1px solid rgba(231,76,60,0.20)', color:'rgba(239,154,154,0.80)', cursor:'pointer', fontFamily:'inherit', fontSize:'14px', lineHeight:1 }}>×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={()=>setForm(f=>({...f,line_items:[...f.line_items,emptyItem()]}))} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, background:'rgba(255,255,255,0.05)', border:'1px dashed rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit', marginBottom:'16px' }}>+ Add line item</button>

              {/* Totals */}
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px' }}>
                <div style={{ minWidth:'240px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'6px 6px 0 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>Subtotal</span>
                    <span style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.70)' }}>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 12px', background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.07)', gap:'8px' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>VAT</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <select value={form.vat_rate} onChange={e=>setForm(f=>({...f,vat_rate:Number(e.target.value)}))} style={{ padding:'4px 8px', borderRadius:'6px', fontSize:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.70)', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
                        <option value={0}>0% (no VAT)</option>
                        <option value={16}>16%</option>
                      </select>
                      <span style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.70)' }}>KES {vatAmt.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.25)', borderRadius:'0 0 6px 6px' }}>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,215,0,0.90)' }}>TOTAL</span>
                    <span style={{ fontSize:'15px', fontWeight:800, color:'rgba(255,215,0,0.95)' }}>KES {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {fld('Notes / payment instructions',
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Payment due within 7 days. M-Pesa: +254 751 855 180..." style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', fontSize:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.80)', outline:'none', fontFamily:'inherit', height:'64px', resize:'none' }} />
              )}

              <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'13px', borderRadius:'10px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={saveDoc} disabled={saving} style={{ flex:2, padding:'13px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : `Create ${DOC_CONFIG[form.doc_type].label}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
