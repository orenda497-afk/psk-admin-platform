export interface Branch {
  id: 'eldoret' | 'kisumu'
  name: string
  displayName: string
  address: string
  poBox: string
  city: string
  tel1: string
  tel2: string
  email: string
  pin: string
  manager?: string
}

export const BRANCHES: Record<string, Branch> = {
  eldoret: {
    id: 'eldoret',
    name: 'PSK Safaris & Car Rentals',
    displayName: 'Eldoret HQ',
    address: '64 Plaza, Eldoret',
    poBox: 'P.O. Box 5079 – 30100',
    city: 'Eldoret',
    tel1: '+254 751 855 180',
    tel2: '+254 741 186 538',
    email: 'info@psksafaris.com',
    pin: 'P051664556P',
  },
  kisumu: {
    id: 'kisumu',
    name: 'PSK Safaris & Car Rentals — Kisumu',
    displayName: 'Kisumu Branch',
    address: '174 Pamba Road, Tom Mboya, Kisumu',
    poBox: 'P.O. Box 5079 – 30100',
    city: 'Kisumu',
    tel1: '+254 741 186 538',
    tel2: '+254 740 355 180',
    email: 'info@psksafaris.co.ke',
    pin: 'P051664556P',
    manager: 'Faith',
  },
}

export const getBranchById = (branchId: string): Branch => {
  return BRANCHES[branchId] || BRANCHES.eldoret
}

export const getBranchDisplayName = (branchId: string): string => {
  return getBranchById(branchId).displayName
}

export const getFormattedBranchAddress = (branchId: string): string => {
  const branch = getBranchById(branchId)
  return `${branch.address}, ${branch.poBox}`
}
