import OpenAI from "openai";
import type { GenerateRecipeResponse } from "./types";

const RECIPE_PROMPT = `You are an experienced professional chef with 20+ years in fine dining and home cooking. Your job is to create practical, delicious recipes that a home cook can execute perfectly.

MAIN INGREDIENTS (the user has these - incorporate as many as make culinary sense):
{ingredients}

AVAILABLE SEASONINGS (pick only what complements the dish - do NOT use all of them):
{spices}

DIETARY RESTRICTIONS:
{dietary}

RECIPE STYLE:
{style}

INGREDIENTS TO AVOID (user dislikes these):
{disliked}

PREFERRED CUISINES:
{cuisines}

AVAILABLE EQUIPMENT:
{equipment}

BUDGET MODE:
{budget}

CHEF'S GUIDELINES:
1. Think like a professional chef - flavor profiles must make sense together
2. Do NOT combine ingredients that clash (e.g., BBQ sauce doesn't go with Asian fish sauce, sugar doesn't go in savory dishes unless for balance)
3. Use the BEST 2-4 seasonings that complement each other, not random combinations
4. If an ingredient doesn't fit the dish, leave it out - quality over quantity
5. Respect any dietary restrictions completely - no exceptions
6. Include exact measurements a home cook can follow
7. Write instructions that are clear and achievable

RESPOND ONLY WITH VALID JSON:
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "servings": 4,
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "difficulty": "easy",
  "ingredients": [
    {"item": "ingredient name", "amount": "1 cup", "note": "optional prep note"}
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "macros_per_serving": {
    "calories": 350,
    "protein_g": 25,
    "carbs_g": 30,
    "fat_g": 15
  },
  "grocery_list": ["item 1", "item 2"]
}`;

interface ProfileOptions {
  dislikedIngredients?: string[];
  cuisinePreferences?: string[];
  kitchenEquipment?: string[];
  budgetMode?: boolean;
}

export async function generateRecipe(
  ingredients: string[],
  spices: string[],
  dietary: string[] = [],
  style: string = "Any style - chef's choice",
  profileOptions: ProfileOptions = {}
): Promise<GenerateRecipeResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const { dislikedIngredients = [], cuisinePreferences = [], kitchenEquipment = [], budgetMode = false } = profileOptions;

  const prompt = RECIPE_PROMPT
    .replace("{ingredients}", ingredients.join(", "))
    .replace("{spices}", spices.length > 0 ? spices.join(", ") : "Basic seasonings only")
    .replace("{dietary}", dietary.length > 0 ? dietary.join(", ") : "None")
    .replace("{style}", style)
    .replace("{disliked}", dislikedIngredients.length > 0 ? dislikedIngredients.join(", ") : "None")
    .replace("{cuisines}", cuisinePreferences.length > 0 ? cuisinePreferences.join(", ") : "Any cuisine")
    .replace("{equipment}", kitchenEquipment.length > 0 ? kitchenEquipment.join(", ") : "Standard kitchen equipment")
    .replace("{budget}", budgetMode ? "Yes - prefer affordable, common ingredients" : "No - use best ingredients for the dish");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as GenerateRecipeResponse;
}
