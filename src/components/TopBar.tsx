import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'

interface TopBarProps {
  currentBranch?: 'eldoret' | 'kisumu'
}

export default function TopBar({ currentBranch = 'eldoret' }: TopBarProps) {
  const location = useLocation()

  // Get page title and subtitle based on route
  const getPageInfo = () => {
    const route = location.pathname
    const pages: Record<string, { title: string; subtitle: string }> = {
      '/': { title: 'Home', subtitle: format(new Date(), 'EEEE, d MMMM yyyy') },
      '/registry': { title: 'Registry Board', subtitle: 'Live fleet status' },
      '/bookings': { title: 'Bookings', subtitle: 'Manage reservations' },
      '/clients': { title: 'Clients', subtitle: 'Customer management' },
      '/drivers': { title: 'Drivers', subtitle: 'Driver profiles' },
      '/maintenance': { title: 'Maintenance', subtitle: 'Service schedules' },
      '/fuel': { title: 'Fuel Log', subtitle: 'Consumption tracking' },
      '/finance': { title: 'Finance', subtitle: 'Financial overview' },
      '/analytics': { title: 'Analytics', subtitle: 'Fleet intelligence' },
    }
    return pages[route] || { title: 'Dashboard', subtitle: format(new Date(), 'EEEE, d MMMM yyyy') }
  }

  const pageInfo = getPageInfo()
  const branchLabel = currentBranch === 'eldoret' ? 'Eldoret HQ' : 'Kisumu Branch'

  return (
    <header
      className="flex items-center justify-between flex-shrink-0"
      style={{
        minHeight: '68px',
        padding: '0 28px',
        background: 'rgba(8,20,30,0.55)',
        borderBottom: '1.5px solid rgba(255,215,0,0.10)',
      }}
    >
      {/* Left side — Page title and subtitle */}
      <div>
        <h1
          className="font-bold"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.3px',
          }}
        >
          {pageInfo.title}
        </h1>
        <p
          className="mt-[3px]"
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.32)',
          }}
        >
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right side — Branch pill, date chip, bell, new booking button */}
      <div className="flex items-center gap-3">
        {/* Branch pill */}
        <div
          className="flex items-center gap-[7px]"
          style={{
            fontSize: '11.5px',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 500,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,215,0,0.18)',
            borderRadius: '8px',
            padding: '7px 14px',
          }}
        >
          <div
            className="w-[6px] h-[6px] rounded-full flex-shrink-0"
            style={{
              background: '#FFD700',
              boxShadow: '0 0 7px rgba(255,215,0,0.65)',
            }}
          />
          {branchLabel}
        </div>

        {/* Date chip */}
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '7px',
            padding: '7px 14px',
          }}
        >
          {format(new Date(), 'MMM d')}
        </div>

        {/* Bell button */}
        <button
          className="relative flex items-center justify-center flex-shrink-0 transition hover:opacity-80"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,215,0,0.14)',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '18px',
          }}
        >
          🔔
          {/* Red badge */}
          <div
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{
              background: '#C0392B',
              border: '2px solid #C0392B',
            }}
          />
        </button>

        {/* New booking button */}
        <button
          className="flex items-center justify-center font-semibold transition hover:opacity-90"
          style={{
            height: '38px',
            padding: '0 20px',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.16), rgba(255,149,0,0.09))',
            border: '1.5px solid rgba(255,215,0,0.32)',
            borderRadius: '10px',
            color: 'rgba(255,215,0,0.95)',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 2px 16px rgba(255,215,0,0.08)',
            whiteSpace: 'nowrap',
          }}
        >
          + New booking
        </button>
      </div>
    </header>
  )
}
