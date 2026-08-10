export interface NavSubcategory {
  id: string
  label: string
  icon: string
  route: string
  badge?: number
  badgeColor?: 'red' | 'amber'
  roleRestricted?: string
}

export interface NavCategory {
  id: string
  label: string
  icon: string
  subcategories: NavSubcategory[]
  pinProtected?: boolean
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
      { id: 'registry',    label: 'Registry board',      icon: '🚗', route: '/registry' },
      { id: 'bookings',    label: 'Bookings',             icon: '📅', route: '/bookings',   badge: 0, badgeColor: 'red' },
      { id: 'agreements',  label: 'Rental agreements',    icon: '📋', route: '/agreements' },
      { id: 'handover',    label: 'Handover checklists',  icon: '📷', route: '/handover' },
      { id: 'quotations',  label: 'Quotations',           icon: '📄', route: '/quotations', badge: 0, badgeColor: 'amber' },
      { id: 'reminders',   label: 'Reminders',            icon: '🔔', route: '/reminders',  badge: 0, badgeColor: 'red' },
    ]
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: '🏢',
    subcategories: [
      { id: 'individual',  label: 'Individual clients',   icon: '👤', route: '/clients/individual' },
      { id: 'corporate',   label: 'Corporate clients',    icon: '🏢', route: '/clients/corporate' },
      { id: 'agency',      label: 'Agencies',             icon: '🤝', route: '/clients/agency' },
      { id: 'government',  label: 'Government',           icon: '🏛️', route: '/clients/government' },
    ]
  },
  {
    id: 'fleet',
    label: 'PSK Fleet',
    icon: '🚗',
    subcategories: [
      { id: 'vehicles',    label: 'Vehicles',             icon: '🚗', route: '/fleet/vehicles' },
      { id: 'maintenance', label: 'Maintenance',          icon: '🔧', route: '/fleet/maintenance' },
      { id: 'fuel',        label: 'Fuel log',             icon: '⛽', route: '/fleet/fuel' },
      { id: 'compliance',  label: 'Compliance calendar',  icon: '📅', route: '/fleet/compliance' },
    ]
  },
  {
    id: 'partners',
    label: 'Partners',
    icon: '🤝',
    subcategories: [
      { id: 'drivers',     label: 'Drivers & Staff',      icon: '🧑‍✈️', route: '/partners/drivers' },
      { id: 'owners',      label: 'Vehicle Owners',       icon: '🚙', route: '/partners/owners' },
      { id: 'payouts',     label: 'Owner Payouts',        icon: '💵', route: '/partners/payouts' },
      { id: 'portal',      label: 'Owner Portal',         icon: '🔗', route: '/partners/portal' },
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: '💰',
    pinProtected: true,
    subcategories: [
      { id: 'finance-dashboard', label: 'Dashboard',      icon: '📊', route: '/finance' },
      { id: 'finance-documents', label: 'Documents',      icon: '📄', route: '/finance/documents' },
      { id: 'finance-mpesa',     label: 'M-Pesa recon',   icon: '📱', route: '/finance/mpesa' },
      { id: 'finance-expenses',  label: 'Expenses',       icon: '💸', route: '/finance/expenses' },
      { id: 'finance-pl',        label: 'P&L by vehicle', icon: '📈', route: '/finance/pl' },
      { id: 'finance-payouts',   label: 'Owner payouts',  icon: '🏦', route: '/finance/payouts', roleRestricted: 'owner' },
      { id: 'finance-ar',        label: 'Receivables',    icon: '⏰', route: '/finance/receivables' },
      { id: 'finance-reports',   label: 'Reports',        icon: '📋', route: '/finance/reports' },
    ]
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: '📊',
    subcategories: [
      { id: 'analytics',   label: 'Analytics',            icon: '📊', route: '/analytics' },
      { id: 'audit',       label: 'Audit log',            icon: '📋', route: '/audit' },
      { id: 'settings',    label: 'Settings',             icon: '⚙️', route: '/settings' },
    ]
  },
]
