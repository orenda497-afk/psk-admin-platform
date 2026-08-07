import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'

type DriverStatus = 'available' | 'on-duty' | 'off-duty' | 'on-leave'

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  status: DriverStatus
  rating: number
  totalTrips: number
  yearsExperience: number
  assignedVehicle?: string
  location: string
  notes?: string
}

interface NewDriver {
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  yearsExperience: number
  location: string
  notes: string
}

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'DR-001',
    name: 'James Kipchoge',
    phone: '+254 712 111 222',
    email: 'james.kipchoge@email.com',
    licenseNumber: 'DL-2019-001234',
    licenseExpiry: '15 Aug 2027',
    status: 'available',
    rating: 4.8,
    totalTrips: 156,
    yearsExperience: 8,
    assignedVehicle: 'Land Cruiser Safari (LCS 789)',
    location: 'Eldoret',
    notes: 'Excellent safari guide. Fluent in English, Swahili, and German.',
  },
  {
    id: 'DR-002',
    name: 'Peter Mwangi',
    phone: '+254 723 222 333',
    email: 'peter.mwangi@email.com',
    licenseNumber: 'DL-2018-005678',
    licenseExpiry: '22 Mar 2026',
    status: 'on-duty',
    rating: 4.6,
    totalTrips: 203,
    yearsExperience: 10,
    assignedVehicle: 'Toyota Hiace Van (THV 234)',
    location: 'Nairobi',
    notes: 'Specializes in airport transfers. Punctual and professional.',
  },
  {
    id: 'DR-003',
    name: 'David Kiplagat',
    phone: '+254 734 333 444',
    email: 'david.kiplagat@email.com',
    licenseNumber: 'DL-2020-009012',
    licenseExpiry: '10 Dec 2028',
    status: 'available',
    rating: 4.9,
    totalTrips: 89,
    yearsExperience: 5,
    assignedVehicle: 'Toyota Fortuner (TF 567)',
    location: 'Mombasa',
    notes: 'New but highly rated. Excellent customer service skills.',
  },
  {
    id: 'DR-004',
    name: 'Samuel Kipchoge',
    phone: '+254 745 444 555',
    email: 'samuel.kipchoge@email.com',
    licenseNumber: 'DL-2017-003456',
    licenseExpiry: '05 Jan 2026',
    status: 'on-leave',
    rating: 4.5,
    totalTrips: 178,
    yearsExperience: 12,
    location: 'Kisumu',
    notes: 'Senior driver. On leave until 10 Feb 2026.',
  },
]

