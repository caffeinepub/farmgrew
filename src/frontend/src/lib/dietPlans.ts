export interface DietPlan {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  focusAreas: string[];
}

export const dietPlans: DietPlan[] = [
  {
    id: 'balanced',
    name: 'Balanced Nutrition',
    description: 'A well-rounded plan for overall health and wellness with a mix of all essential nutrients.',
    benefits: [
      'Supports overall health and vitality',
      'Provides sustained energy throughout the day',
      'Includes variety for complete nutrition',
    ],
    focusAreas: ['Whole Foods', 'Variety', 'Moderation'],
  },
  {
    id: 'high-protein',
    name: 'High Protein',
    description: 'Designed for muscle building and recovery with emphasis on protein-rich foods.',
    benefits: [
      'Supports muscle growth and repair',
      'Helps maintain lean body mass',
      'Keeps you feeling full longer',
    ],
    focusAreas: ['Muscle Building', 'Recovery', 'Satiety'],
  },
  {
    id: 'low-sugar',
    name: 'Low Sugar',
    description: 'Focuses on reducing sugar intake while maintaining energy and nutrition.',
    benefits: [
      'Helps manage blood sugar levels',
      'Supports weight management',
      'Reduces energy crashes',
    ],
    focusAreas: ['Blood Sugar', 'Weight Loss', 'Steady Energy'],
  },
];
