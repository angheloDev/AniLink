import { CATEGORY_EMOJI } from '../theme/tokens';

// Order matters: specific products first, generic words (coconut, rice) later.
const RULES: [RegExp, string][] = [
  [/vinegar|oil|suka/, '🍶'],
  [/tomato|kamatis/, '🍅'],
  [/eggplant|talong/, '🍆'],
  [/okra|ampalaya|sayote|chayote|cucumber|pipino/, '🥒'],
  [/corn grits|grits/, '🌽'],
  [/corn|mais/, '🌽'],
  [/pepper|sili/, '🌶️'],
  [/squash|kalabasa|pumpkin/, '🎃'],
  [/bean|sitaw|monggo|mung/, '🌱'],
  [/pechay|kangkong|lettuce|mustasa|malunggay|moringa|spinach|cabbage|repolyo/, '🥬'],
  [/mango/, '🥭'],
  [/banana|saba|lakatan|latundan/, '🍌'],
  [/pineapple|pinya/, '🍍'],
  [/calamansi|lemon|lime/, '🍋'],
  [/papaya|durian|melon/, '🍈'],
  [/mangosteen|grape/, '🍇'],
  [/rambutan|strawberry/, '🍓'],
  [/santol|peach|apple|mansanas/, '🍎'],
  [/camote|ube|sweet potato/, '🍠'],
  [/cassava|gabi|taro|potato|patatas/, '🥔'],
  [/ginger|luya|turmeric/, '🌿'],
  [/seaweed|guso/, '🌿'],
  [/egg|itlog/, '🥚'],
  [/coconut|niyog/, '🥥'],
  [/rice|bigas|palay/, '🌾'],
  [/garland|sampaguita|flower/, '🌼'],
  [/yakan|cloth|weave|woven|tapestry/, '🧵'],
  [/banig|mat|basket|bamboo/, '🧺'],
  [/keychain|shell|pearl/, '🐚'],
];

export function emojiFor(title: string, category: string): string {
  const t = title.toLowerCase();
  for (const [re, e] of RULES) if (re.test(t)) return e;
  return CATEGORY_EMOJI[category] ?? '🌱';
}
