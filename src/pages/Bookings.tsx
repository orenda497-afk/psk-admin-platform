import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
type BookingType = 'self-drive' | 'chauffeur' | 'safari' | 'transfer'

interface Booking {
  id: string
  reference: string
  customer: string
  vehicle: string
  vehicleReg: string
  startDate: string
  endDate: string
  type: BookingType
  status: BookingStatus
  amount: number
  notes: string
  driver?: string
  destination?: string
}

interface NewBooking {
  customer: string
  vehicle: string
  startDate: string
  endDate: string
  type: BookingType
  notes: string
  driver?: string
  destination?: string
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-001',
    reference: 'BK-2026-00187',
    customer: 'Kevin Indrassen',
    vehicle: 'Toyota KDE',
    vehicleReg: 'KDE 456',
    startDate: '28 Jan 2026',
    endDate: '30 Jan 2026',
    type: 'self-drive',
    status: 'completed',
    amount: 3500,
    notes: 'Eldoret to Kisumu trip. Returned in good condition.',
  },
  {
    id: 'BK-002',
    reference: 'BK-2026-00192',
    customer: 'Mary Ochieng',
    vehicle: 'Land Cruiser Safari',
    vehicleReg: 'LCS 789',
    startDate: '05 Feb 2026',
    endDate: '08 Feb 2026',
    type: 'safari',
    status: 'confirmed',
    amount: 87000,
    notes: 'Amboseli National Park 3-day safari. Includes guide and fuel.',
    driver: 'James Kipchoge',
    destination: 'Amboseli NP',
  },
  {
    id: 'BK-003',
    reference: 'BK-2026-00204',
    customer: 'Safari M. Ltd',
    vehicle: 'Toyota Hiace Van',
    vehicleReg: 'THV 234',
    startDate: '03 Feb 2026',
    endDate: '03 Feb 2026',
    type: 'transfer',
    status: 'confirmed',
    amount: 4200,
    notes: 'Airport transfer. Jomo Kenyatta to Eldoret. 6 passengers.',
    driver: 'Peter Mwangi',
    destination: 'JKIA → Eldoret',
  },
  {
    id: 'BK-004',
    reference: 'BK-2026-00201',
    customer: 'Amani Tours',
    vehicle: 'Toyota Fortuner',
    vehicleReg: 'TF 567',
    startDate: '10 Feb 2026',
    endDate: '12 Feb 2026',
    type: 'chauffeur',
    status: 'pending',
    amount: 12500,
    notes: 'Chauffeur-driven city tour. Flexible itinerary.',
    driver: 'David Kiplagat',
    destination: 'Nairobi city',
  },
  {
    id: 'BK-005',
    reference: 'BK-2026-00205',
    customer: 'John Smith',
    vehicle: 'Land Cruiser Prado',
    vehicleReg: 'LCP 890',
    startDate: '02 Feb 2026',
    endDate: '02 Feb 2026',
    type: 'self-drive',
    status: 'cancelled',
    amount: 5600,
    notes: 'Cancelled due to weather conditions.',
  },
]

const CUSTOMERS = ['Kevin Indrassen', 'Mary Ochieng', 'Safari M. Ltd', 'Amani Tours', 'John Smith']
const VEHICLES = [
  { name: 'Toyota KDE', reg: 'KDE 456' },
  { name: 'Land Cruiser Safari', reg: 'LCS 789' },
  { name: 'Toyota Hiace Van', reg: 'THV 234' },
  { name: 'Toyota Fortuner', reg: 'TF 567' },
  { name: 'Land Cruiser Prado', reg: 'LCP 890' },
]
const DRIVERS = ['James Kipchoge', 'Peter Mwangi', 'David Kiplagat', 'Samuel Kipchoge']

