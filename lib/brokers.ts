// Canonical list of valid broker names (from Salesforce)
// Used by dashboard celebrations, leaderboards, and mobile views
// Keep this list up to date when brokers join or leave
export const VALID_BROKERS = [
  'Alice Nabi', 'Alika Walia', 'Baldip Nijjar', 'Bowie Nan', 'Brandon Viaje-Roque',
  'Caitlyn Chretien', 'Charlene Smith', 'Doyle Minhas', 'Garry Singh', 'Gaurav Dadral', 'Gurjit Sandhu',
  'Gurpreet Kaur', 'Harick Brar', 'Harry Dhunna', 'Jennifer Souvanvong', 'Karny Mehat',
  'Lesly Camaclang', 'Madhur Kapoor', 'Megan Robertson', 'Mindy Basran', 'Mona Rakkar', 'Natalie Pacheco', 'Nav Cheema', 'Olaf Durkowski',
  'Rahul Narula', 'Ranier Manding', 'Renzo Mesia', 'Saihaj Cheema',
  'Salil Singla', 'Savraj Cheema', 'Serg Martires', 'Shaad bakhtyar', 'Shaneen Mohammed', 'Shiela Jamero', 'Stephanie Viaje',
  'Sunny Dhillon'
];

// Pre-compute lowercase set for case-insensitive matching
const VALID_BROKERS_LOWER = new Set(VALID_BROKERS.map(n => n.toLowerCase()));

export function isRealBroker(name: string): boolean {
  if (!name || name === 'Unknown') return false;
  return VALID_BROKERS_LOWER.has(name.toLowerCase());
}
