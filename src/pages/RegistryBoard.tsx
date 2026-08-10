import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type VehicleStatus = 'available' | 'chauffeured' | 'safari' | 'self-drive' | 'service' | 'overdue' | 'grounded'

interface Vehicle {
  id: string
  reg: string
  make: string
  model: string
  year: number
  colour: string
  seats: number
  status: VehicleStatus
  branch: 'eldoret' | 'kisumu'
  holder?: string
  holderPhone?: string
  dueBack?: string
  location?: string
  owner?: string
  odometer?: number
  nextService?: number
  insuranceExpiry?: string
  inspectionExpiry?: string
}

const STATUS_CONFIG: Record<VehicleStatus, { label: string; color: string; bg: string; border: string }> = {
  available:   { label: 'Available',      color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.28)' },
  chauffeured: { label: 'Out · Chauffeur', color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.25)' },
  safari:      { label: 'Out · Safari',    color: 'rgba(206,147,216,0.95)', bg: 'rgba(206,147,216,0.08)', border: 'rgba(206,147,216,0.25)' },
  'self-drive':{ label: 'Out · Self-drive',color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.25)' },
  service:     { label: 'In Service',     color: 'rgba(255,183,77,0.95)',  bg: 'rgba(255,183,77,0.08)',  border: 'rgba(255,183,77,0.25)'  },
  overdue:     { label: 'Overdue',         color: 'rgba(239,154,154,0.98)', bg: 'rgba(239,154,154,0.09)', border: 'rgba(239,154,154,0.32)' },
  grounded:    { label: 'Grounded',        color: 'rgba(150,150,150,0.85)', bg: 'rgba(150,150,150,0.07)', border: 'rgba(150,150,150,0.20)' },
}

const gl = {
  panel: {
    background: 'rgba(10,22,34,0.70)',
    border: '1.5px solid rgba(255,255,255,0.09)',
    borderRadius: '14px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
  } as React.CSSProperties,
  label: { fontSize: '9px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.32)' },
}

