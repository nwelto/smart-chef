import OpenAI from "openai";
import type { GenerateRecipeResponse } from "./types";

const RECIPE_PROMPT = `You are a professional chef assistant. Generate a recipe using ONLY the ingredients provided.

INGREDIENTS (use ONLY these - do NOT add anything else):
{ingredients}

AVAILABLE SEASONINGS (optional - use only if they complement the dish):
{spices}

STRICT RULES:
- Use ONLY the ingredients listed above - do NOT add eggs, milk, butter, or ANY other ingredients
- Do NOT invent or substitute ingredients - if the user gives you peanut butter, jelly, and bread, make a PB&J
- Calculate REALISTIC prep and cook times based on the actual recipe:
  - A sandwich or no-cook dish: prep_time 2-5 minutes, cook_time 0
  - A simple stir-fry: prep_time 10 minutes, cook_time 10 minutes
  - A slow-cooked dish: prep_time 15 minutes, cook_time 120+ minutes
- If no cooking/heating is required, set cook_time_minutes to 0
- Keep the recipe simple and true to the ingredients provided
- Include exact measurements for the ingredients you use

RESPOND ONLY WITH VALID JSON IN THIS EXACT FORMAT:
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "servings": <number based on ingredients>,
  "prep_time_minutes": <realistic time based on recipe complexity>,
  "cook_time_minutes": <0 if no cooking, otherwise realistic time>,
  "difficulty": "easy",
  "ingredients": [
    {"item": "ingredient name", "amount": "1 cup", "note": "optional note"}
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ]
}`;

export async function generateRecipe(
  ingredients: string[],
  spices: string[]
): Promise<GenerateRecipeResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const prompt = RECIPE_PROMPT
    .replace("{ingredients}", ingredients.join(", "))
    .replace("{spices}", spices.length > 0 ? spices.join(", ") : "None provided");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as GenerateRecipeResponse;
}
