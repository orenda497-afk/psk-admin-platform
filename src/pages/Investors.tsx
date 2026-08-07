import { useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Calendar,
  ChevronRight,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react'

type InvestorType = 'individual' | 'institutional' | 'venture-capital'

interface Investor {
  id: string
  name: string
  type: InvestorType
  email: string
  phone: string
  location: string
  investmentAmount: number
  investmentDate: string
  equityPercentage: number
  status: 'active' | 'inactive'
  roi: number
  notes?: string
}

interface NewInvestor {
  name: string
  type: InvestorType
  email: string
  phone: string
  location: string
  investmentAmount: number
  investmentDate: string
  equityPercentage: number
  notes: string
}

const MOCK_INVESTORS: Investor[] = [
  {
    id: 'INV-001',
    name: 'Tech Ventures Kenya',
    type: 'venture-capital',
    email: 'investments@techventureskenya.com',
    phone: '+254 20 2500 1000',
    location: 'Nairobi',
    investmentAmount: 5000000,
    investmentDate: '15 Mar 2024',
    equityPercentage: 25,
    status: 'active',
    roi: 18.5,
    notes: 'Series A lead investor. Focus on East African mobility solutions.',
  },
  {
    id: 'INV-002',
    name: 'James Kipchoge',
    type: 'individual',
    email: 'james.kipchoge@email.com',
    phone: '+254 712 555 666',
    location: 'Eldoret',
    investmentAmount: 500000,
    investmentDate: '22 Jun 2024',
    equityPercentage: 5,
    status: 'active',
    roi: 12.3,
    notes: 'Local angel investor. Founder of KipTech Solutions.',
  },
  {
    id: 'INV-003',
    name: 'African Growth Fund',
    type: 'institutional',
    email: 'portfolio@africangrowth.com',
    phone: '+254 20 3000 5000',
    location: 'Nairobi',
    investmentAmount: 2000000,
    investmentDate: '08 Sep 2024',
    equityPercentage: 15,
    status: 'active',
    roi: 8.7,
    notes: 'Impact investor focused on sustainable transport in Africa.',
  },
  {
    id: 'INV-004',
    name: 'Mary Ochieng',
    type: 'individual',
    email: 'mary.ochieng@email.com',
    phone: '+254 723 666 777',
    location: 'Nairobi',
    investmentAmount: 300000,
    investmentDate: '14 Nov 2024',
    equityPercentage: 3,
    status: 'active',
    roi: 5.2,
    notes: 'Early supporter. Interested in expansion to Mombasa.',
  },
  {
    id: 'INV-005',
    name: 'Global Mobility Partners',
    type: 'institutional',
    email: 'deals@globalmobility.com',
    phone: '+1 415 555 1234',
    location: 'San Francisco',
    investmentAmount: 1500000,
    investmentDate: '01 Dec 2024',
    equityPercentage: 10,
    status: 'inactive',
    roi: 0,
    notes: 'Potential Series B investor. Currently in due diligence phase.',
  },
]

const typeConfig: Record<InvestorType, { label: string; icon: string; color: string }> = {
  individual: { label: 'Individual', icon: '👤', color: 'text-blue-300' },
  institutional: { label: 'Institutional', icon: '🏛️', color: 'text-purple-300' },
  'venture-capital': { label: 'Venture Capital', icon: '🚀', color: 'text-rose-300' },
}

const formatKES = (value: number) => `KES ${(value / 1000000).toFixed(1)}M`

export default function Investors() {
  const [investors, setInvestors] = useState<Investor[]>(MOCK_INVESTORS)
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<InvestorType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [newInvestor, setNewInvestor] = useState<NewInvestor>({
    name: '',
    type: 'individual',
    email: '',
    phone: '',
    location: '',
    investmentAmount: 0,
    investmentDate: '',
    equityPercentage: 0,
    notes: '',
  })

  const totalInvested = useMemo(() => investors.reduce((sum, inv) => sum + inv.investmentAmount, 0), [investors])
  const totalEquity = useMemo(() => investors.reduce((sum, inv) => sum + inv.equityPercentage, 0), [investors])
  const activeInvestors = useMemo(() => investors.filter((inv) => inv.status === 'active').length, [investors])

  const filteredInvestors = useMemo(() => {
    return investors.filter((investor) => {
      const matchesSearch =
        investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.phone.includes(searchTerm)
      const matchesType = filterType === 'all' || investor.type === filterType
      const matchesStatus = filterStatus === 'all' || investor.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [investors, searchTerm, filterType, filterStatus])

  const handleCreateInvestor = () => {
    if (!newInvestor.name || !newInvestor.email || !newInvestor.investmentAmount) {
      alert('Please fill in all required fields')
      return
    }

    const investor: Investor = {
      id: `INV-${String(investors.length + 1).padStart(3, '0')}`,
      name: newInvestor.name,
      type: newInvestor.type,
      email: newInvestor.email,
      phone: newInvestor.phone,
      location: newInvestor.location,
      investmentAmount: newInvestor.investmentAmount,
      investmentDate: newInvestor.investmentDate,
      equityPercentage: newInvestor.equityPercentage,
      status: 'active',
      roi: 0,
      notes: newInvestor.notes,
    }

    setInvestors([investor, ...investors])
    setNewInvestor({ name: '', type: 'individual', email: '', phone: '', location: '', investmentAmount: 0, investmentDate: '', equityPercentage: 0, notes: '' })
    setShowForm(false)
  }

  const handleDeleteInvestor = (id: string) => {
    if (confirm('Are you sure you want to delete this investor record?')) {
      setInvestors(investors.filter((inv) => inv.id !== id))
      if (selectedInvestor?.id === id) setSelectedInvestor(null)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-[#121a24] px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(244,63,94,0.08)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-300">Investor Relations</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Manage investor portfolio.</h2>
          <p className="mt-1 text-sm text-slate-400">Track investments, equity stakes, ROI, and investor relationships in one place.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-rose-300"
        >
          <Plus size={16} /> Add investor
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<DollarSign size={20} />} label="Total invested" value={formatKES(totalInvested)} trend={`${investors.length} investors`} accent="rose" />
        <MetricCard icon={<TrendingUp size={20} />} label="Total equity" value={`${totalEquity.toFixed(1)}%`} trend={`${activeInvestors} active`} accent="emerald" />
        <MetricCard icon={<BarChart3 size={20} />} label="Average ROI" value={`${(investors.filter((i) => i.status === 'active').reduce((sum, i) => sum + i.roi, 0) / activeInvestors || 0).toFixed(1)}%`} trend="Year-to-date performance" accent="amber" />
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Add new investor</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Investor name" required>
              <input
                type="text"
                value={newInvestor.name}
                onChange={(e) => setNewInvestor({ ...newInvestor, name: e.target.value })}
                placeholder="Name or company"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Investor type" required>
              <select
                value={newInvestor.type}
                onChange={(e) => setNewInvestor({ ...newInvestor, type: e.target.value as InvestorType })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60"
              >
                <option value="individual">Individual</option>
                <option value="institutional">Institutional</option>
                <option value="venture-capital">Venture Capital</option>
              </select>
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={newInvestor.email}
                onChange={(e) => setNewInvestor({ ...newInvestor, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="tel"
                value={newInvestor.phone}
                onChange={(e) => setNewInvestor({ ...newInvestor, phone: e.target.value })}
                placeholder="+254 712 345 678"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={newInvestor.location}
                onChange={(e) => setNewInvestor({ ...newInvestor, location: e.target.value })}
                placeholder="City or country"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Investment amount (KES)" required>
              <input
                type="number"
                value={newInvestor.investmentAmount}
                onChange={(e) => setNewInvestor({ ...newInvestor, investmentAmount: Number(e.target.value) })}
                placeholder="1000000"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Investment date">
              <input
                type="date"
                value={newInvestor.investmentDate}
                onChange={(e) => setNewInvestor({ ...newInvestor, investmentDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60"
              />
            </FormField>

            <FormField label="Equity percentage">
              <input
                type="number"
                step="0.1"
                value={newInvestor.equityPercentage}
                onChange={(e) => setNewInvestor({ ...newInvestor, equityPercentage: Number(e.target.value) })}
                placeholder="5"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={newInvestor.notes}
              onChange={(e) => setNewInvestor({ ...newInvestor, notes: e.target.value })}
              placeholder="Investment terms, conditions, or other notes..."
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
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
              onClick={handleCreateInvestor}
              className="flex-1 rounded-xl bg-rose-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-rose-300"
            >
              Add investor
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Investors</span>
            <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">{filteredInvestors.length}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] pl-10 pr-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-rose-400/60 placeholder:text-slate-600"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as InvestorType | 'all')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-rose-400/60"
            >
              <option value="all">All types</option>
              {(Object.keys(typeConfig) as InvestorType[]).map((type) => (
                <option key={type} value={type}>
                  {typeConfig[type].label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-rose-400/60"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredInvestors.map((investor) => (
            <InvestorCard
              key={investor.id}
              investor={investor}
              onSelect={() => setSelectedInvestor(investor)}
              onDelete={() => handleDeleteInvestor(investor.id)}
            />
          ))}
        </div>

        {filteredInvestors.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No investors found matching your filters.</p>
          </div>
        )}
      </section>

      {selectedInvestor && (
        <InvestorDetailPanel
          investor={selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
          onDelete={() => {
            handleDeleteInvestor(selectedInvestor.id)
            setSelectedInvestor(null)
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

function MetricCard({ icon, label, value, trend, accent }: { icon: React.ReactNode; label: string; value: string; trend: string; accent: 'rose' | 'emerald' | 'amber' }) {
  const tones = { rose: 'bg-rose-400/10 border-rose-400/20 text-rose-300', emerald: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300', amber: 'bg-amber-400/10 border-amber-400/20 text-amber-300' }
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between">
        <span className={`rounded-xl border p-2.5 ${tones[accent]}`}>{icon}</span>
        <TrendingUp size={16} className="text-slate-500" />
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{trend}</p>
    </div>
  )
}

function InvestorCard({
  investor,
  onSelect,
  onDelete,
}: {
  investor: Investor
  onSelect: () => void
  onDelete: () => void
}) {
  const type = typeConfig[investor.type]
  const statusColor = investor.status === 'active' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300' : 'bg-slate-400/10 border-slate-400/20 text-slate-300'

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4 transition hover:border-slate-600 hover:bg-slate-800/30">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-semibold text-white">{investor.name}</p>
          <p className="mt-1 text-xs text-slate-500">{type.icon} {type.label}</p>
        </div>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-300"
          title="Delete investor"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
          {investor.status === 'active' ? '🟢' : '⚪'} {investor.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-2 border-t border-slate-700 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <DollarSign size={14} />
          <span>{formatKES(investor.investmentAmount)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp size={14} />
          <span>{investor.equityPercentage}% equity</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={14} />
          <span>{investor.investmentDate}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-700 pt-3 text-center">
        <div>
          <p className="text-lg font-bold text-rose-300">{investor.roi.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500">ROI</p>
        </div>
        <div>
          <p className="text-lg font-bold text-amber-300">{investor.equityPercentage}%</p>
          <p className="text-[10px] text-slate-500">Equity</p>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
      >
        View details <ChevronRight size={14} />
      </button>
    </div>
  )
}

function InvestorDetailPanel({
  investor,
  onClose,
  onDelete,
}: {
  investor: Investor
  onClose: () => void
  onDelete: () => void
}) {
  const type = typeConfig[investor.type]

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-[#121a24] shadow-[0_25px_50px_rgba(0,0,0,0.3)] sm:max-w-2xl">
        <div className="sticky top-0 border-b border-slate-700 bg-[#0e151f] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Investor profile</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{investor.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-2xl">{type.icon}</span>
              {type.label}
            </span>
            <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-bold uppercase ${investor.status === 'active' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-slate-400/30 bg-slate-400/10 text-slate-300'}`}>
              {investor.status === 'active' ? '🟢' : '⚪'} {investor.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard icon={<Mail size={18} />} label="Email" value={investor.email} />
            <DetailCard icon={<Phone size={18} />} label="Phone" value={investor.phone} />
            <DetailCard icon={<MapPin size={18} />} label="Location" value={investor.location} />
            <DetailCard icon={<Calendar size={18} />} label="Investment date" value={investor.investmentDate} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Investment" value={formatKES(investor.investmentAmount)} accent="rose" />
            <StatCard label="Equity stake" value={`${investor.equityPercentage}%`} accent="amber" />
            <StatCard label="ROI" value={`${investor.roi.toFixed(1)}%`} accent="emerald" />
          </div>

          {investor.notes && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Investment terms & notes</p>
              <p className="text-sm leading-6 text-slate-300">{investor.notes}</p>
            </div>
          )}

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
              Delete investor
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: 'rose' | 'amber' | 'emerald'
}) {
  const colors = {
    rose: 'text-rose-300',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
  }
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4 text-center">
      <p className={`text-2xl font-bold ${colors[accent]}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  )
}