export default function RegistryBoard() {
  const navigate = useNavigate()
  const [vehicles] = useState<Vehicle[]>([])
  const [filter, setFilter] = useState<'all' | VehicleStatus>('all')
  const [search, setSearch] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  // Stats — all zero until vehicles are added
  const total     = vehicles.length
  const available = vehicles.filter(v => v.status === 'available').length
  const outOnHire = vehicles.filter(v => ['chauffeured','safari','self-drive'].includes(v.status)).length
  const inService = vehicles.filter(v => v.status === 'service').length
  const attention = vehicles.filter(v => v.status === 'overdue' || v.status === 'grounded').length

  const eldoretCount = vehicles.filter(v => v.branch === 'eldoret').length
  const kisumuCount  = vehicles.filter(v => v.branch === 'kisumu').length

  const filtered = vehicles.filter(v => {
    const matchFilter = filter === 'all' || v.status === filter
    const matchSearch = !search || v.reg.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      (v.holder || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const needsAction = [
    { label: 'Overdue returns',           count: attention, color: 'rgba(239,154,154,0.95)', bg: 'rgba(231,76,60,0.10)', border: 'rgba(231,76,60,0.22)' },
    { label: 'Vehicles in service',       count: inService, color: 'rgba(255,183,77,0.95)',  bg: 'rgba(255,149,0,0.08)',  border: 'rgba(255,149,0,0.20)'  },
    { label: 'Documents expiring (30d)',  count: 0,         color: 'rgba(255,183,77,0.95)',  bg: 'rgba(255,149,0,0.08)',  border: 'rgba(255,149,0,0.20)'  },
    { label: 'Deposits outstanding',      count: 0,         color: 'rgba(255,183,77,0.95)',  bg: 'rgba(255,149,0,0.08)',  border: 'rgba(255,149,0,0.20)'  },
    { label: 'Vehicles idle 7+ days',     count: 0,         color: 'rgba(150,150,150,0.85)', bg: 'rgba(150,150,150,0.07)',border: 'rgba(150,150,150,0.18)' },
  ]

  return (
    <div style={{ padding: '24px 28px 28px' }}>

      {/* Back arrow */}
      <div onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: 'rgba(255,215,0,0.70)', fontSize: '12px', fontWeight: 500,
        cursor: 'pointer', marginBottom: '18px',
      }}>
        ← Home
      </div>

      {/* STATUS STRIP */}
      <div style={{ ...gl.panel, display: 'flex', marginBottom: '18px', overflow: 'hidden' }}>
        {[
          { label: 'Total Fleet',     value: total,     sub: `Eldoret ${eldoretCount} · Kisumu ${kisumuCount}`, color: 'rgba(255,255,255,0.88)' },
          { label: 'Available',       value: available, sub: 'Ready for booking',                              color: 'rgba(129,199,132,0.95)' },
          { label: 'Out on Hire',     value: outOnHire, sub: 'Chauffeur · Safari · Self-drive',               color: 'rgba(100,181,246,0.95)' },
          { label: 'In Service',      value: inService, sub: 'At workshop',                                   color: 'rgba(255,183,77,0.95)'  },
          { label: 'Attention Needed',value: attention, sub: 'Overdue or grounded',                           color: 'rgba(239,154,154,0.95)' },
        ].map((s, i, arr) => (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '18px 12px', textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={gl.label}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, lineHeight: 1, margin: '8px 0 5px', letterSpacing: '-1px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '18px' }}>

        {/* NEEDS ACTION */}
        <div style={{ ...gl.panel, padding: '18px' }}>
          <div style={{ ...gl.label, marginBottom: '14px' }}>Needs Action</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {needsAction.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: '9px', cursor: 'pointer',
                background: item.bg, border: `1px solid ${item.border}`,
                transition: 'opacity 0.15s',
              }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.count}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RETURNING TODAY + QUICK STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ ...gl.panel, padding: '18px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={gl.label}>Returning Today</div>
              <div style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(128,222,234,0.12)', border: '1px solid rgba(128,222,234,0.25)',
                color: 'rgba(128,222,234,0.95)',
              }}>0</div>
            </div>
            {/* Empty state */}
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
              No vehicles returning today
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { label: 'Bookings today', value: '0' },
              { label: 'Pickups today',  value: '0' },
              { label: 'Fleet util.',    value: '0%' },
            ].map((s, i) => (
              <div key={i} style={{ ...gl.panel, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,215,0,0.88)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FLEET TABLE */}
      <div style={{ ...gl.panel, padding: '18px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={gl.label}>Fleet Inventory</div>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['all', 'available', 'chauffeured', 'safari', 'service', 'overdue'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '4px 11px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: filter === f ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${filter === f ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.10)'}`,
                  color: filter === f ? 'rgba(255,215,0,0.90)' : 'rgba(255,255,255,0.40)',
                }}>
                  {f === 'all' ? `All (${total})` : STATUS_CONFIG[f as VehicleStatus]?.label || f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reg, model, client..."
              style={{
                padding: '7px 13px', borderRadius: '9px', fontSize: '12px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.80)', outline: 'none', fontFamily: 'inherit', width: '200px',
              }}
            />
            {/* Add vehicle */}
            <button onClick={() => setShowAddVehicle(true)} style={{
              padding: '7px 16px', borderRadius: '9px', fontSize: '12px', fontWeight: 600,
              background: 'linear-gradient(135deg, rgba(255,215,0,0.16), rgba(255,149,0,0.09))',
              border: '1.5px solid rgba(255,215,0,0.32)', color: 'rgba(255,215,0,0.95)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              + Add vehicle
            </button>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>🚗</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.50)', marginBottom: '8px' }}>
              {vehicles.length === 0 ? 'No vehicles registered yet' : 'No vehicles match your search'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginBottom: '20px' }}>
              {vehicles.length === 0 ? 'Add your first vehicle to get started' : 'Try a different search or filter'}
            </div>
            {vehicles.length === 0 && (
              <button onClick={() => setShowAddVehicle(true)} style={{
                padding: '10px 22px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                background: 'linear-gradient(135deg, rgba(255,215,0,0.16), rgba(255,149,0,0.09))',
                border: '1.5px solid rgba(255,215,0,0.32)', color: 'rgba(255,215,0,0.95)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                + Add first vehicle
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Registration','Vehicle','Status','Holder / Location','Due Back','Owner','Action'].map(h => (
                  <th key={h} style={{ ...gl.label, padding: '0 12px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const sc = STATUS_CONFIG[v.status]
                return (
                  <tr key={v.id} onClick={() => setSelectedVehicle(v)} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{v.reg}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', marginTop: '2px' }}>{v.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>{v.make} {v.model}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', marginTop: '2px' }}>{v.year} · {v.seats} seats</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
                        color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                      }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {v.holder ? (
                        <>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.80)' }}>{v.holder}</div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', marginTop: '2px' }}>{v.holderPhone}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)' }}>{v.location || (v.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu')}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {v.dueBack ? (
                        <div style={{ fontSize: '12px', fontWeight: 500, color: v.status === 'overdue' ? 'rgba(239,154,154,0.95)' : 'rgba(255,255,255,0.55)' }}>
                          {new Date(v.dueBack).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>—</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,215,0,0.65)' }}>{v.owner || '—'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={e => { e.stopPropagation(); setSelectedVehicle(v) }} style={{
                        padding: '5px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 500,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: 'inherit',
                      }}>View</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VEHICLE PASSPORT SLIDE-OVER */}
      {selectedVehicle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setSelectedVehicle(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
          <div style={{
            position: 'relative', width: '420px', height: '100vh',
            background: 'rgba(6,16,28,0.97)', backdropFilter: 'blur(32px)',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '-12px 0 60px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 1,
          }}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => setSelectedVehicle(null)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.55)',
                  cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
                }}>✕ Close</button>
              </div>

              {/* Status + reg */}
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                color: STATUS_CONFIG[selectedVehicle.status].color,
                background: STATUS_CONFIG[selectedVehicle.status].bg,
                border: `1px solid ${STATUS_CONFIG[selectedVehicle.status].border}`,
              }}>{STATUS_CONFIG[selectedVehicle.status].label}</span>

              <div style={{ fontSize: '26px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: '12px 0 4px', letterSpacing: '-0.5px' }}>
                {selectedVehicle.reg}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.40)', marginBottom: '24px' }}>
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} · {selectedVehicle.branch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu'}
              </div>

              {/* Info grid */}
              <div style={{ ...gl.panel, padding: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Odometer',       value: selectedVehicle.odometer ? `${selectedVehicle.odometer.toLocaleString()} km` : '—' },
                  { label: 'Next service',   value: selectedVehicle.nextService ? `${selectedVehicle.nextService.toLocaleString()} km` : '—' },
                  { label: 'Insurance exp.', value: selectedVehicle.insuranceExpiry || '—' },
                  { label: 'Vehicle owner',  value: selectedVehicle.owner || '—', gold: true },
                  { label: 'Current holder', value: selectedVehicle.holder || 'Not out' },
                  { label: 'Due back',       value: selectedVehicle.dueBack ? new Date(selectedVehicle.dueBack).toLocaleString('en-GB') : '—' },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: row.gold ? 'rgba(255,215,0,0.80)' : 'rgba(255,255,255,0.78)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Finance notice */}
              <div style={{
                background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.18)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
                fontSize: '11px', color: 'rgba(255,215,0,0.65)',
              }}>
                🔒 Financial data for this vehicle lives in Finance → P&L by vehicle
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: '+ New booking', primary: true },
                  { label: 'Log service',   primary: false },
                  { label: 'Add note',      primary: false },
                  { label: 'Add document',  primary: false },
                ].map((btn, i) => (
                  <button key={i} style={{
                    padding: '8px 14px', borderRadius: '9px', fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    background: btn.primary ? 'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,149,0,0.09))' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${btn.primary ? 'rgba(255,215,0,0.32)' : 'rgba(255,255,255,0.12)'}`,
                    color: btn.primary ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.60)',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showAddVehicle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)' }}>
          <div style={{
            background: 'rgba(8,18,30,0.97)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '18px', width: '560px', maxHeight: '88vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.60)',
          }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>Register New Vehicle</div>
              <button onClick={() => setShowAddVehicle(false)} style={{
                width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)',
                cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
              }}>✕</button>
            </div>

            <div style={{ padding: '22px 26px' }}>
              {/* Form fields */}
              {[
                { section: 'Vehicle Identity' },
                { label: 'Registration / Plate number', placeholder: 'e.g. KCA 123B', required: true, type: 'text' },
                { label: 'Make', placeholder: 'e.g. Toyota', required: true, type: 'text' },
                { label: 'Model', placeholder: 'e.g. Land Cruiser', required: true, type: 'text' },
                { label: 'Year', placeholder: 'e.g. 2022', required: true, type: 'number' },
                { label: 'Colour', placeholder: 'e.g. White', required: true, type: 'text' },
                { label: 'Seating capacity', placeholder: 'e.g. 7', required: true, type: 'number' },
                { section: 'Classification' },
                { label: 'Vehicle class (for ratecard)', select: ['Saloon Car','Rav 4','Noah','Prado','Land Cruiser','Van 11-seater','Van 14-seater','Coaster 22-seater'] },
                { label: 'Branch', select: ['Eldoret HQ','Kisumu Branch'] },
                { section: 'Ownership' },
                { label: 'Vehicle Owner', placeholder: 'Select or type owner name', type: 'text' },
                { label: 'Date joined PSK fleet', type: 'date' },
                { section: 'Documents' },
                { label: 'Insurance expiry date', type: 'date' },
                { label: 'NTSA inspection expiry', type: 'date' },
                { label: 'Road licence expiry', type: 'date' },
                { section: 'Current Condition' },
                { label: 'Odometer at registration (km)', placeholder: 'e.g. 45000', type: 'number' },
                { label: 'Condition notes', placeholder: 'Any existing damage or notes...', type: 'textarea' },
              ].map((field, i) => {
                if ('section' in field) {
                  return (
                    <div key={i} style={{ ...gl.label, marginTop: i === 0 ? 0 : '20px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {field.section}
                    </div>
                  )
                }
                return (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      {field.label}{field.required && <span style={{ color: 'rgba(239,154,154,0.80)', marginLeft: '3px' }}>*</span>}
                    </div>
                    {field.select ? (
                      <select style={{
                        width: '100%', padding: '10px 12px', borderRadius: '9px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.80)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                      }}>
                        <option value="">Select...</option>
                        {field.select.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea placeholder={field.placeholder} style={{
                        width: '100%', padding: '10px 12px', borderRadius: '9px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.80)', outline: 'none', fontFamily: 'inherit', height: '72px', resize: 'none',
                      }} />
                    ) : (
                      <input type={field.type || 'text'} placeholder={field.placeholder} style={{
                        width: '100%', padding: '10px 12px', borderRadius: '9px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.80)', outline: 'none', fontFamily: 'inherit',
                      }} />
                    )}
                  </div>
                )
              })}

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button onClick={() => setShowAddVehicle(false)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontFamily: 'inherit',
                }}>Cancel</button>
                <button style={{
                  flex: 2, padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                  background: 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))',
                  border: '1.5px solid rgba(255,215,0,0.35)', color: 'rgba(255,215,0,0.95)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Register Vehicle</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
