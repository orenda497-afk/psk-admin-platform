import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react'

type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

interface Quotation {
  id: string
  reference: string
  customer: string
  email: string
  amount: number
  status: QuotationStatus
  createdDate: string
  expiryDate: string
  description: string
  items: string[]
  notes?: string
}

interface NewQuotation {
  customer: string
  email: string
  amount: number
  description: string
  items: string
  notes: string
}

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'QT-001',
    reference: 'QT-2026-000240',
    customer: 'Mary Ochieng',
    email: 'mary.ochieng@email.com',
    amount: 87000,
    status: 'accepted',
    createdDate: '01 Feb 2026',
    expiryDate: '01 Mar 2026',
    description: 'Amboseli National Park 3-day safari with guide and fuel',
    items: ['Land Cruiser Safari rental', 'Professional guide (3 days)', 'Fuel and tolls', 'Park entry fees'],
    notes: 'Client accepted on 03 Feb. Ready to convert to invoice.',
  },
  {
    id: 'QT-002',
    reference: 'QT-2026-000241',
    customer: 'Amani Tours',
    email: 'admin@amanitours.com',
    amount: 45000,
    status: 'sent',
    createdDate: '04 Feb 2026',
    expiryDate: '04 Mar 2026',
    description: 'Chauffeur-driven city tour for 5 days',
    items: ['Toyota Fortuner rental', 'Professional driver (5 days)', 'Fuel and tolls', 'Hotel pickups/dropoffs'],
    notes: 'Awaiting client confirmation. Follow up by 18 Feb.',
  },
  {
    id: 'QT-003',
    reference: 'QT-2026-000239',
    customer: 'Safari M. Ltd',
    email: 'bookings@safarim.co.ke',
    amount: 156000,
    status: 'draft',
    createdDate: '05 Feb 2026',
    expiryDate: '05 Mar 2026',
    description: 'Multi-day safari package with accommodation',
    items: ['2x Land Cruiser Safari', 'Guides and drivers', 'Accommodation (4 nights)', 'Meals and activities'],
    notes: 'Draft quotation. Awaiting client requirements clarification.',
  },
  {
    id: 'QT-004',
    reference: 'QT-2026-000238',
    customer: 'John Smith',
    email: 'john.smith@gmail.com',
    amount: 5600,
    status: 'expired',
    createdDate: '02 Feb 2026',
    expiryDate: '02 Feb 2026',
    description: 'Self-drive vehicle rental for 1 day',
    items: ['Land Cruiser Prado rental (1 day)', 'Insurance', 'GPS device'],
    notes: 'Quotation expired. Client did not respond.',
  },
  {
    id: 'QT-005',
    reference: 'QT-2026-000237',
    customer: 'Kevin Indrassen',
    email: 'kevin@example.com',
    amount: 12500,
    status: 'rejected',
    createdDate: '31 Jan 2026',
    expiryDate: '28 Feb 2026',
    description: 'Weekend getaway vehicle rental',
    items: ['Toyota KDE rental (2 days)', 'Insurance', 'Fuel allowance'],
    notes: 'Client rejected due to pricing. Offered alternative not accepted.',
  },
]

const statusConfig: Record<QuotationStatus, { label: string; bg: string; text: string; dot: string; icon: string }> = {
  draft: { label: 'Draft', bg: 'bg-slate-400/10', text: 'text-slate-300', dot: 'bg-slate-400', icon: '📝' },
  sent: { label: 'Sent', bg: 'bg-sky-400/10', text: 'text-sky-300', dot: 'bg-sky-400', icon: '📤' },
  accepted: { label: 'Accepted', bg: 'bg-emerald-400/10', text: 'text-emerald-300', dot: 'bg-emerald-400', icon: '✅' },
  rejected: { label: 'Rejected', bg: 'bg-rose-400/10', text: 'text-rose-300', dot: 'bg-rose-400', icon: '❌' },
  expired: { label: 'Expired', bg: 'bg-amber-400/10', text: 'text-amber-300', dot: 'bg-amber-400', icon: '⏰' },
}

