export type Goal = 'balanced' | 'weight-loss' | 'muscle-gain' | 'energy-boost';
export type DietaryPreference = 'vegetarian' | 'vegan' | 'high-protein' | 'low-sugar' | 'organic';

export interface GoalOption {
  id: Goal;
  label: string;
}

export interface DietaryPreferenceOption {
  id: DietaryPreference;
  label: string;
}

export interface Recommendation {
  item: string;
  category: string;
  reason: string;
}

export const goals: GoalOption[] = [
  { id: 'balanced', label: 'Balanced Nutrition' },
  { id: 'weight-loss', label: 'Weight Loss' },
  { id: 'muscle-gain', label: 'Muscle Gain' },
  { id: 'energy-boost', label: 'Energy Boost' },
];

export const dietaryPreferences: DietaryPreferenceOption[] = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'high-protein', label: 'High Protein' },
  { id: 'low-sugar', label: 'Low Sugar' },
  { id: 'organic', label: 'Organic Only' },
];

const recommendationsDatabase: Record<Goal, Recommendation[]> = {
  balanced: [
    {
      item: 'Mixed Seasonal Fruits',
      category: 'Cut Fruits',
      reason: 'Provides a variety of vitamins, minerals, and natural sugars for sustained energy throughout the day.',
    },
    {
      item: 'Chopped Vegetables Mix',
      category: 'Cut Vegetables',
      reason: 'Rich in fiber and essential nutrients, perfect for balanced meals and supporting digestive health.',
    },
    {
      item: 'Idli Batter',
      category: 'Batter',
      reason: 'Fermented batter offers probiotics and complex carbohydrates for a healthy gut and steady energy.',
    },
  ],
  'weight-loss': [
    {
      item: 'Cucumber & Tomato Salad Mix',
      category: 'Cut Vegetables',
      reason: 'Low in calories and high in water content, helps you feel full while supporting hydration and weight management.',
    },
    {
      item: 'Papaya & Watermelon',
      category: 'Cut Fruits',
      reason: 'Low-calorie fruits with high water content and digestive enzymes that support metabolism.',
    },
    {
      item: 'Spinach & Leafy Greens',
      category: 'Cut Vegetables',
      reason: 'Nutrient-dense and low in calories, packed with fiber to keep you satisfied longer.',
    },
  ],
  'muscle-gain': [
    {
      item: 'Protein-Rich Vegetable Mix',
      category: 'Cut Vegetables',
      reason: 'Includes broccoli, peas, and beans that provide plant-based protein and essential amino acids for muscle recovery.',
    },
    {
      item: 'Banana & Berries',
      category: 'Cut Fruits',
      reason: 'Natural carbohydrates and antioxidants to fuel workouts and support muscle recovery.',
    },
    {
      item: 'Ragi Batter',
      category: 'Batter',
      reason: 'High in protein and calcium, supports muscle building and bone health.',
    },
  ],
  'energy-boost': [
    {
      item: 'Mango & Orange Slices',
      category: 'Cut Fruits',
      reason: 'Natural sugars and vitamin C provide quick energy and support immune function.',
    },
    {
      item: 'Carrot & Beetroot Mix',
      category: 'Cut Vegetables',
      reason: 'Rich in natural sugars and iron, helps boost energy levels and improve blood circulation.',
    },
    {
      item: 'Sambar Podi',
      category: 'Podis & Spices',
      reason: 'Blend of lentils and spices provides sustained energy and enhances nutrient absorption.',
    },
  ],
};

export function getRecommendations(goal: Goal, preferences: DietaryPreference[]): Recommendation[] {
  let recommendations = [...recommendationsDatabase[goal]];

  // Apply dietary preference filters - all recommendations are already vegetarian
  if (preferences.includes('vegan')) {
    recommendations = recommendations.filter((rec) => rec.category !== 'Batter' || rec.item.includes('Ragi'));
  }

  if (preferences.includes('high-protein')) {
    recommendations = recommendations.map((rec) => {
      if (rec.category === 'Cut Vegetables' && !rec.item.includes('Protein')) {
        return {
          ...rec,
          item: 'Protein-Rich Vegetable Mix',
          reason: 'Enhanced with high-protein vegetables like broccoli, peas, and beans for your protein goals.',
        };
      }
      return rec;
    });
  }

  if (preferences.includes('low-sugar')) {
    recommendations = recommendations.filter((rec) => {
      const lowSugarFruits = ['Papaya', 'Watermelon', 'Berries'];
      return rec.category !== 'Cut Fruits' || lowSugarFruits.some((fruit) => rec.item.includes(fruit));
    });
  }

  if (preferences.includes('organic')) {
    recommendations = recommendations.map((rec) => ({
      ...rec,
      item: `Organic ${rec.item}`,
      reason: `${rec.reason} Sourced from certified organic farms.`,
    }));
  }

  return recommendations;
}
