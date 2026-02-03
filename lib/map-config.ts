// Map configuration and constants

export interface District {
  district: string
  lat: number
  lng: number
  count: number
  avgMortgage: number
  avgIncome: number
}

export interface Neighborhood {
  fsa: string
  name: string
  city: string
  lat: number
  lng: number
  count: number
  avgMortgage: number
  avgIncome: number
}

export interface MapDataResponse {
  districts: District[]
  neighborhoods: Neighborhood[]
  totalDeals: number
}

export const MAP_CONFIG = {
  // Default center (Canada)
  defaultCenter: [56.1304, -106.3468] as [number, number],
  defaultZoom: 4,

  // Zoom thresholds for drill-down
  districtZoomMax: 9,
  neighborhoodZoomMin: 10,

  // Tile layer (OpenStreetMap)
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
}

export const PROVINCES = [
  { value: 1, label: 'Alberta' },
  { value: 2, label: 'British Columbia' },
  { value: 3, label: 'Manitoba' },
  { value: 4, label: 'New Brunswick' },
  { value: 5, label: 'Newfoundland and Labrador' },
  { value: 6, label: 'Northwest Territories' },
  { value: 7, label: 'Nova Scotia' },
  { value: 8, label: 'Nunavut' },
  { value: 9, label: 'Ontario' },
  { value: 10, label: 'Prince Edward Island' },
  { value: 11, label: 'Quebec' },
  { value: 12, label: 'Saskatchewan' },
  { value: 13, label: 'Yukon' },
]

export const DEAL_STATUSES = [
  { value: 0, label: 'Lead' },
  { value: 1, label: 'New' },
  { value: 2, label: 'Submitted' },
  { value: 3, label: 'Approved' },
  { value: 4, label: 'Accepted' },
  { value: 5, label: 'Waiting To Close' },
  { value: 6, label: 'Funded' },
  { value: 7, label: 'Complete' },
  { value: 8, label: 'Parked' },
  { value: 9, label: 'Cancelled' },
  { value: 10, label: 'Declined' },
]

// Marker colors based on deal count
export function getMarkerColor(count: number): string {
  if (count >= 50) return '#22c55e' // green-500
  if (count >= 20) return '#3b82f6' // blue-500
  if (count >= 10) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

// Format currency for display
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value)
}
