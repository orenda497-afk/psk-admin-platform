// Mock data filtering utilities for branch-based access

export interface Vehicle {
  id: string
  registration: string
  model: string
  branch: 'eldoret' | 'kisumu'
  status: 'available' | 'out_chauffeur' | 'out_safari' | 'service' | 'attention'
}

export interface Booking {
  id: string
  reference: string
  customer: string
  vehicle: string
  vehicleReg: string
  startDate: string
  endDate: string
  type: 'self-drive' | 'chauffeur' | 'safari' | 'transfer'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  amount: number
  notes: string
  branch: 'eldoret' | 'kisumu'
  driver?: string
  destination?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  type: 'individual' | 'corporate'
  branch: 'eldoret' | 'kisumu'
  totalBookings: number
  totalSpent: number
  outstandingBalance: number
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  licenseExpiry: string
  status: 'available' | 'on_duty' | 'on_leave'
  rating: number
  trips: number
  experience: number
  branch: 'eldoret' | 'kisumu'
  location: string
}

// Filter functions for branch-based data access
export const filterByBranch = <T extends { branch: 'eldoret' | 'kisumu' }>(
  data: T[],
  branch: 'eldoret' | 'kisumu'
): T[] => {
  return data.filter(item => item.branch === branch)
}

export const getVehiclesByBranch = (
  vehicles: Vehicle[],
  branch: 'eldoret' | 'kisumu'
): Vehicle[] => {
  return filterByBranch(vehicles, branch)
}

export const getBookingsByBranch = (
  bookings: Booking[],
  branch: 'eldoret' | 'kisumu'
): Booking[] => {
  return filterByBranch(bookings, branch)
}

export const getClientsByBranch = (
  clients: Client[],
  branch: 'eldoret' | 'kisumu'
): Client[] => {
  return filterByBranch(clients, branch)
}

export const getDriversByBranch = (
  drivers: Driver[],
  branch: 'eldoret' | 'kisumu'
): Driver[] => {
  return filterByBranch(drivers, branch)
}
