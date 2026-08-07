import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'

type ClientType = 'individual' | 'corporate'

interface Client {
  id: string
  name: string
  type: ClientType
  email: string
  phone: string
  location: string
  totalBookings: number
  totalSpent: number
  outstandingBalance: number
  lastBooking: string
  notes?: string
}

interface NewClient {
  name: string
  type: ClientType
  email: string
  phone: string
  location: string
  notes: string
}

const MOCK_CLIENTS: Client[] = [
  {
    id: 'CL-001',
    name: 'Kevin Indrassen',
    type: 'individual',
    email: 'kevin@example.com',
    phone: '+254 712 345 678',
    location: 'Eldoret',
    totalBookings: 8,
    totalSpent: 28500,
    outstandingBalance: 0,
    lastBooking: '30 Jan 2026',
    notes: 'Regular customer. Prefers self-drive vehicles.',
  },
  {
    id: 'CL-002',
    name: 'Mary Ochieng',
    type: 'individual',
    email: 'mary.ochieng@email.com',
    phone: '+254 723 456 789',
    location: 'Nairobi',
    totalBookings: 12,
    totalSpent: 156800,
    outstandingBalance: 0,
    lastBooking: '05 Feb 2026',
    notes: 'VIP customer. Safari enthusiast. Books quarterly.',
  },
  {
    id: 'CL-003',
    name: 'Safari M. Ltd',
    type: 'corporate',
    email: 'bookings@safarim.co.ke',
    phone: '+254 20 2345 6789',
    location: 'Nairobi',
    totalBookings: 24,
    totalSpent: 342000,
    outstandingBalance: 18500,
    lastBooking: '03 Feb 2026',
    notes: 'Corporate account. Monthly invoicing. 30-day payment terms.',
  },
  {
    id: 'CL-004',
    name: 'Amani Tours',
    type: 'corporate',
    email: 'admin@amanitours.com',
    phone: '+254 20 7654 3210',
    location: 'Mombasa',
    totalBookings: 15,
    totalSpent: 198500,
    outstandingBalance: 8200,
    lastBooking: '10 Feb 2026',
    notes: 'Tour operator. Regular bookings. Negotiated rates.',
  },
  {
    id: 'CL-005',
    name: 'John Smith',
    type: 'individual',
    email: 'john.smith@gmail.com',
    phone: '+254 734 567 890',
    location: 'Kisumu',
    totalBookings: 3,
    totalSpent: 12400,
    outstandingBalance: 0,
    lastBooking: '02 Feb 2026',
    notes: 'New customer. First-time visitor to Kenya.',
  },
]

