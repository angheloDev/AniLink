export type FarmerKey = 'ruben' | 'nena' | 'jamal' | 'lorna' | 'pedring' | 'rosa' | 'ismael' | 'marites';

export interface SeedFarmer {
  key: FarmerKey;
  email: string;
  name: string;
  barangay: string;
  verified: boolean;
  farm: { name: string; description: string; crops: string[] };
}

export const FARMERS: SeedFarmer[] = [
  { key: 'ruben', email: 'farmer@anilink.demo', name: 'Mang Ruben Salazar', barangay: 'Tumaga', verified: true, farm: { name: 'Salazar Family Farm', description: 'Third-generation vegetable growers in Tumaga. Harvested every morning.', crops: ['Tomato', 'Eggplant', 'Okra', 'Sweet Corn'] } },
  { key: 'nena', email: 'nena@anilink.demo', name: 'Aling Nena Cruz', barangay: 'Pasonanca', verified: true, farm: { name: "Nena's Highland Garden", description: 'Cool-climate leafy greens grown near Pasonanca Park.', crops: ['Pechay', 'Lettuce', 'Kangkong'] } },
  { key: 'jamal', email: 'jamal@anilink.demo', name: 'Kuya Jamal Hassan', barangay: 'Talisayan', verified: true, farm: { name: 'Hassan Orchard', description: 'Mangoes, bananas and tropical fruit from the east coast.', crops: ['Mango', 'Banana', 'Pineapple'] } },
  { key: 'lorna', email: 'lorna@anilink.demo', name: 'Ate Lorna Abdul', barangay: 'Vitali', verified: false, farm: { name: 'Abdul Weavers', description: 'Yakan weaving and handmade crafts passed down in our family.', crops: ['Yakan cloth', 'Banig'] } },
  { key: 'pedring', email: 'pedring@anilink.demo', name: 'Mang Pedring Lim', barangay: 'Culianan', verified: false, farm: { name: 'Lim Root Crops', description: 'Camote, cassava and gabi from the upland farms of Culianan.', crops: ['Camote', 'Cassava', 'Gabi'] } },
  { key: 'rosa', email: 'rosa@anilink.demo', name: 'Aling Rosa Villanueva', barangay: 'Mercedes', verified: false, farm: { name: 'Rosa Coastal Farm', description: 'Coconut products, native eggs and seaweed.', crops: ['Coconut', 'Eggs', 'Seaweed'] } },
  { key: 'ismael', email: 'ismael@anilink.demo', name: 'Kuya Ismael Sali', barangay: 'Manicahan', verified: true, farm: { name: 'Sali Fruit Farm', description: 'Seasonal premium fruit: durian, mangosteen and rambutan.', crops: ['Durian', 'Mangosteen', 'Rambutan'] } },
  { key: 'marites', email: 'marites@anilink.demo', name: 'Ate Marites Ramos', barangay: 'Ayala', verified: false, farm: { name: 'Ramos Rice Farm', description: 'Rice and grains milled fresh in Ayala.', crops: ['Rice', 'Corn', 'Monggo'] } },
];

export const BUYERS = [
  { email: 'buyer@anilink.demo', name: 'Carla Mendoza', barangay: 'Tetuan' },
  { email: 'benny@anilink.demo', name: 'Chef Benny Tan', barangay: 'Zone IV (Poblacion)' },
  { email: 'lita@anilink.demo', name: 'Lita Gomez (Sari-sari Store)', barangay: 'Guiwan' },
];

type Cat = 'vegetables' | 'fruits' | 'leafy' | 'rootcrops' | 'grains' | 'crafts' | 'others';
type Unit = 'kg' | 'piece' | 'tali' | 'sack' | 'dozen';
export interface SeedListing {
  f: FarmerKey;
  t: string;
  c: Cat;
  p: number;
  u: Unit;
  s: number;
  d: string;
  pre?: number; // days until harvest (pre-order)
  del?: boolean;
  min?: number;
  neg?: boolean;
}

