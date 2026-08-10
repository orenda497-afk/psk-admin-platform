import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

interface TopBarProps {
  currentBranch?: 'eldoret' | 'kisumu'
}

export default function TopBar({ currentBranch = 'eldoret' }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const getPageInfo = () => {
    const route = location.pathname
    const pages: Record<string, { title: string; subtitle: string }> = {
      '/':                      { title: 'Home',                subtitle: format(new Date(), 'EEEE, d MMMM yyyy') },
      '/registry':              { title: 'Registry Board',      subtitle: 'Live fleet status' },
      '/operations/registry':   { title: 'Registry Board',      subtitle: 'Live fleet status' },
      '/bookings':              { title: 'Bookings',            subtitle: 'All branches' },
      '/operations/bookings':   { title: 'Bookings',            subtitle: 'All branches' },
      '/clients':               { title: 'Clients',             subtitle: 'Client management' },
      '/clients/individual':    { title: 'Clients',             subtitle: 'Individual clients' },
      '/clients/corporate':     { title: 'Clients',             subtitle: 'Corporate clients' },
      '/clients/agency':        { title: 'Clients',             subtitle: 'Agencies' },
      '/clients/government':    { title: 'Clients',             subtitle: 'Government' },
      '/drivers':               { title: 'Drivers & Staff',     subtitle: 'Driver management' },
      '/partners/drivers':      { title: 'Drivers & Staff',     subtitle: 'Driver management' },
      '/partners':              { title: 'Partners',            subtitle: 'Drivers & vehicle owners' },
      '/partners/owners':       { title: 'Vehicle Owners',      subtitle: 'Partner management' },
      '/partners/payouts':      { title: 'Owner Payouts',       subtitle: 'Payout tracking' },
      '/fleet/vehicles':        { title: 'PSK Fleet',           subtitle: 'Vehicle management' },
      '/fleet/maintenance':     { title: 'Maintenance',         subtitle: 'Service scheduler' },
      '/fleet/fuel':            { title: 'Fuel Log',            subtitle: 'Consumption tracker' },
      '/fleet/compliance':      { title: 'Compliance Calendar', subtitle: 'NTSA & document tracking' },
      '/finance':               { title: 'Finance',             subtitle: 'Financial command centre' },
      '/finance/documents':     { title: 'Documents',           subtitle: 'Invoices & quotations' },
      '/finance/mpesa':         { title: 'M-Pesa Recon',        subtitle: 'Payment matching' },
      '/finance/expenses':      { title: 'Expenses',            subtitle: 'Expense management' },
      '/finance/pl':            { title: 'P&L by Vehicle',      subtitle: '70/30 profit split' },
      '/finance/payouts':       { title: 'Owner Payouts',       subtitle: 'Payout management' },
      '/finance/receivables':   { title: 'Receivables',         subtitle: 'Outstanding balances' },
      '/finance/reports':       { title: 'Reports',             subtitle: 'Financial exports' },
      '/analytics':             { title: 'Analytics',           subtitle: 'Business intelligence' },
      '/audit':                 { title: 'Audit Log',           subtitle: 'System activity' },
      '/settings':              { title: 'Settings',            subtitle: 'System configuration' },
      '/reminders':             { title: 'Reminders',           subtitle: 'Action items' },
      '/quotations':            { title: 'Quotations',          subtitle: 'Client quotes' },
    }
    return pages[route] || { title: 'PSK Safaris', subtitle: format(new Date(), 'EEEE, d MMMM yyyy') }
  }

  const pageInfo = getPageInfo()
  const branchLabel = currentBranch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'

  // New Booking button: go to bookings page and trigger the modal via URL state
  const handleNewBooking = () => {
    navigate('/bookings', { state: { openAdd: true } })
  }

  return (
    <header style={{
      minHeight: '68px', padding: '0 28px',
      background: 'rgba(8,20,30,0.55)',
      borderBottom: '1.5px solid rgba(255,215,0,0.10)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      {/* Left */}
      <div>
        <div style={{ fontSize:'17px', fontWeight:700, color:'rgba(255,255,255,0.95)', letterSpacing:'-0.3px' }}>
          {pageInfo.title}
        </div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.32)', marginTop:'3px' }}>
          {pageInfo.subtitle}
        </div>
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        {/* Branch pill */}
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11.5px', color:'rgba(255,255,255,0.55)', fontWeight:500, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,215,0,0.18)', borderRadius:'8px', padding:'7px 14px' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#FFD700', boxShadow:'0 0 7px rgba(255,215,0,0.65)', flexShrink:0 }} />
          {branchLabel}
        </div>

        {/* Date chip */}
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'7px', padding:'7px 14px' }}>
          {format(new Date(), 'd MMM')}
        </div>

        {/* Bell */}
        <div style={{ position:'relative', width:'38px', height:'38px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,215,0,0.14)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <span style={{ fontSize:'16px' }}>🔔</span>
        </div>

        {/* + New booking — navigates to bookings and opens modal */}
        <button
          onClick={handleNewBooking}
          style={{
            height:'38px', padding:'0 20px',
            background:'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,149,0,0.10))',
            border:'1.5px solid rgba(255,215,0,0.38)',
            borderRadius:'10px',
            color:'rgba(255,215,0,0.98)',
            fontSize:'12px', fontWeight:700,
            cursor:'pointer', fontFamily:'inherit',
            whiteSpace:'nowrap',
          }}
        >
          + New booking
        </button>
      </div>
    </header>
  )
}
