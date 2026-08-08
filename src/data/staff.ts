export interface StaffMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff' | 'owner'
  branch: 'eldoret' | 'kisumu'
  permissions: string[]
}

export const STAFF_MEMBERS: Record<string, StaffMember> = {
  admin: {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@psksafaris.com',
    role: 'admin',
    branch: 'eldoret',
    permissions: ['all'],
  },
  faith: {
    id: 'staff-002',
    name: 'Faith',
    email: 'faith@psksafaris.co.ke',
    role: 'manager',
    branch: 'kisumu',
    permissions: ['view_bookings', 'create_documents', 'view_clients', 'view_drivers'],
  },
}

export const getStaffByEmail = (email: string): StaffMember | undefined => {
  return Object.values(STAFF_MEMBERS).find(staff => staff.email === email)
}

export const getStaffBranch = (email: string): 'eldoret' | 'kisumu' => {
  const staff = getStaffByEmail(email)
  return staff?.branch || 'eldoret'
}

export const hasPermission = (email: string, permission: string): boolean => {
  const staff = getStaffByEmail(email)
  if (!staff) return false
  if (staff.permissions.includes('all')) return true
  return staff.permissions.includes(permission)
}