const formatKES = (value: number) => `KES ${value.toLocaleString('en-KE')}`

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<ClientType | 'all'>('all')
  const [newClient, setNewClient] = useState<NewClient>({
    name: '',
    type: 'individual',
    email: '',
    phone: '',
    location: '',
    notes: '',
  })

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
      const matchesType = filterType === 'all' || client.type === filterType
      return matchesSearch && matchesType
    })
  }, [clients, searchTerm, filterType])

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert('Please fill in all required fields')
      return
    }

    const client: Client = {
      id: `CL-${String(clients.length + 1).padStart(3, '0')}`,
      name: newClient.name,
      type: newClient.type,
      email: newClient.email,
      phone: newClient.phone,
      location: newClient.location,
      totalBookings: 0,
      totalSpent: 0,
      outstandingBalance: 0,
      lastBooking: 'Never',
      notes: newClient.notes,
    }

    setClients([client, ...clients])
    setNewClient({ name: '', type: 'individual', email: '', phone: '', location: '', notes: '' })
    setShowForm(false)
  }

  const handleDeleteClient = (id: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setClients(clients.filter((c) => c.id !== id))
      if (selectedClient?.id === id) setSelectedClient(null)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-[#121a24] px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(14,165,233,0.08)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">Client Management</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Build lasting customer relationships.</h2>
          <p className="mt-1 text-sm text-slate-400">Track client history, outstanding balances, and booking preferences all in one place.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
        >
          <Plus size={16} /> New client
        </button>
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Add new client</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Client name" required>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Full name or company name"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Client type" required>
              <select
                value={newClient.type}
                onChange={(e) => setNewClient({ ...newClient, type: e.target.value as ClientType })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-400/60"
              >
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Phone" required>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="+254 712 345 678"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={newClient.location}
                onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                placeholder="City or region"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-400/60 placeholder:text-slate-600"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={newClient.notes}
              onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              placeholder="Special preferences, payment terms, or other notes..."
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-400/60 placeholder:text-slate-600"
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
              onClick={handleCreateClient}
              className="flex-1 rounded-xl bg-sky-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
            >
              Add client
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Clients</span>
            <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">{filteredClients.length}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] pl-10 pr-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400/60 placeholder:text-slate-600"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ClientType | 'all')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400/60"
            >
              <option value="all">All types</option>
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSelect={() => setSelectedClient(client)}
              onDelete={() => handleDeleteClient(client.id)}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No clients found matching your search.</p>
          </div>
        )}
      </section>

      {selectedClient && (
        <ClientDetailPanel
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onDelete={() => {
            handleDeleteClient(selectedClient.id)
            setSelectedClient(null)
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

function ClientCard({
  client,
  onSelect,
  onDelete,
}: {
  client: Client
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4 transition hover:border-slate-600 hover:bg-slate-800/30">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-semibold text-white">{client.name}</p>
          <p className="mt-1 text-xs text-slate-500">{client.type === 'corporate' ? '🏢 Corporate' : '👤 Individual'}</p>
        </div>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-300"
          title="Delete client"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2 border-t border-slate-700 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Mail size={14} />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Phone size={14} />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin size={14} />
          <span>{client.location}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-700 pt-3 text-center">
        <div>
          <p className="text-lg font-bold text-sky-300">{client.totalBookings}</p>
          <p className="text-[10px] text-slate-500">Bookings</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-300">{formatKES(client.totalSpent).split(' ')[1]}</p>
          <p className="text-[10px] text-slate-500">Total spent</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${client.outstandingBalance > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
            {client.outstandingBalance > 0 ? formatKES(client.outstandingBalance).split(' ')[1] : '—'}
          </p>
          <p className="text-[10px] text-slate-500">Outstanding</p>
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

function ClientDetailPanel({
  client,
  onClose,
  onDelete,
}: {
  client: Client
  onClose: () => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-[#121a24] shadow-[0_25px_50px_rgba(0,0,0,0.3)] sm:max-w-2xl">
        <div className="sticky top-0 border-b border-slate-700 bg-[#0e151f] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Client profile</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{client.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard icon={<User size={18} />} label="Client type" value={client.type === 'corporate' ? 'Corporate' : 'Individual'} />
            <DetailCard icon={<Mail size={18} />} label="Email" value={client.email} />
            <DetailCard icon={<Phone size={18} />} label="Phone" value={client.phone} />
            <DetailCard icon={<MapPin size={18} />} label="Location" value={client.location} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total bookings" value={String(client.totalBookings)} accent="sky" />
            <StatCard label="Total spent" value={formatKES(client.totalSpent)} accent="emerald" />
            <StatCard label="Outstanding balance" value={formatKES(client.outstandingBalance)} accent={client.outstandingBalance > 0 ? 'rose' : 'slate'} />
          </div>

          {client.notes && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Notes</p>
              <p className="text-sm leading-6 text-slate-300">{client.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Quick actions</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <Calendar size={16} /> Create booking
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <DollarSign size={16} /> Create invoice
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
              Delete client
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
  accent: 'sky' | 'emerald' | 'rose' | 'slate'
}) {
  const colors = {
    sky: 'text-sky-300',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
    slate: 'text-slate-400',
  }
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4 text-center">
      <p className={`text-2xl font-bold ${colors[accent]}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  )
}
