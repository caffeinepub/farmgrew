export interface NutritionItem {
  id: string;
  name: string;
  category: string;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface BasketItem {
  itemId: string;
  quantity: number; // in grams
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const nutritionItems: NutritionItem[] = [
  // Fruits
  {
    id: 'apple',
    name: 'Apple',
    category: 'Fruits',
    per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'Fruits',
    per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  },
  {
    id: 'mango',
    name: 'Mango',
    category: 'Fruits',
    per100g: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  },
  {
    id: 'papaya',
    name: 'Papaya',
    category: 'Fruits',
    per100g: { calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    category: 'Fruits',
    per100g: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  },
  // Vegetables
  {
    id: 'carrot',
    name: 'Carrot',
    category: 'Vegetables',
    per100g: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'Vegetables',
    per100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  },
  {
    id: 'spinach',
    name: 'Spinach',
    category: 'Vegetables',
    per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'Vegetables',
    per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    category: 'Vegetables',
    per100g: { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  },
  {
    id: 'beetroot',
    name: 'Beetroot',
    category: 'Vegetables',
    per100g: { calories: 43, protein: 1.6, carbs: 10, fat: 0.2 },
  },
  // Vegetarian Protein sources
  {
    id: 'paneer',
    name: 'Paneer',
    category: 'Protein',
    per100g: { calories: 265, protein: 18, carbs: 1.2, fat: 20 },
  },
  {
    id: 'tofu',
    name: 'Tofu',
    category: 'Protein',
    per100g: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  },
  {
    id: 'chickpeas',
    name: 'Chickpeas',
    category: 'Legumes',
    per100g: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  },
  {
    id: 'lentils',
    name: 'Lentils',
    category: 'Legumes',
    per100g: { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    category: 'Grains',
    per100g: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  },
];

export function calculateTotals(basket: BasketItem[]): NutritionTotals {
  const totals: NutritionTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  basket.forEach((item) => {
    const nutritionItem = nutritionItems.find((ni) => ni.id === item.itemId);
    if (nutritionItem) {
      const multiplier = item.quantity / 100;
      totals.calories += nutritionItem.per100g.calories * multiplier;
      totals.protein += nutritionItem.per100g.protein * multiplier;
      totals.carbs += nutritionItem.per100g.carbs * multiplier;
      totals.fat += nutritionItem.per100g.fat * multiplier;
    }
  });

  return totals;
}