const statusConfig: Record<BookingStatus, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-400/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  pending: { label: 'Pending', bg: 'bg-amber-400/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-400/10', text: 'text-rose-300', dot: 'bg-rose-400' },
  completed: { label: 'Completed', bg: 'bg-sky-400/10', text: 'text-sky-300', dot: 'bg-sky-400' },
}

const typeConfig: Record<BookingType, { label: string; icon: string }> = {
  'self-drive': { label: 'Self-Drive', icon: '🚗' },
  chauffeur: { label: 'Chauffeur', icon: '👔' },
  safari: { label: 'Safari', icon: '🦁' },
  transfer: { label: 'Transfer', icon: '🚐' },
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<BookingType | 'all'>('all')
  const [newBooking, setNewBooking] = useState<NewBooking>({
    customer: '',
    vehicle: '',
    startDate: '',
    endDate: '',
    type: 'self-drive',
    notes: '',
  })

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
      const matchesType = filterType === 'all' || booking.type === filterType
      return matchesSearch && matchesStatus && matchesType
    })
  }, [bookings, searchTerm, filterStatus, filterType])

  const handleCreateBooking = () => {
    if (!newBooking.customer || !newBooking.vehicle || !newBooking.startDate || !newBooking.endDate) {
      alert('Please fill in all required fields')
      return
    }

    const vehicleData = VEHICLES.find((v) => v.name === newBooking.vehicle)
    const booking: Booking = {
      id: `BK-${String(bookings.length + 1).padStart(3, '0')}`,
      reference: `BK-2026-${String(bookings.length + 1).padStart(5, '0')}`,
      customer: newBooking.customer,
      vehicle: newBooking.vehicle,
      vehicleReg: vehicleData?.reg || '',
      startDate: newBooking.startDate,
      endDate: newBooking.endDate,
      type: newBooking.type,
      status: 'pending',
      amount: 0,
      notes: newBooking.notes,
      driver: newBooking.driver,
      destination: newBooking.destination,
    }

    setBookings([booking, ...bookings])
    setNewBooking({ customer: '', vehicle: '', startDate: '', endDate: '', type: 'self-drive', notes: '' })
    setShowForm(false)
  }

  const handleDeleteBooking = (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter((b) => b.id !== id))
      if (selectedBooking?.id === id) setSelectedBooking(null)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-[#121a24] px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">Booking Management</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Manage all reservations in one place.</h2>
          <p className="mt-1 text-sm text-slate-400">Create, track, and link bookings to financial documents. Real-time status updates for every trip.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          <Plus size={16} /> New booking
        </button>
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Create new booking</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Customer" required>
              <select
                value={newBooking.customer}
                onChange={(e) => setNewBooking({ ...newBooking, customer: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
              >
                <option value="">Select customer...</option>
                {CUSTOMERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Vehicle" required>
              <select
                value={newBooking.vehicle}
                onChange={(e) => setNewBooking({ ...newBooking, vehicle: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
              >
                <option value="">Select vehicle...</option>
                {VEHICLES.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.reg})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Start date" required>
              <input
                type="date"
                value={newBooking.startDate}
                onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
              />
            </FormField>

            <FormField label="End date" required>
              <input
                type="date"
                value={newBooking.endDate}
                onChange={(e) => setNewBooking({ ...newBooking, endDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
              />
            </FormField>

            <FormField label="Booking type" required>
              <select
                value={newBooking.type}
                onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value as BookingType })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
              >
                {(Object.keys(typeConfig) as BookingType[]).map((type) => (
                  <option key={type} value={type}>
                    {typeConfig[type].label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Driver (optional)">
              <select
                value={newBooking.driver || ''}
                onChange={(e) => setNewBooking({ ...newBooking, driver: e.target.value || undefined })}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
              >
                <option value="">No driver assigned</option>
                {DRIVERS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Destination (optional)">
              <input
                type="text"
                value={newBooking.destination || ''}
                onChange={(e) => setNewBooking({ ...newBooking, destination: e.target.value })}
                placeholder="e.g., Amboseli NP, JKIA, Nairobi"
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60 placeholder:text-slate-600"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={newBooking.notes}
              onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
              placeholder="Special requests, instructions, or additional details..."
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60 placeholder:text-slate-600"
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
              onClick={handleCreateBooking}
              className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Create booking
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-700 bg-[#121a24] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Bookings</span>
            <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">{filteredBookings.length}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by reference, customer, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0e151f] pl-10 pr-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60 placeholder:text-slate-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
            >
              <option value="all">All statuses</option>
              {(Object.keys(statusConfig) as BookingStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusConfig[status].label}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as BookingType | 'all')}
              className="rounded-xl border border-slate-700 bg-[#0e151f] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-emerald-400/60"
            >
              <option value="all">All types</option>
              {(Object.keys(typeConfig) as BookingType[]).map((type) => (
                <option key={type} value={type}>
                  {typeConfig[type].label}
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
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Dates</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const status = statusConfig[booking.status]
                const type = typeConfig[booking.type]
                return (
                  <tr key={booking.id} className="border-b border-slate-800 transition hover:bg-slate-800/45">
                    <td className="px-3 py-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        {booking.reference}
                      </button>
                    </td>
                    <td className="px-3 py-4 text-slate-300">{booking.customer}</td>
                    <td className="px-3 py-4">
                      <div className="text-sm font-medium text-slate-200">{booking.vehicle}</div>
                      <div className="text-xs text-slate-500">{booking.vehicleReg}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-400">
                      {booking.startDate} → {booking.endDate}
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-lg">{type.icon}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} border-current/20`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-emerald-300"
                          title="View details"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-300"
                          title="Delete booking"
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

        {filteredBookings.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No bookings found matching your filters.</p>
          </div>
        )}
      </section>

      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onDelete={() => {
            handleDeleteBooking(selectedBooking.id)
            setSelectedBooking(null)
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

function BookingDetailPanel({
  booking,
  onClose,
  onDelete,
}: {
  booking: Booking
  onClose: () => void
  onDelete: () => void
}) {
  const status = statusConfig[booking.status]
  const type = typeConfig[booking.type]

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-[#121a24] shadow-[0_25px_50px_rgba(0,0,0,0.3)] sm:max-w-2xl">
        <div className="sticky top-0 border-b border-slate-700 bg-[#0e151f] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Booking details</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{booking.reference}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard icon={<User size={18} />} label="Customer" value={booking.customer} />
            <DetailCard icon={<Calendar size={18} />} label="Status" value={status.label} accent={status.text} />
            <DetailCard icon={<MapPin size={18} />} label="Vehicle" value={`${booking.vehicle} (${booking.vehicleReg})`} />
            <DetailCard icon={<Clock size={18} />} label="Type" value={`${type.icon} ${type.label}`} />
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Travel dates</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-white">{booking.startDate}</span>
              <ChevronRight size={16} className="text-slate-600" />
              <span className="font-semibold text-white">{booking.endDate}</span>
            </div>
          </div>

          {booking.driver && (
            <DetailCard icon={<User size={18} />} label="Assigned driver" value={booking.driver} />
          )}

          {booking.destination && (
            <DetailCard icon={<MapPin size={18} />} label="Destination" value={booking.destination} />
          )}

          {booking.notes && (
            <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Notes</p>
              <p className="text-sm leading-6 text-slate-300">{booking.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Booking amount</p>
            <p className="text-2xl font-bold text-emerald-300">KES {booking.amount.toLocaleString('en-KE')}</p>
            <p className="mt-1 text-xs text-slate-500">Estimated total for this booking</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Quick actions</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <FileText size={16} /> Create invoice
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                <FileText size={16} /> Create quotation
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
              Delete booking
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
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0e151f] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-500">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
      <p className={`text-sm font-semibold ${accent || 'text-slate-200'}`}>{value}</p>
    </div>
  )
}
