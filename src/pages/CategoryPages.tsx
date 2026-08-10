import CategoryOverview from '../components/CategoryOverview'

export function HomeOverview() {
  return (
    <CategoryOverview
      emoji="🏠"
      title="PSK Safaris Admin"
      description="Welcome to your operations dashboard. Select a category to get started."
      buttons={[
        { icon: '🔧', label: 'Operations', route: '/operations' },
        { icon: '👥', label: 'Clients & Drivers', route: '/clients' },
        { icon: '🚗', label: 'Fleet', route: '/maintenance' },
        { icon: '🚙', label: 'Vehicle Owners', route: '/owners' },
        { icon: '💰', label: 'Finance', route: '/finance' },
        { icon: '📊', label: 'Intelligence', route: '/analytics' }
      ]}
    />
  )
}

export function OperationsOverview() {
  return (
    <CategoryOverview
      emoji="🔧"
      iconImg="/branding/icons/operations.png"
      title="Operations"
      description="Manage bookings, vehicles, and daily operations"
      buttons={[
        { icon: '🚗', label: 'Registry Board', route: '/registry' },
        { icon: '📅', label: 'Bookings', route: '/bookings', badge: 8, badgeColor: 'red' },
        { icon: '📋', label: 'Rental Agreements', route: '/agreements' },
        { icon: '📷', label: 'Handover Checklists', route: '/handover' },
        { icon: '📄', label: 'Quotations', route: '/quotations', badge: 3, badgeColor: 'amber' },
        { icon: '🔔', label: 'Reminders', route: '/reminders', badge: 9, badgeColor: 'red' }
      ]}
    />
  )
}

export function ClientsOverview() {
  return (
    <CategoryOverview
      emoji="👥"
      iconImg="/branding/icons/clients.png"
      title="Clients & Drivers"
      description="Manage client relationships and driver assignments"
      buttons={[
        { icon: '🏢', label: 'Clients', route: '/clients' },
        { icon: '🧑‍✈️', label: 'Drivers & Staff', route: '/drivers' },
        { icon: '⭐', label: 'Ratings & Feedback', route: '/ratings' }
      ]}
    />
  )
}

export function FleetOverview() {
  return (
    <CategoryOverview
      emoji="🚗"
      iconImg="/branding/icons/fleet.png"
      title="Fleet"
      description="Monitor vehicle maintenance and compliance"
      buttons={[
        { icon: '🔧', label: 'Maintenance', route: '/maintenance' },
        { icon: '⛽', label: 'Fuel Log', route: '/fuel' },
        { icon: '📅', label: 'Compliance Calendar', route: '/compliance' }
      ]}
    />
  )
}

export function OwnersOverview() {
  return (
    <CategoryOverview
      emoji="🚙"
      iconImg="/branding/icons/partners.png"
      title="Vehicle Owners"
      description="Manage owner relationships and payouts"
      buttons={[
        { icon: '👤', label: 'Owner Profiles', route: '/owners' },
        { icon: '💵', label: 'Payouts', route: '/owner-payouts' },
        { icon: '🔗', label: 'Owner Portal', route: '/owner-portal' }
      ]}
    />
  )
}

export function FinanceOverview() {
  return (
    <CategoryOverview
      emoji="💰"
      iconImg="/branding/icons/finance.png"
      title="Finance"
      description="Financial management and reporting"
      buttons={[
        { icon: '📊', label: 'Dashboard', route: '/finance' },
        { icon: '📄', label: 'Documents', route: '/finance/documents' },
        { icon: '📱', label: 'M-Pesa Reconciliation', route: '/finance/mpesa' },
        { icon: '💸', label: 'Expenses', route: '/finance/expenses' },
        { icon: '📈', label: 'P&L by Vehicle', route: '/finance/pl' },
        { icon: '⏰', label: 'Receivables', route: '/finance/receivables' },
        { icon: '📋', label: 'Reports', route: '/finance/reports' }
      ]}
    />
  )
}

export function IntelligenceOverview() {
  return (
    <CategoryOverview
      emoji="📊"
      iconImg="/branding/icons/intelligence.png"
      title="Intelligence"
      description="Analytics, audits, and system settings"
      buttons={[
        { icon: '📊', label: 'Analytics', route: '/analytics' },
        { icon: '📋', label: 'Audit Log', route: '/audit' },
        { icon: '⚙️', label: 'Settings', route: '/settings' }
      ]}
    />
  )
}