const statusConfig: Record<DriverStatus, { label: string; bg: string; text: string; dot: string }> = {
  available: { label: 'Available', bg: 'bg-emerald-400/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  'on-duty': { label: 'On duty', bg: 'bg-amber-400/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  'off-duty': { label: 'Off duty', bg: 'bg-slate-400/10', text: 'text-slate-300', dot: 'bg-slate-400' },
  'on-leave': { label: 'On leave', bg: 'bg-sky-400/10', text: 'text-sky-300', dot: 'bg-sky-400' },
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<DriverStatus | 'all'>('all')
  const [newDriver, setNewDriver] = useState<NewDriver>({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    yearsExperience: 1,
    location: '',
    notes: '',
  })

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || driver.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [drivers, searchTerm, filterStatus])

  const handleCreateDriver = () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.email || !newDriver.licenseNumber) {
      alert('Please fill in all required fields')
      return
    }

    const driver: Driver = {
      id: `DR-${String(drivers.length + 1).padStart(3, '0')}`,
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      licenseNumber: newDriver.licenseNumber,
      licenseExpiry: newDriver.licenseExpiry,
      status: 'available',
      rating: 4.5,
      totalTrips: 0,
      yearsExperience: newDriver.yearsExperience,
      location: newDriver.location,
      notes: newDriver.notes,
    }

    setDrivers([driver, ...drivers])
    setNewDriver({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '', yearsExperience: 1, location: '', notes: '' })
    setShowForm(false)
  }

  const handleDeleteDriver = (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter((d) => d.id !== id))
      if (selectedDriver?.id === id) setSelectedDriver(null)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-[#121a24] px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_0_4px_rgba(139,92,246,0.08)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">Driver Management</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Manage your driving team.</h2>
          <p className="mt-1 text-sm text-slate-400">Track licenses, ratings, assignments, and driver availability in real-time.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-300"
        >
          <Plus size={16} /> Add driver
        </button>
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Add new driver</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Full name" required>
              <input
                type="text"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                placeholder="Driver's full name"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={newDriver.email}
                onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="Phone" required>
              <input
                type="tel"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                placeholder="+254 712 345 678"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="License number" required>
              <input
                type="text"
                value={newDriver.licenseNumber}
                onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                placeholder="DL-YYYY-XXXXXX"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
              />
            </FormField>

            <FormField label="License expiry">
              <input
                type="date"
                value={newDriver.licenseExpiry}
                onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60"
              />
            </FormField>

            <FormField label="Years of experience">
              <input
                type="number"
                min="1"
                value={newDriver.yearsExperience}
                onChange={(e) => setNewDriver({ ...newDriver, yearsExperience: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60"
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={newDriver.location}
                onChange={(e) => setNewDriver({ ...newDriver, location: e.target.value })}
                placeholder="City or base location"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={newDriver.notes}
              onChange={(e) => setNewDriver({ ...newDriver, notes: e.target.value })}
              placeholder="Skills, certifications, languages, or other notes..."
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
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
              onClick={handleCreateDriver}
              className="flex-1 rounded-xl bg-violet-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-300"
            >
              Add driver
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Drivers</span>
            <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">{filteredDrivers.length}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] pl-10 pr-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-violet-400/60 placeholder:text-slate-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DriverStatus | 'all')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-violet-400/60"
            >
              <option value="all">All statuses</option>
              {(Object.keys(statusConfig) as DriverStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusConfig[status].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredDrivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onSelect={() => setSelectedDriver(driver)}
              onDelete={() => handleDeleteDriver(driver.id)}
            />
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No drivers found matching your filters.</p>
          </div>
        )}
      </section>

      {selectedDriver && (
        <DriverDetailPanel
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onDelete={() => {
            handleDeleteDriver(selectedDriver.id)
            setSelectedDriver(null)
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

function DriverCard({
  driver,
  onSelect,
  onDelete,
}: {
  driver: Driver
  onSelect: () => void
  onDelete: () => void
}) {
  const status = statusConfig[driver.status]
  const licenseExpiring = new Date(driver.licenseExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4 transition hover:border-slate-600 hover:bg-slate-800/30">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-semibold text-white">{driver.name}</p>
          <p className="mt-1 text-xs text-slate-500">ID: {driver.id}</p>
        </div>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-300"
          title="Delete driver"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} border-current/20`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
        {licenseExpiring && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-[10px] font-bold text-rose-300">
            ⚠️ License expiring
          </span>
        )}
      </div>

      <div className="space-y-2 border-t border-slate-700 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Phone size={14} />
          <span>{driver.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <CreditCard size={14} />
          <span>{driver.licenseNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin size={14} />
          <span>{driver.location}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-700 pt-3 text-center">
        <div>
          <div className="flex items-center justify-center gap-1">
            <Star size={14} className="text-amber-400" />
            <p className="font-bold text-amber-300">{driver.rating}</p>
          </div>
          <p className="text-[10px] text-slate-500">Rating</p>
        </div>
        <div>
          <p className="text-lg font-bold text-violet-300">{driver.totalTrips}</p>
          <p className="text-[10px] text-slate-500">Trips</p>
        </div>
        <div>
          <p className="text-lg font-bold text-sky-300">{driver.yearsExperience}</p>
          <p className="text-[10px] text-slate-500">Years</p>
        </div>
      </div>

      {driver.assignedVehicle && (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/30 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Assigned vehicle</p>
          <p className="mt-1 text-xs font-semibold text-slate-200">{driver.assignedVehicle}</p>
        </div>
      )}

      <button
        onClick={onSelect}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
      >
        View profile
      </button>
    </div>
  )
}

function DriverDetailPanel({
  driver,
  onClose,
  onDelete,
}: {
  driver: Driver
  onClose: () => void
  onDelete: () => void
}) {
  const status = statusConfig[driver.status]

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-[#121a24] shadow-[0_25px_50px_rgba(0,0,0,0.3)] sm:max-w-2xl">
        <div className="sticky top-0 border-b border-slate-700 bg-[#0e151f] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Driver profile</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{driver.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold uppercase tracking-wider ${status.bg} ${status.text} border-current/20`}>
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <div className="flex items-center gap-1">
              <Star size={18} className="text-amber-400" />
              <span className="text-lg font-bold text-amber-300">{driver.rating}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard icon={<Phone size={18} />} label="Phone" value={driver.phone} />
            <DetailCard icon={<FileText size={18} />} label="Email" value={driver.email} />
            <DetailCard icon={<CreditCard size={18} />} label="License number" value={driver.licenseNumber} />
            <DetailCard icon={<Calendar size={18} />} label="License expiry" value={driver.licenseExpiry} />
            <DetailCard icon={<Award size={18} />} label="Experience" value={`${driver.yearsExperience} years`} />
            <DetailCard icon={<MapPin size={18} />} label="Location" value={driver.location} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total trips" value={String(driver.totalTrips)} accent="violet" />
            <StatCard label="Rating" value={`${driver.rating}/5`} accent="amber" />
            <StatCard label="Experience" value={`${driver.yearsExperience} yrs`} accent="sky" />
          </div>

          {driver.assignedVehicle && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Currently assigned</p>
              <p className="text-sm font-semibold text-slate-200">{driver.assignedVehicle}</p>
            </div>
          )}

          {driver.notes && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Notes</p>
              <p className="text-sm leading-6 text-slate-300">{driver.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Quick actions</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <Calendar size={16} /> Assign to booking
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <CheckCircle size={16} /> Update status
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
              Delete driver
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
  accent: 'violet' | 'amber' | 'sky'
}) {
  const colors = {
    violet: 'text-violet-300',
    amber: 'text-amber-300',
    sky: 'text-sky-300',
  }
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4 text-center">
      <p className={`text-2xl font-bold ${colors[accent]}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  )
}