const formatKES = (value: number) => `KES ${value.toLocaleString('en-KE')}`

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<QuotationStatus | 'all'>('all')
  const [newQuotation, setNewQuotation] = useState<NewQuotation>({
    customer: '',
    email: '',
    amount: 0,
    description: '',
    items: '',
    notes: '',
  })

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const matchesSearch =
        quotation.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || quotation.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [quotations, searchTerm, filterStatus])

  const stats = useMemo(() => {
    const total = quotations.reduce((sum, q) => sum + q.amount, 0)
    const accepted = quotations.filter((q) => q.status === 'accepted').reduce((sum, q) => sum + q.amount, 0)
    const pending = quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length
    return { total, accepted, pending }
  }, [quotations])

  const handleCreateQuotation = () => {
    if (!newQuotation.customer || !newQuotation.email || !newQuotation.amount) {
      alert('Please fill in all required fields')
      return
    }

    const quotation: Quotation = {
      id: `QT-${String(quotations.length + 1).padStart(3, '0')}`,
      reference: `QT-2026-${String(quotations.length + 1).padStart(6, '0')}`,
      customer: newQuotation.customer,
      email: newQuotation.email,
      amount: newQuotation.amount,
      status: 'draft',
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: newQuotation.description,
      items: newQuotation.items.split('\n').filter((item) => item.trim()),
      notes: newQuotation.notes,
    }

    setQuotations([quotation, ...quotations])
    setNewQuotation({ customer: '', email: '', amount: 0, description: '', items: '', notes: '' })
    setShowForm(false)
  }

  const handleDeleteQuotation = (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(quotations.filter((q) => q.id !== id))
      if (selectedQuotation?.id === id) setSelectedQuotation(null)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-[#121a24] px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.08)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Quotation Management</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Track all customer proposals.</h2>
          <p className="mt-1 text-sm text-slate-400">Create, send, and monitor quotations. Track acceptance rates and convert to invoices.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
        >
          <Plus size={16} /> New quotation
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<DollarSign size={20} />} label="Total quotations" value={formatKES(stats.total)} trend={`${quotations.length} proposals`} accent="amber" />
        <MetricCard icon={<CheckCircle size={20} />} label="Accepted value" value={formatKES(stats.accepted)} trend={`${Math.round((stats.accepted / stats.total) * 100) || 0}% conversion`} accent="emerald" />
        <MetricCard icon={<Clock size={20} />} label="Pending response" value={String(stats.pending)} trend="Awaiting client decision" accent="sky" />
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Create new quotation</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Customer name" required>
              <input
                type="text"
                value={newQuotation.customer}
                onChange={(e) => setNewQuotation({ ...newQuotation, customer: e.target.value })}
                placeholder="Customer or company name"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={newQuotation.email}
                onChange={(e) => setNewQuotation({ ...newQuotation, email: e.target.value })}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Quotation amount (KES)" required>
              <input
                type="number"
                value={newQuotation.amount}
                onChange={(e) => setNewQuotation({ ...newQuotation, amount: Number(e.target.value) })}
                placeholder="50000"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Service description" required>
              <input
                type="text"
                value={newQuotation.description}
                onChange={(e) => setNewQuotation({ ...newQuotation, description: e.target.value })}
                placeholder="e.g., 3-day safari package"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
              />
            </FormField>
          </div>

          <FormField label="Line items (one per line)">
            <textarea
              value={newQuotation.items}
              onChange={(e) => setNewQuotation({ ...newQuotation, items: e.target.value })}
              placeholder="Vehicle rental&#10;Driver/guide&#10;Fuel and tolls&#10;Insurance"
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              value={newQuotation.notes}
              onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
              placeholder="Terms, conditions, or special notes..."
              className="min-h-[80px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
            />
          </FormField>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateQuotation}
              className="flex-1 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              Create quotation
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Quotations</span>
            <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">{filteredQuotations.length}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by reference, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] pl-10 pr-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-amber-400/60 placeholder:text-slate-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as QuotationStatus | 'all')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-amber-400/60"
            >
              <option value="all">All statuses</option>
              {(Object.keys(statusConfig) as QuotationStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusConfig[status].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-y border-slate-700 bg-[#0e151f] text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-3 py-3">Reference</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Expires</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((quotation) => {
                const status = statusConfig[quotation.status]
                return (
                  <tr key={quotation.id} className="border-b border-slate-800 transition hover:bg-slate-800/45">
                    <td className="px-3 py-4">
                      <button
                        onClick={() => setSelectedQuotation(quotation)}
                        className="font-semibold text-amber-300 hover:text-amber-200"
                      >
                        {quotation.reference}
                      </button>
                    </td>
                    <td className="px-3 py-4 text-slate-300">{quotation.customer}</td>
                    <td className="px-3 py-4 font-semibold text-white">{formatKES(quotation.amount)}</td>
                    <td className="px-3 py-4 text-sm text-slate-400">{quotation.createdDate}</td>
                    <td className="px-3 py-4 text-sm text-slate-400">{quotation.expiryDate}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} border-current/20`}>
                        <span className="text-xs">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedQuotation(quotation)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-amber-300"
                          title="View details"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(quotation.id)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-300"
                          title="Delete quotation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredQuotations.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No quotations found matching your filters.</p>
          </div>
        )}
      </section>

      {selectedQuotation && (
        <QuotationDetailPanel
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onDelete={() => {
            handleDeleteQuotation(selectedQuotation.id)
            setSelectedQuotation(null)
          }}
        />
      )}
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label} {required && <span className="text-rose-400">*</span>}
      </span>
      {children}
    </label>
  )
}

function MetricCard({ icon, label, value, trend, accent }: { icon: React.ReactNode; label: string; value: string; trend: string; accent: 'amber' | 'emerald' | 'sky' }) {
  const tones = { amber: 'bg-amber-400/10 border-amber-400/20 text-amber-300', emerald: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300', sky: 'bg-sky-400/10 border-sky-400/20 text-sky-300' }
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between">
        <span className={`rounded-xl border p-2.5 ${tones[accent]}`}>{icon}</span>
        <FileText size={16} className="text-slate-500" />
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{trend}</p>
    </div>
  )
}

function QuotationDetailPanel({
  quotation,
  onClose,
  onDelete,
}: {
  quotation: Quotation
  onClose: () => void
  onDelete: () => void
}) {
  const status = statusConfig[quotation.status]

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-[#121a24] shadow-[0_25px_50px_rgba(0,0,0,0.3)] sm:max-w-2xl">
        <div className="sticky top-0 border-b border-slate-700 bg-[#0e151f] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Quotation details</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{quotation.reference}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-2xl">{status.icon}</span>
              {status.label}
            </span>
            <span className="text-2xl font-bold text-amber-300">{formatKES(quotation.amount)}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard icon={<Mail size={18} />} label="Customer" value={quotation.customer} />
            <DetailCard icon={<Mail size={18} />} label="Email" value={quotation.email} />
            <DetailCard icon={<Calendar size={18} />} label="Created" value={quotation.createdDate} />
            <DetailCard icon={<Clock size={18} />} label="Expires" value={quotation.expiryDate} />
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Service description</p>
            <p className="text-sm font-semibold text-slate-200">{quotation.description}</p>
          </div>

          {quotation.items.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Line items</p>
              <ul className="space-y-2">
                {quotation.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {quotation.notes && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Notes & terms</p>
              <p className="text-sm leading-6 text-slate-300">{quotation.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Quick actions</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <Send size={16} /> Send to customer
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <FileText size={16} /> Convert to invoice
              </button>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-700 pt-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={onDelete}
              className="flex-1 rounded-xl border border-rose-600/50 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-300 transition hover:border-rose-500 hover:bg-rose-400/20"
            >
              Delete quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-500">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
  )
}
