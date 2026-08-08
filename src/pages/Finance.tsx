import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  FileText,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Send,
  WalletCards,
} from 'lucide-react'
import { BRANCHES } from '../data/branches'

type DocumentType = 'quotation' | 'invoice' | 'receipt' | 'credit_note' | 'debit_note'
type ViewMode = 'overview' | 'studio'

type LineItem = {
  description: string
  quantity: number
  rate: number
}

const DOCUMENT_CONFIG: Record<DocumentType, { label: string; shortLabel: string; prefix: string; description: string; accent: string; action: string; note: string }> = {
  quotation: {
    label: 'Quotation',
    shortLabel: 'Quote',
    prefix: 'QT',
    description: 'Prepare a clear proposal before confirming travel.',
    accent: 'text-sky-300 border-sky-400/30 bg-sky-400/10',
    action: 'Generate quotation',
    note: 'This quotation is valid for 30 days and subject to availability.',
  },
  invoice: {
    label: 'Invoice',
    shortLabel: 'Invoice',
    prefix: 'INV',
    description: 'Bill a client for confirmed services and bookings.',
    accent: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
    action: 'Generate invoice',
    note: 'Payment is due within 7 days from the invoice date.',
  },
  receipt: {
    label: 'Receipt',
    shortLabel: 'Receipt',
    prefix: 'RCT',
    description: 'Acknowledge payment and close the customer record.',
    accent: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
    action: 'Generate receipt',
    note: 'Thank you for choosing PSK Safaris & Car Rentals.',
  },
  credit_note: {
    label: 'Credit Note',
    shortLabel: 'Credit',
    prefix: 'CN',
    description: 'Record a refund, correction, or account credit.',
    accent: 'text-violet-300 border-violet-400/30 bg-violet-400/10',
    action: 'Generate credit note',
    note: 'This credit will be applied to the customer account or related invoice.',
  },
  debit_note: {
    label: 'Debit Note',
    shortLabel: 'Debit',
    prefix: 'DN',
    description: 'Record an approved additional charge or adjustment.',
    accent: 'text-rose-300 border-rose-400/30 bg-rose-400/10',
    action: 'Generate debit note',
    note: 'This debit note reflects an approved additional charge to the customer account.',
  },
}