export const LISTINGS: SeedListing[] = [
  { f: 'ruben', t: 'Baguio Tomatoes', c: 'vegetables', p: 82, u: 'kg', s: 140, d: 'Firm, deep red tomatoes. Great for sauces and salads.', del: true },
  { f: 'ruben', t: 'Native Eggplant (Talong)', c: 'vegetables', p: 68, u: 'kg', s: 90, d: 'Long purple eggplant, picked this morning.' },
  { f: 'ruben', t: 'Fresh Okra', c: 'vegetables', p: 58, u: 'kg', s: 60, d: 'Tender young okra pods.' },
  { f: 'ruben', t: 'Ampalaya', c: 'vegetables', p: 92, u: 'kg', s: 45, d: 'Crisp, medium-bitter ampalaya.' },
  { f: 'ruben', t: 'String Beans (Sitaw)', c: 'vegetables', p: 70, u: 'kg', s: 80, d: 'Pre-order: next harvest in a few days.', pre: 6 },
  { f: 'ruben', t: 'Sweet Corn', c: 'vegetables', p: 14, u: 'piece', s: 500, d: 'Sweet white corn, boil-ready.', del: true, min: 12 },
  { f: 'nena', t: 'Fresh Pechay', c: 'leafy', p: 42, u: 'tali', s: 300, d: 'Bundled pechay, washed and ready.' },
  { f: 'nena', t: 'Kangkong', c: 'leafy', p: 22, u: 'tali', s: 400, d: 'Water spinach from clean irrigation.' },
  { f: 'nena', t: 'Romaine Lettuce', c: 'leafy', p: 120, u: 'kg', s: 35, d: 'Pre-order romaine, harvest this week.', pre: 4 },
  { f: 'nena', t: 'Mustasa', c: 'leafy', p: 30, u: 'tali', s: 150, d: 'Peppery mustard greens.' },
  { f: 'nena', t: 'Kalabasa (Squash)', c: 'vegetables', p: 38, u: 'kg', s: 200, d: 'Sweet orange-flesh squash.' },
  { f: 'nena', t: 'Sayote (Chayote)', c: 'vegetables', p: 45, u: 'kg', s: 100, d: 'Tender sayote with shoots available.' },
  { f: 'nena', t: 'Bell Pepper Mix', c: 'vegetables', p: 160, u: 'kg', s: 30, d: 'Red, yellow and green peppers.' },
  { f: 'jamal', t: 'Carabao Mangoes', c: 'fruits', p: 135, u: 'kg', s: 800, d: 'Sweet ripe carabao mangoes, export quality.', del: true },
  { f: 'jamal', t: 'Lakatan Bananas', c: 'fruits', p: 68, u: 'kg', s: 1200, d: 'Golden lakatan, naturally ripened.', del: true },
  { f: 'jamal', t: 'Saba Bananas', c: 'fruits', p: 38, u: 'kg', s: 900, d: 'Cooking bananas for turon and banana cue.' },
  { f: 'jamal', t: 'Papaya', c: 'fruits', p: 42, u: 'kg', s: 220, d: 'Ripe papaya, sweet and soft.' },
  { f: 'jamal', t: 'Pineapple', c: 'fruits', p: 45, u: 'piece', s: 300, d: 'Juicy, low-acid pineapples.' },
  { f: 'jamal', t: 'Calamansi', c: 'fruits', p: 95, u: 'kg', s: 160, d: 'Pre-order calamansi, harvest in about 10 days.', pre: 10 },
  { f: 'jamal', t: 'Santol', c: 'fruits', p: 55, u: 'kg', s: 100, d: 'Sweet-sour santol in season.' },
  { f: 'lorna', t: 'Yakan Woven Cloth', c: 'crafts', p: 1800, u: 'piece', s: 12, d: 'Handwoven Yakan tapestry with traditional geometric patterns.', neg: true },
  { f: 'lorna', t: 'Handwoven Banig Mat', c: 'crafts', p: 450, u: 'piece', s: 30, d: 'Durable pandan banig, 3x6 ft.' },
  { f: 'lorna', t: 'Sampaguita Garlands', c: 'crafts', p: 60, u: 'dozen', s: 100, d: 'Fresh sampaguita garlands for offerings and gifts.' },
  { f: 'lorna', t: 'Pearl-Shell Keychains', c: 'crafts', p: 35, u: 'piece', s: 200, d: 'Souvenir keychains with shell and pearl accents.', min: 5 },
  { f: 'lorna', t: 'Bamboo Basket', c: 'crafts', p: 280, u: 'piece', s: 25, d: 'Sturdy handwoven bamboo basket.' },
  { f: 'pedring', t: 'Camote (Sweet Potato)', c: 'rootcrops', p: 46, u: 'kg', s: 300, d: 'Orange-flesh camote, naturally sweet.' },
  { f: 'pedring', t: 'Cassava', c: 'rootcrops', p: 28, u: 'kg', s: 500, d: 'Freshly dug cassava.' },
  { f: 'pedring', t: 'Gabi (Taro)', c: 'rootcrops', p: 60, u: 'kg', s: 120, d: 'Starchy gabi, perfect for ginataan.' },
  { f: 'pedring', t: 'Ube (Purple Yam)', c: 'rootcrops', p: 130, u: 'kg', s: 80, d: 'Pre-order deep purple ube.', pre: 14 },
  { f: 'pedring', t: 'Ginger (Luya)', c: 'rootcrops', p: 150, u: 'kg', s: 70, d: 'Fragrant ginger, clean and dry.' },
  { f: 'rosa', t: 'Native Eggs', c: 'others', p: 120, u: 'dozen', s: 60, d: 'Free-range native chicken eggs.' },
  { f: 'rosa', t: 'Fresh Coconut', c: 'others', p: 28, u: 'piece', s: 400, d: 'Mature coconuts for gata and cooking.', del: true },
  { f: 'rosa', t: 'Coconut Vinegar 1L', c: 'others', p: 65, u: 'piece', s: 80, d: 'Naturally fermented coconut vinegar.' },
  { f: 'rosa', t: 'Dried Seaweed (Guso)', c: 'others', p: 180, u: 'kg', s: 40, d: 'Sun-dried seaweed from Zamboanga waters.' },
  { f: 'rosa', t: 'Malunggay Leaves', c: 'leafy', p: 20, u: 'tali', s: 250, d: 'Moringa leaves, plucked fresh.' },
  { f: 'ismael', t: 'Durian', c: 'fruits', p: 220, u: 'kg', s: 150, d: 'Pre-order premium durian. Harvest in about 3 weeks.', pre: 20 },
  { f: 'ismael', t: 'Mangosteen', c: 'fruits', p: 180, u: 'kg', s: 60, d: 'Queen of fruits, sweet and tangy.' },
  { f: 'ismael', t: 'Rambutan', c: 'fruits', p: 90, u: 'kg', s: 120, d: 'Juicy rambutan, easy to peel.' },
  { f: 'ismael', t: 'Virgin Coconut Oil 500ml', c: 'others', p: 240, u: 'piece', s: 40, d: 'Cold-pressed VCO.', neg: true },
  { f: 'marites', t: 'Brown Rice 25kg Sack', c: 'grains', p: 1450, u: 'sack', s: 40, d: 'Unpolished brown rice, locally milled.' },
  { f: 'marites', t: 'Jasmine White Rice 25kg Sack', c: 'grains', p: 1350, u: 'sack', s: 60, d: 'Fragrant white rice, fresh stock.', del: true },
  { f: 'marites', t: 'Corn Grits', c: 'grains', p: 48, u: 'kg', s: 120, d: 'Traditional Mindanao corn grits.' },
  { f: 'marites', t: 'Mung Beans (Monggo)', c: 'grains', p: 110, u: 'kg', s: 80, d: 'Clean, sorted monggo.' },
];

