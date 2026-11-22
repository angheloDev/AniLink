/** SAMPLE listings for the "Fresh from the farm" section. Illustrative, not real stock or farmers. */
export type ProduceCategory = 'fruits' | 'vegetables' | 'leafy' | 'rootcrops' | 'crafts';
export type ProduceUnit = 'kg' | 'piece' | 'tali' | 'dozen';

export interface ProduceItem {
  id: string;
  name: string;
  emoji: string;
  category: ProduceCategory;
  price: number;
  unit: ProduceUnit;
  /** A real barangay name from the app's list. */
  barangay: string;
  verified: boolean;
}

export const PRODUCE: ProduceItem[] = [
  { id: 'mango', name: 'Carabao Mangoes', emoji: '🥭', category: 'fruits', price: 130, unit: 'kg', barangay: 'Mercedes', verified: true },
  { id: 'banana', name: 'Lakatan Bananas', emoji: '🍌', category: 'fruits', price: 64, unit: 'kg', barangay: 'Manicahan', verified: true },
  { id: 'pineapple', name: 'Sweet Pineapple', emoji: '🍍', category: 'fruits', price: 45, unit: 'piece', barangay: 'Talisayan', verified: false },
  { id: 'tomato', name: 'Tomatoes', emoji: '🍅', category: 'vegetables', price: 82, unit: 'kg', barangay: 'Tumaga', verified: true },
  { id: 'eggplant', name: 'Eggplant', emoji: '🍆', category: 'vegetables', price: 55, unit: 'kg', barangay: 'Culianan', verified: false },
  { id: 'corn', name: 'Sweet Corn', emoji: '🌽', category: 'vegetables', price: 12, unit: 'piece', barangay: 'Ayala', verified: true },
  { id: 'pechay', name: 'Fresh Pechay', emoji: '🥬', category: 'leafy', price: 55, unit: 'tali', barangay: 'Pasonanca', verified: true },
  { id: 'kangkong', name: 'Kangkong', emoji: '🌿', category: 'leafy', price: 20, unit: 'tali', barangay: 'Tumaga', verified: false },
  { id: 'kamote', name: 'Sweet Potato (Kamote)', emoji: '🍠', category: 'rootcrops', price: 46, unit: 'kg', barangay: 'Vitali', verified: true },
  { id: 'cassava', name: 'Cassava', emoji: '🥔', category: 'rootcrops', price: 38, unit: 'kg', barangay: 'Manicahan', verified: false },
  { id: 'basket', name: 'Woven Basket', emoji: '🧺', category: 'crafts', price: 350, unit: 'piece', barangay: 'Mercedes', verified: true },
  { id: 'bowl', name: 'Coconut Shell Bowl', emoji: '🥥', category: 'crafts', price: 120, unit: 'piece', barangay: 'Ayala', verified: false },
];

export function filterProduce(items: ProduceItem[], category: 'all' | ProduceCategory): ProduceItem[] {
  return category === 'all' ? [...items] : items.filter((p) => p.category === category);
}
