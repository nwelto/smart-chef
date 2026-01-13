export interface Ingredient {
  item: string;
  amount: string;
  note?: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  ingredients_input: string[];
  spices_used: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  is_favorite: boolean;
  is_family_favorite: boolean;
  created_at: string;
}

export interface Spice {
  id: number;
  name: string;
  category: string;
  is_common: boolean;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  spices: string[];
}

export interface Macros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface GenerateRecipeResponse {
  title: string;
  description: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: Ingredient[];
  instructions: string[];
  macros_per_serving?: Macros;
  grocery_list?: string[];
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface DietProfile {
  id: string;
  user_id: string;
  dietary_restrictions: string[];
  cuisine_preferences: string[];
  protein_preferences: string[];
  disliked_ingredients: string[];
  calorie_target: number | null;
  kitchen_equipment: string[];
  budget_mode: boolean;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  item: string;
  amount: string;
  category: string;
  checked: boolean;
  source_id?: string;
  source_type?: "recipe" | "meal_plan";
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface ScheduledMeal {
  id: string;
  user_id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  recipe_id?: string;
  meal_plan_id?: string;
  custom_meal?: string;
  created_at: string;
  // Joined data
  recipe?: Recipe;
}

export interface MealPlanMeal {
  name: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  macros: Macros;
}

export interface MealPlanDay {
  day: string;
  meals: MealPlanMeal[];
}

export interface MealPlanData {
  days: MealPlanDay[];
  grocery_list: { category: string; items: string[] }[];
  prep_instructions: string[];
  storage_tips: string[];
}

export interface MealPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  plan_type: string;
  people: number;
  days: number;
  meals_per_day: number;
  total_prep_time_hours: number;
  plan_data: MealPlanData;
  created_at: string;
}
