import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const MEAL_PLAN_PROMPT = `You are an experienced meal prep chef and nutritionist. Create a detailed meal plan with FULL RECIPES based on the following requirements.

PLAN TYPE: {planType}
SERVINGS: {people} people for {days} days
MEALS PER DAY: {mealsPerDay}
PROTEIN PREFERENCES: {proteins}
FOODS TO EXCLUDE: {exclusions}
DIETARY RESTRICTIONS: {dietary}

Create a practical, delicious meal plan that:
1. Uses efficient batch cooking techniques
2. Shares ingredients across meals to minimize waste
3. Provides variety while being realistic for home cooks
4. Includes accurate macro estimates
5. Has a complete, organized grocery list
6. Includes FULL RECIPES with ingredients and step-by-step instructions for each meal
7. Includes storage and reheating tips

RESPOND WITH VALID JSON:
{
  "title": "Your 5-Day High Protein Meal Prep",
  "description": "Brief description of the plan",
  "total_prep_time_hours": 3,
  "days": [
    {
      "day": "Day 1 - Monday",
      "meals": [
        {
          "name": "Meal name",
          "description": "Brief description",
          "prep_time_minutes": 10,
          "cook_time_minutes": 20,
          "servings": 2,
          "ingredients": [
            { "item": "chicken breast", "amount": "8 oz" },
            { "item": "broccoli", "amount": "1 cup" }
          ],
          "instructions": [
            "Season chicken with salt and pepper",
            "Heat pan over medium-high heat",
            "Cook chicken 6-7 minutes per side"
          ],
          "macros": { "calories": 450, "protein_g": 35, "carbs_g": 40, "fat_g": 15 }
        }
      ]
    }
  ],
  "grocery_list": [
    { "category": "Proteins", "items": ["2 lbs chicken breast", "1 dozen eggs"] },
    { "category": "Produce", "items": ["2 lbs broccoli", "1 bag spinach"] },
    { "category": "Pantry", "items": ["olive oil", "rice"] }
  ],
  "prep_instructions": [
    "Start by cooking all proteins - this takes longest",
    "While proteins cook, prep vegetables",
    "Cook grains and let cool before portioning"
  ],
  "storage_tips": [
    "Store in airtight containers for up to 5 days",
    "Freeze portions you won't eat within 3 days"
  ]
}`;

const PLAN_TYPE_LABELS: Record<string, string> = {
  "freezer-burritos": "Freezer-friendly meal prep burritos - make a big batch, freeze, reheat as needed",
  "dinner-plan": "Complete dinner recipes for the family",
  "lunch-prep": "Portioned lunch containers for grab-and-go",
  "breakfast-prep": "Quick breakfast options ready to eat",
  "snack-prep": "Healthy snack portions for the week",
  "full-week": "Complete breakfast, lunch, and dinner plan",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { planType, people, days, mealsPerDay, proteins, exclusions, dietary } = body;

  if (!planType) {
    return NextResponse.json({ error: "Plan type required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = MEAL_PLAN_PROMPT
      .replace("{planType}", PLAN_TYPE_LABELS[planType] || planType)
      .replace("{people}", String(people || 2))
      .replace("{days}", String(days || 5))
      .replace("{mealsPerDay}", String(mealsPerDay || 1))
      .replace("{proteins}", proteins?.length > 0 ? proteins.join(", ") : "Any")
      .replace("{exclusions}", exclusions?.length > 0 ? exclusions.join(", ") : "None")
      .replace("{dietary}", dietary?.length > 0 ? dietary.join(", ") : "None");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response");
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}
