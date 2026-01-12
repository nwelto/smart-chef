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
  tips?: string;
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

export interface GenerateRecipeResponse {
  title: string;
  description: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}
