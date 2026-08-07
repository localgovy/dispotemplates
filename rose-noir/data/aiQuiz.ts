import { PRODUCTS, type Product, type Category, type StrainType } from './products';

// ─── Quiz question definitions ────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtext?: string;
  options: QuizOption[];
}

export interface QuizAnswers {
  effect: string;   // q1
  format: string;   // q2
  experience: string; // q3
  budget: string;   // q4
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'effect',
    question: 'What are you looking for?',
    subtext: 'Pick the experience that fits you best',
    options: [
      { id: 'relax',   label: 'Relax & Unwind',    emoji: '🌿' },
      { id: 'sleep',   label: 'Sleep Support',      emoji: '🌙' },
      { id: 'energy',  label: 'Energy & Focus',     emoji: '⚡' },
      { id: 'social',  label: 'Social & Euphoric',  emoji: '✨' },
      { id: 'pain',    label: 'Pain & Wellness',    emoji: '💚' },
      { id: 'curious', label: 'Just Exploring',     emoji: '🍃' },
    ],
  },
  {
    id: 'format',
    question: 'How do you prefer to consume?',
    options: [
      { id: 'smoke',  label: 'Flower / Pre-Roll',   emoji: '🌱' },
      { id: 'vape',   label: 'Vape',                emoji: '💨' },
      { id: 'edible', label: 'Edible / Beverage',   emoji: '🍬' },
      { id: 'oral',   label: 'Tincture / Capsule',  emoji: '💧' },
      { id: 'any',    label: 'No preference',       emoji: '🎯' },
    ],
  },
  {
    id: 'experience',
    question: 'What is your experience level?',
    subtext: 'Helps us match the right potency',
    options: [
      { id: 'new',      label: 'New to cannabis',  emoji: '👋' },
      { id: 'casual',   label: 'Occasional user',  emoji: '😊' },
      { id: 'regular',  label: 'Regular user',     emoji: '👍' },
      { id: 'advanced', label: 'High tolerance',   emoji: '💪' },
    ],
  },
  {
    id: 'budget',
    question: 'Budget per product?',
    options: [
      { id: 'low',    label: 'Under $20',   emoji: '💰' },
      { id: 'mid',    label: '$20 – $40',   emoji: '💵' },
      { id: 'high',   label: '$40 – $60',   emoji: '💳' },
      { id: 'any',    label: 'No limit',    emoji: '🛍' },
    ],
  },
];

// ─── Scoring engine ───────────────────────────────────────────────────────────

// Maps each effect answer to preferred strains and tag keywords
const EFFECT_PROFILE: Record<string, { strains: StrainType[]; tags: string[] }> = {
  relax:   { strains: ['Indica', 'Hybrid'],           tags: ['relaxing', 'calming', 'earthy', 'sweet', 'body'] },
  sleep:   { strains: ['Indica'],                     tags: ['sleep', 'sedating', 'heavy', 'potent', 'classic'] },
  energy:  { strains: ['Sativa', 'Hybrid'],           tags: ['uplifting', 'daytime', 'creative', 'citrus', 'tropical'] },
  social:  { strains: ['Sativa', 'Hybrid'],           tags: ['euphoric', 'social', 'fruity', 'hybrid', 'creative'] },
  pain:    { strains: ['CBD', 'Indica', 'Hybrid'],    tags: ['body', 'cbd', 'wellness', 'low-thc', 'calming'] },
  curious: { strains: ['Hybrid', 'CBD', 'Sativa'],    tags: ['balanced', 'mild', 'cbd', 'wellness', 'hybrid'] },
};

// Maps format answer to allowed categories
const FORMAT_CATEGORIES: Record<string, Category[]> = {
  smoke:  ['Flower', 'Pre-Rolls'],
  vape:   ['Vape'],
  edible: ['Edibles', 'Beverage'],
  oral:   ['Oral', 'Hemp Products'],
  any:    ['Flower', 'Pre-Rolls', 'Vape', 'Edibles', 'Beverage', 'Oral', 'Hemp Products'],
};

// THC ceiling by experience level (null = no ceiling)
const EXPERIENCE_THC: Record<string, number | null> = {
  new:      18,
  casual:   24,
  regular:  30,
  advanced: null,
};

// Price ceiling by budget
const BUDGET_PRICE: Record<string, number | null> = {
  low:  20,
  mid:  40,
  high: 60,
  any:  null,
};

export function scoreProducts(answers: QuizAnswers): Product[] {
  const profile     = EFFECT_PROFILE[answers.effect] ?? EFFECT_PROFILE.relax;
  const categories  = FORMAT_CATEGORIES[answers.format] ?? FORMAT_CATEGORIES.any;
  const thcCeiling  = EXPERIENCE_THC[answers.experience] ?? null;
  const priceCeiling = BUDGET_PRICE[answers.budget] ?? null;

  const scored = PRODUCTS
    // Hard filters
    .filter((p) => categories.includes(p.category))
    .filter((p) => priceCeiling === null || p.price <= priceCeiling)
    // Score each product
    .map((p) => {
      let score = 0;

      // Strain match
      if (profile.strains.includes(p.strain)) score += 3;

      // Tag matches (2 pts each)
      score += p.tags.filter((t) => profile.tags.includes(t)).length * 2;

      // THC appropriateness
      if (p.thc !== null) {
        if (thcCeiling !== null && p.thc > thcCeiling) score -= 3;
        else if (answers.experience === 'advanced' && p.thc >= 26) score += 2;
        else if (answers.experience === 'new' && p.thc < 15) score += 2;
      }

      // Slight bonus for featured / best seller
      if (p.isFeatured) score += 1;
      if (p.isBestSeller) score += 1;

      // Slight bonus for sale items
      if (p.originalPrice !== undefined) score += 1;

      return { product: p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);

  // Return top 4 (or fewer if not enough match)
  return scored.slice(0, 4);
}