export const GUIDES: { crop: string; category: Cat; unit: Unit; avg: number }[] = [
  { crop: 'Tomato', category: 'vegetables', unit: 'kg', avg: 88 },
  { crop: 'Eggplant', category: 'vegetables', unit: 'kg', avg: 70 },
  { crop: 'Okra', category: 'vegetables', unit: 'kg', avg: 60 },
  { crop: 'Ampalaya', category: 'vegetables', unit: 'kg', avg: 90 },
  { crop: 'Sweet Corn', category: 'vegetables', unit: 'piece', avg: 15 },
  { crop: 'Pechay', category: 'leafy', unit: 'tali', avg: 40 },
  { crop: 'Kangkong', category: 'leafy', unit: 'tali', avg: 20 },
  { crop: 'Mango', category: 'fruits', unit: 'kg', avg: 120 },
  { crop: 'Lakatan', category: 'fruits', unit: 'kg', avg: 70 },
  { crop: 'Pineapple', category: 'fruits', unit: 'piece', avg: 48 },
  { crop: 'Papaya', category: 'fruits', unit: 'kg', avg: 40 },
  { crop: 'Calamansi', category: 'fruits', unit: 'kg', avg: 90 },
  { crop: 'Camote', category: 'rootcrops', unit: 'kg', avg: 45 },
  { crop: 'Cassava', category: 'rootcrops', unit: 'kg', avg: 30 },
  { crop: 'Ginger', category: 'rootcrops', unit: 'kg', avg: 145 },
  { crop: 'Fresh Coconut', category: 'others', unit: 'piece', avg: 25 },
];
