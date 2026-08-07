import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

export default function RegistryBoard() {
  const [, setSelectedVehicle] = useState<string | null>(null)

  const vehicles = [
    { id: 1, reg: 'KBA-001-A', make: 'Toyota', model: 'Axio', year: 2022, status: 'available', holder: null, dueBack: null, investor: 'James K.', branch: 'Eldoret' },
    { id: 2, reg: 'KBA-002-A', make: 'Toyota', model: 'Allion', year: 2021, status: 'chauffeured', holder: 'Peter O.', dueBack: '2026-08-08 14:00', investor: 'James K.', branch: 'Eldoret' },
    { id: 3, reg: 'KBA-003-A', make: 'Toyota', model: 'Premio', year: 2020, status: 'service', holder: null, dueBack: null, investor: 'Mary K.', branch: 'Eldoret' },
    { id: 4, reg: 'KBA-004-S', make: 'Toyota', model: 'Fortuner', year: 2023, status: 'safari', holder: 'David K.', dueBack: '2026-08-10 18:00', investor: 'James K.', branch: 'Eldoret' },
    { id: 5, reg: 'KBA-005-S', make: 'Toyota', model: 'Land Cruiser', year: 2022, status: 'overdue', holder: 'Samuel K.', dueBack: '2026-08-05 17:00', investor: 'Robert K.', branch: 'Eldoret' },
    { id: 6, reg: 'KBA-006-M', make: 'Toyota', model: 'Hiace', year: 2021, status: 'available', holder: null, dueBack: null, investor: 'Mary K.', branch: 'Eldoret' },
  ]

  const statusConfig: Record<string, { label: string; color: string }> = {
    available: { label: 'Available', color: 'status-available' },
    chauffeured: { label: 'Out (Chauffeured)', color: 'status-chauffeured' },
    safari: { label: 'Out (Safari)', color: 'status-safari' },
    service: { label: 'Service', color: 'status-service' },
    overdue: { label: 'Overdue', color: 'status-overdue' },
    returning: { label: 'Returning Today', color: 'status-returning' },
  }

  const getStatusColor = (status: string) => statusConfig[status] || statusConfig.available

  return (
    <div className="space-y-6 min-h-screen">
      {/* Content */}
      <div className="space-y-6">
      {/* Status Strip */}
      <div className="glass-lg p-6 grid grid-cols-5 gap-0 divide-x divide-slate-800 border-slate-800 rounded-2xl">
        <div className="px-4 text-center">
          <p className="text-xs text-psk-text-secondary uppercase tracking-wider font-semibold mb-2">Total Fleet</p>
          <p className="text-3xl font-bold text-white">20</p>
          <p className="text-xs text-psk-text-secondary mt-2">Eldoret 14 · Kisumu 6</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-psk-text-secondary uppercase tracking-wider font-semibold mb-2">Available</p>
          <p className="text-2xl font-bold text-status-available flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-status-available status-pulse"></span>
            12
          </p>
          <p className="text-xs text-psk-text-secondary mt-2">Ready for booking</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-psk-text-secondary uppercase tracking-wider font-semibold mb-2">Out on Hire</p>
          <p className="text-2xl font-bold text-status-chauffeured flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-status-chauffeured status-pulse"></span>
            6
          </p>
          <p className="text-xs text-psk-text-secondary mt-2">3 chauf · 2 safari · 1 self</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-psk-text-secondary uppercase tracking-wider font-semibold mb-2">In Service</p>
          <p className="text-2xl font-bold text-status-service flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-status-service status-pulse"></span>
            2
          </p>
          <p className="text-xs text-psk-text-secondary mt-2">At workshop</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-psk-text-secondary uppercase tracking-wider font-semibold mb-2">Attention Needed</p>
          <p className="text-2xl font-bold text-status-overdue flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-status-overdue status-pulse"></span>
            2
          </p>
          <p className="text-xs text-psk-text-secondary mt-2">Act immediately</p>
        </div>
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Needs Action */}
        <div className="glass-lg p-6 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-widest text-psk-text-primary mb-4">Needs Action</h3>
          <div className="space-y-2">
            {[
              { label: 'Overdue returns', count: 2, color: 'bg-red-500/10 border-red-500/30' },
              { label: 'Unmatched M-Pesa payments', count: 3, color: 'bg-red-500/10 border-red-500/30' },
              { label: 'Documents expiring 30 days', count: 5, color: 'bg-amber-500/10 border-amber-500/30' },
              { label: 'Deposits outstanding', count: 4, color: 'bg-amber-500/10 border-amber-500/30' },
              { label: 'Service due', count: 2, color: 'bg-amber-500/10 border-amber-500/30' },
              { label: 'Vehicles idle 7+ days', count: 3, color: 'bg-gray-500/10 border-gray-500/30' },
            ].map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-glass border ${item.color} hover:brightness-110 transition text-sm`}
              >
                <span className="text-psk-text-primary">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-psk-text-gold">{item.count}</span>
                  <ChevronRight size={16} className="text-psk-text-tertiary" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Returning Today + Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Returning Today */}
          <div className="glass-lg p-6 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-psk-text-primary mb-4">
              Returning Today <span className="ml-2 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">2</span>
            </h3>
            <div className="space-y-2">
              {[
                { reg: 'KCF 223J', model: 'Prado TZ', holder: 'Mary O.', time: '4:00 PM', location: 'En route' },
                { reg: 'KCX 456B', model: 'Prado TX', holder: 'Sarah M.', time: '6:00 PM', location: 'Kisumu' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-psk-bg-surface rounded-glass border border-psk-border">
                  <div className="text-sm">
                    <p className="font-semibold text-white">{item.reg} · {item.model} · {item.holder}</p>
                    <p className="text-xs text-psk-text-tertiary">{item.time} / {item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Bookings today', value: '4' },
              { label: 'Pickups today', value: '2' },
              { label: 'Fleet util.', value: '68%' },
            ].map((stat, i) => (
              <div key={i} className="glass p-4 text-center">
                <p className="text-xs text-psk-text-secondary mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-psk-text-gold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="glass-lg p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Fleet Inventory</h3>
          <div className="flex gap-2">
            {['All 20', 'Available', 'Out', 'Service', 'Attention'].map((filter) => (
              <button
                key={filter}
                className="px-3 py-1 text-xs rounded-glass bg-psk-bg-surface border border-psk-border hover:border-psk-border-gold text-psk-text-secondary hover:text-psk-text-gold transition"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-psk-border">
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Registration</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Vehicle</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Status</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Holder / Location</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Due Back</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Investor</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-psk-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const statusConfig = getStatusColor(vehicle.status)
                return (
                  <tr
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.reg)}
                    className="border-b border-psk-border hover:bg-psk-bg-surface transition cursor-pointer"
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-white">{vehicle.reg}</p>
                      <p className="text-xs text-psk-text-tertiary">{vehicle.branch}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-white">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-psk-text-tertiary">{vehicle.year}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {vehicle.holder ? (
                        <>
                          <p className="font-medium text-white">{vehicle.holder}</p>
                          <p className="text-xs text-psk-text-tertiary">+254712345678</p>
                        </>
                      ) : (
                        <p className="text-xs text-psk-text-tertiary">Eldoret</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {vehicle.dueBack ? (
                        <p className={`text-sm font-medium ${vehicle.status === 'overdue' ? 'text-red-400' : 'text-psk-text-secondary'}`}>
                          {new Date(vehicle.dueBack).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-psk-text-tertiary">-</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs text-psk-text-gold">{vehicle.investor}</p>
                    </td>
                    <td className="px-3 py-3">
                      <button className="px-2 py-1 text-xs rounded-glass bg-psk-bg-surface border border-psk-border hover:border-psk-border-gold text-psk-text-secondary hover:text-psk-text-gold transition">
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  )
}
