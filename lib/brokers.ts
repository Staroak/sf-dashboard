// Canonical list of brokers to display on the dashboard.
// Only these brokers appear on screen — the CRM API may return more,
// but isRealBroker() filters to this list.
export const VALID_BROKERS = [
  'Alice Nabi', 'Alika Walia', 'Art Aguilos','Baldip Nijjar', 'Bowie Nan', 'Brandon Viaje-Roque',
  'Caitlyn Chretien', 'Charlene Smith', 'Doyle Minhas', 'Garry Singh', 'Gaurav Dadral', 'Gurjit Sandhu',
  'Gurpreet Kaur', 'Harick Brar', 'Harry Dhunna', 'Jennifer Souvanvong', 'Karny Mehat',
  'Lesly Camaclang', 'Madhur Kapoor', 'Mindy Basran', 'Mona Rakkar', 'Natalie Pacheco', 'Nav Cheema', 'Olaf Durkowski',
  'Rahul Narula', 'Ranier Manding', 'Renzo Mesia', 'Saihaj Cheema',
  'Salil Singla', 'Sav Cheema', 'Serg Martires', 'Shaneen Mohammed', 'Shiela Jamero', 'Stephanie Viaje',
  'Sunny Dhillon'
];

// Pre-compute lowercase set for case-insensitive matching
const VALID_BROKERS_LOWER = new Set(VALID_BROKERS.map(n => n.toLowerCase()));

/** No-op — kept for API compatibility but broker list is intentionally static */
export function updateBrokerList(_brokers: string[]) {
  // Intentionally not updating — VALID_BROKERS is the curated display list
}

export function isRealBroker(name: string): boolean {
  if (!name || name === 'Unknown') return false;
  return VALID_BROKERS_LOWER.has(name.toLowerCase());
}