const RECENT_DOCUMENTS = [
  { type: 'Invoice', ref: 'INV-2026-000241', client: 'Kevin Indrassen', amount: 'KES 3,500', status: 'Sent', date: '02 Feb 2026', colour: 'text-amber-300 bg-amber-400/10 border-amber-400/20' },
  { type: 'Quotation', ref: 'QT-2026-000240', client: 'Mary Ochieng', amount: 'KES 87,000', status: 'Accepted', date: '01 Feb 2026', colour: 'text-sky-300 bg-sky-400/10 border-sky-400/20' },
  { type: 'Receipt', ref: 'RCT-2026-000239', client: 'Safari M. Ltd', amount: 'KES 42,500', status: 'Paid', date: '31 Jan 2026', colour: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' },
  { type: 'Credit Note', ref: 'CN-2026-000012', client: 'Amani Tours', amount: 'KES 6,400', status: 'Applied', date: '30 Jan 2026', colour: 'text-violet-300 bg-violet-400/10 border-violet-400/20' },
]

const formatKES = (value: number) => `KES ${value.toLocaleString('en-KE')}`

interface FinanceProps {
  currentBranch?: 'eldoret' | 'kisumu'
}

export default function Finance({ currentBranch = 'eldoret' }: FinanceProps) {
  const [view, setView] = useState<ViewMode>('overview')
  const [documentType, setDocumentType] = useState<DocumentType>('invoice')
  const [customer, setCustomer] = useState('Kevin Indrassen')
  const [booking, setBooking] = useState('BK-2026-00187 · Kevin Indrassen · Toyota KDE')
  const [issueDate, setIssueDate] = useState('02 Feb 2026')
  const [dueDate, setDueDate] = useState('09 Feb 2026')
  const [notes, setNotes] = useState(DOCUMENT_CONFIG.invoice.note)
  const [isGenerated, setIsGenerated] = useState(false)
  const [items, setItems] = useState<LineItem[]>([
    { description: 'KDE hire on 28 January 2026', quantity: 1, rate: 3500 },
  ])

  const config = DOCUMENT_CONFIG[documentType]
  const reference = `${config.prefix}-2026-000241`
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.rate, 0), [items])
  const vat = 0
  const total = subtotal + vat

  const selectDocumentType = (type: DocumentType) => {
    setDocumentType(type)
    setNotes(DOCUMENT_CONFIG[type].note)
    setIsGenerated(false)
  }

  const addLineItem = () => setItems((current) => [
    ...current,
    { description: 'Additional service', quantity: 1, rate: 0 },
  ])

  const updateItem = (index: number, key: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item) as LineItem))
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-[#121a24] px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.08)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Finance & Documents</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Financial control, made simple.</h2>
          <p className="mt-1 text-sm text-slate-400">Create polished customer documents, monitor collections, and keep every adjustment traceable.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-700 bg-[#0b1118] p-1">
          <button onClick={() => setView('overview')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${view === 'overview' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Overview</button>
          <button onClick={() => setView('studio')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${view === 'studio' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}>Document Studio</button>
        </div>
      </section>

      {view === 'overview' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<CircleDollarSign size={20} />} label="Revenue this month" value="KES 482,600" trend="+14.8% vs Jan" accent="amber" />
            <MetricCard icon={<WalletCards size={20} />} label="Collected" value="KES 396,150" trend="82.1% collection rate" accent="emerald" />
            <MetricCard icon={<FileText size={20} />} label="Outstanding" value="KES 86,450" trend="8 invoices awaiting payment" accent="sky" />
            <MetricCard icon={<Banknote size={20} />} label="Operating expenses" value="KES 141,200" trend="Down 4.2% vs Jan" accent="violet" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
            <div className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Document activity</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Recent financial documents</h3>
                </div>
                <button onClick={() => setView('studio')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200">Open studio <ArrowUpRight size={15} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="border-y border-slate-700 bg-[#0e151f] text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    <tr><th className="px-3 py-3">Document</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Issued</th><th className="px-3 py-3 text-right">Amount</th><th className="px-3 py-3 text-right">Status</th></tr>
                  </thead>
                  <tbody>
                    {RECENT_DOCUMENTS.map((doc) => <tr key={doc.ref} className="border-b border-slate-800 text-sm transition hover:bg-slate-800/45">
                      <td className="px-3 py-4"><p className="font-semibold text-slate-100">{doc.type}</p><p className="mt-0.5 font-mono text-xs text-slate-500">{doc.ref}</p></td>
                      <td className="px-3 py-4 text-slate-300">{doc.client}</td><td className="px-3 py-4 text-slate-400">{doc.date}</td>
                      <td className="px-3 py-4 text-right font-semibold text-white">{doc.amount}</td>
                      <td className="px-3 py-4 text-right"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${doc.colour}`}>{doc.status}</span></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
                <div className="mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-amber-300" /><h3 className="font-semibold text-white">Finance attention</h3></div>
                <div className="space-y-3">
                  <ActionRow dot="bg-rose-400" title="2 invoices overdue" description="KES 34,200 needs follow-up" action="Review" />
                  <ActionRow dot="bg-amber-400" title="3 quotations expiring" description="Follow up before 04 Feb" action="Follow up" />
                  <ActionRow dot="bg-sky-400" title="1 payment to match" description="M-Pesa transaction received" action="Match" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Document control</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Every record is traceable.</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Unique references, linked booking context, customer history, and document status are designed into every financial action.</p>
                <button onClick={() => setView('studio')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"><Plus size={16} /> Create document</button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(430px,0.8fr)]">
          <div className="rounded-2xl border border-slate-700 bg-[#121a24] shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
            <div className="border-b border-slate-700 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">Document Studio</p><h3 className="mt-1 text-xl font-semibold text-white">Create a new customer document</h3><p className="mt-1 text-sm text-slate-400">{config.description}</p></div>
                <div className="rounded-xl border border-slate-700 bg-[#0b1118] px-3 py-2 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Auto-generated reference</p><p className="mt-1 font-mono text-sm font-semibold text-white">{reference}</p></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(Object.keys(DOCUMENT_CONFIG) as DocumentType[]).map((type) => <button key={type} onClick={() => selectDocumentType(type)} className={`rounded-xl border px-3 py-3 text-left transition ${documentType === type ? DOCUMENT_CONFIG[type].accent : 'border-slate-700 bg-[#0e151f] text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}><p className="text-xs font-bold">{DOCUMENT_CONFIG[type].shortLabel}</p><p className="mt-1 text-[10px] font-mono opacity-80">{DOCUMENT_CONFIG[type].prefix}-•••</p></button>)}
              </div>
            </div>

            <div className="space-y-6 p-6">
              <FormSection icon={<FileCheck2 size={17} />} title="Customer & booking">
                <div className="grid gap-4 md:grid-cols-2"><SelectField label="Customer" value={customer} onChange={setCustomer} options={['Kevin Indrassen', 'Mary Ochieng', 'Safari M. Ltd', 'Amani Tours']} />                <SelectField label="Linked booking" value={booking} onChange={setBooking} options={['BK-2026-00187 · Kevin Indrassen · Toyota KDE', 'BK-2026-00192 · Mary Ochieng · Land Cruiser Safari', 'BK-2026-00204 · Safari M. Ltd · Toyota Hiace Van', 'BK-2026-00201 · Amani Tours · Toyota Fortuner']} /></div>
              </FormSection>

              <FormSection icon={<CalendarDays size={17} />} title="Document details">
                <div className="grid gap-4 md:grid-cols-3"><InputField label="Issue date" value={issueDate} onChange={setIssueDate} /><InputField label={documentType === 'invoice' ? 'Due date' : 'Valid until'} value={dueDate} onChange={setDueDate} /><SelectField label="Currency" value="KES" onChange={() => undefined} options={['KES', 'USD', 'EUR']} disabled /></div>
              </FormSection>

              <FormSection icon={<Receipt size={17} />} title="Line items" action={<button onClick={addLineItem} className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200"><Plus size={14} /> Add line</button>}>
                <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full min-w-[660px] text-left text-sm"><thead className="bg-[#0e151f] text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500"><tr><th className="px-3 py-3">Description</th><th className="px-3 py-3 text-center">Qty</th><th className="px-3 py-3 text-right">Rate</th><th className="px-3 py-3 text-right">Amount</th><th className="w-10 px-2" /></tr></thead><tbody>{items.map((item, index) => <tr key={index} className="border-t border-slate-800"><td className="px-3 py-3"><input value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} className="w-full bg-transparent text-slate-200 outline-none placeholder:text-slate-600" /></td><td className="px-3 py-3 text-center"><input type="number" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', Number(event.target.value))} className="w-14 bg-transparent text-center text-slate-200 outline-none" /></td><td className="px-3 py-3 text-right"><input type="number" value={item.rate} onChange={(event) => updateItem(index, 'rate', Number(event.target.value))} className="w-24 bg-transparent text-right text-slate-200 outline-none" /></td><td className="px-3 py-3 text-right font-semibold text-white">{formatKES(item.quantity * item.rate)}</td><td className="px-2 text-right"><button onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-300"><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div>
              </FormSection>

              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                <FormSection icon={<FileText size={17} />} title="Notes & terms"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[112px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-4 py-3 text-sm leading-6 text-slate-200 outline-none transition focus:border-amber-400/60" /></FormSection>
                <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Document total</p><div className="mt-4 space-y-2 text-sm"><SummaryRow label="Subtotal" value={formatKES(subtotal)} /><SummaryRow label="VAT (16%)" value={formatKES(vat)} /><div className="mt-3 flex items-end justify-between border-t border-slate-700 pt-3"><span className="font-semibold text-white">Grand total</span><span className="text-xl font-bold text-amber-300">{formatKES(total)}</span></div></div></div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-700 pt-5 sm:flex-row sm:justify-between"><button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"><FileText size={16} /> Save draft</button><div className="flex flex-col gap-3 sm:flex-row"><button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"><Search size={16} /> Preview PDF</button><button onClick={() => setIsGenerated(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"><Send size={16} /> {config.action}</button></div></div>
              {isGenerated && <div className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200"><BadgeCheck size={17} /> {config.label} {reference} is ready for review and sending.</div>}
            </div>
          </div>

          <aside className="self-start rounded-2xl border border-slate-700 bg-[#121a24] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.2)] 2xl:sticky 2xl:top-6">
            <div className="mb-4 flex items-center justify-between px-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Live A4 preview</p><p className="mt-1 text-sm font-semibold text-white">{config.label} · {reference}</p></div><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Ready</span></div>
            <DocumentPreview type={documentType} reference={reference} customer={customer} booking={booking} issueDate={issueDate} dueDate={dueDate} items={items} subtotal={subtotal} vat={vat} total={total} notes={notes} branch={currentBranch} />
          </aside>
        </section>
      )}
    </div>
  )
}

function MetricCard({ icon, label, value, trend, accent }: { icon: React.ReactNode; label: string; value: string; trend: string; accent: 'amber' | 'emerald' | 'sky' | 'violet' }) {
  const tones = { amber: 'bg-amber-400/10 border-amber-400/20 text-amber-300', emerald: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300', sky: 'bg-sky-400/10 border-sky-400/20 text-sky-300', violet: 'bg-violet-400/10 border-violet-400/20 text-violet-300' }
  return <div className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.16)]"><div className="flex items-center justify-between"><span className={`rounded-xl border p-2.5 ${tones[accent]}`}>{icon}</span><ArrowUpRight size={16} className="text-slate-500" /></div><p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p><p className="mt-2 text-xs text-slate-400">{trend}</p></div>
}

function ActionRow({ dot, title, description, action }: { dot: string; title: string; description: string; action: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#0e151f] p-3"><span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-200">{title}</p><p className="mt-0.5 text-xs text-slate-500">{description}</p></div><button className="text-xs font-bold text-amber-300 hover:text-amber-200">{action}</button></div>
}

function FormSection({ icon, title, children, action }: { icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-200">{icon}<span>{title}</span></div>{action}</div>{children}</section>
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60" /></label>
}

function SelectField({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; disabled?: boolean }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">{label}</span><div className="relative"><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 pr-10 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 disabled:cursor-not-allowed">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-3.5 text-slate-500" /></div></label>
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between text-slate-400"><span>{label}</span><span className="font-medium text-slate-200">{value}</span></div> }

function DocumentPreview({ type, reference, customer, booking, issueDate, dueDate, items, subtotal, vat, total, notes, branch = 'eldoret' }: { type: DocumentType; reference: string; customer: string; booking: string; issueDate: string; dueDate: string; items: LineItem[]; subtotal: number; vat: number; total: number; notes: string; branch?: 'eldoret' | 'kisumu' }) {
  const config = DOCUMENT_CONFIG[type]
  const branchData = BRANCHES[branch]
  return <div className="overflow-hidden rounded-lg bg-[#f9faf7] text-slate-800 shadow-[0_22px_45px_rgba(0,0,0,0.32)]"><div className="border-t-[7px] border-[#0b2545] px-7 pb-7 pt-6"><div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-5"><div className="flex items-center gap-3"><img src="/branding/psk-logo.png" alt="PSK Safaris" className="h-12 w-12 object-contain" /><div><p className="text-sm font-extrabold tracking-tight text-[#0b2545]">{branchData.name.toUpperCase()}</p><p className="text-[10px] font-semibold tracking-wide text-[#647048]">& CAR RENTALS</p><p className="mt-1 text-[8px] leading-3 text-slate-500">{branchData.address} · {branchData.poBox}<br />{branchData.tel1} · PIN {branchData.pin}</p></div></div><div className="text-right"><span className="inline-flex bg-[#0b2545] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white">{config.label.toUpperCase()}</span><p className="mt-3 text-[9px] text-slate-500">REFERENCE</p><p className="font-mono text-[10px] font-bold text-[#0b2545]">{reference}</p></div></div><div className="grid grid-cols-2 gap-4 py-5 text-[9px]"><div><p className="font-bold uppercase tracking-[0.12em] text-[#a06512]">Bill to</p><p className="mt-2 text-[11px] font-bold">{customer}</p><p className="mt-0.5 text-slate-500">Customer account · PSK Safaris</p></div><div className="border-l border-slate-300 pl-4"><p className="font-bold uppercase tracking-[0.12em] text-[#a06512]">Travel reference</p><p className="mt-2 text-[11px] font-bold">{booking}</p><p className="mt-0.5 text-slate-500">Issued {issueDate} · Due {dueDate}</p></div></div><table className="w-full border-collapse text-left text-[8px]"><thead className="bg-[#0b2545] text-white"><tr><th className="px-2 py-2 font-bold">Description</th><th className="px-2 py-2 text-center">Qty</th><th className="px-2 py-2 text-right">Rate</th><th className="px-2 py-2 text-right">Amount</th></tr></thead><tbody>{items.map((item, index) => <tr key={index} className="border-b border-slate-300"><td className="px-2 py-2.5">{item.description || 'Service item'}</td><td className="px-2 py-2.5 text-center">{item.quantity}</td><td className="px-2 py-2.5 text-right">{formatKES(item.rate)}</td><td className="px-2 py-2.5 text-right font-semibold">{formatKES(item.quantity * item.rate)}</td></tr>)}</tbody></table><div className="ml-auto mt-5 w-[55%] border border-slate-300 text-[9px]"><PreviewTotal label="Subtotal" value={formatKES(subtotal)} /><PreviewTotal label="VAT (16%)" value={formatKES(vat)} /><div className="flex justify-between bg-[#0b2545] px-3 py-2.5 font-bold text-white"><span>GRAND TOTAL</span><span>{formatKES(total)}</span></div></div><div className="mt-6 border-t border-slate-300 pt-4 text-[8px] leading-3 text-slate-500"><p className="font-bold uppercase tracking-[0.1em] text-[#a06512]">Notes & terms</p><p className="mt-1.5">{notes}</p></div></div><div className="border-t border-slate-300 px-7 py-3 text-center text-[8px] font-semibold tracking-wide text-[#0b2545]">SELF DRIVE · CHAUFFEUR DRIVEN · AIRPORT TRANSFERS · SAFARIS & EXCURSIONS<br />{branchData.tel2} · {branchData.email}</div></div>
}

function PreviewTotal({ label, value }: { label: string; value: string }) { return <div className="flex justify-between border-b border-slate-300 px-3 py-2"><span className="text-slate-500">{label}</span><span className="font-medium">{value}</span></div> }
