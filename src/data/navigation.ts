export interface NavSubcategory {
  id: string
  label: string
  icon: string
  route: string
  badge?: number
  badgeColor?: 'red' | 'amber'
  roleRestricted?: string // 'owner' means only show for Owner role
}

export interface NavCategory {
  id: string
  label: string
  icon: string
  subcategories: NavSubcategory[]
  pinProtected?: boolean // true for Finance
}

export const NAVIGATION_STRUCTURE: NavCategory[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    subcategories: []
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '🔧',
    subcategories: [
      { id: 'registry', label: 'Registry board', icon: '🚗', route: '/registry' },
      { id: 'bookings', label: 'Bookings', icon: '📅', route: '/bookings', badge: 8, badgeColor: 'red' },
      { id: 'agreements', label: 'Rental agreements', icon: '📋', route: '/agreements' },
      { id: 'handover', label: 'Handover checklists', icon: '📷', route: '/handover' },
      { id: 'quotations', label: 'Quotations', icon: '📄', route: '/quotations', badge: 3, badgeColor: 'amber' },
      { id: 'reminders', label: 'Reminders', icon: '🔔', route: '/reminders', badge: 9, badgeColor: 'red' }
    ]
  },
  {
    id: 'clients',
    label: 'Clients & Drivers',
    icon: '👥',
    subcategories: [
      { id: 'clients-list', label: 'Clients', icon: '🏢', route: '/clients' },
      { id: 'drivers', label: 'Drivers & Staff', icon: '🧑‍✈️', route: '/drivers' },
      { id: 'ratings', label: 'Ratings & Feedback', icon: '⭐', route: '/ratings' }
    ]
  },
  {
    id: 'fleet',
    label: 'Fleet',
    icon: '🚗',
    subcategories: [
      { id: 'maintenance', label: 'Maintenance', icon: '🔧', route: '/maintenance' },
      { id: 'fuel', label: 'Fuel log', icon: '⛽', route: '/fuel' },
      { id: 'compliance', label: 'Compliance calendar', icon: '📅', route: '/compliance' }
    ]
  },
  {
    id: 'owners',
    label: 'Vehicle Owners',
    icon: '🚙',
    subcategories: [
      { id: 'owner-profiles', label: 'Owner profiles', icon: '👤', route: '/owners' },
      { id: 'owner-payouts', label: 'Payouts', icon: '💵', route: '/owner-payouts' },
      { id: 'owner-portal', label: 'Owner portal', icon: '🔗', route: '/owner-portal' }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: '💰',
    pinProtected: true,
    subcategories: [
      { id: 'finance-dashboard', label: 'Dashboard', icon: '📊', route: '/finance' },
      { id: 'finance-documents', label: 'Documents', icon: '📄', route: '/finance/documents' },
      { id: 'finance-mpesa', label: 'M-Pesa recon', icon: '📱', route: '/finance/mpesa' },
      { id: 'finance-expenses', label: 'Expenses', icon: '💸', route: '/finance/expenses' },
      { id: 'finance-pl', label: 'P&L by vehicle', icon: '📈', route: '/finance/pl' },
      { id: 'finance-owner-payouts', label: 'Owner payouts', icon: '🏦', route: '/finance/payouts', roleRestricted: 'owner' },
      { id: 'finance-receivables', label: 'Receivables', icon: '⏰', route: '/finance/receivables' },
      { id: 'finance-reports', label: 'Reports', icon: '📋', route: '/finance/reports' }
    ]
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: '📊',
    subcategories: [
      { id: 'analytics', label: 'Analytics', icon: '📊', route: '/analytics' },
      { id: 'audit', label: 'Audit log', icon: '📋', route: '/audit' },
      { id: 'settings', label: 'Settings', icon: '⚙️', route: '/settings' }
    ]
  }
]
