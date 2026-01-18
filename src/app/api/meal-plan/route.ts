import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const MEAL_PLAN_PROMPT = `You are an experienced home cook focused on PRACTICAL, BUDGET-FRIENDLY, and DELICIOUS meals. Create a meal plan with FULL RECIPES.

PLAN TYPE: {planType}
SERVINGS: {servings}
DAYS: {days}
MEAL TYPES TO INCLUDE: {mealTypes}
PROTEIN PREFERENCES: {proteins}
FOODS TO EXCLUDE: {exclusions}
DIETARY RESTRICTIONS: {dietary}
COOKING STYLE MIX: {cookingStylesDesc}

{specialInstructions}

CORE GUIDELINES:
- Focus on BUDGET-FRIENDLY ingredients (chicken thighs over breast, dried beans, seasonal produce)
- Use common pantry staples people already have (oil, salt, pepper, garlic, onion)
- Avoid expensive or exotic ingredients
- Batch cook efficiently when possible
- Prioritize comfort food that tastes great

Create a practical meal plan that:
1. Uses efficient cooking techniques
2. Shares ingredients across meals to reduce cost
3. Is realistic for home cooks
4. Includes accurate macros_per_adult_serving (macros for ONE adult portion)
5. Sets adult_servings and child_servings based on the household (children get half portions)
6. Has a complete grocery list with quantities for the whole household
7. Includes FULL RECIPES with ingredients and clear step-by-step instructions
8. Includes storage and reheating tips

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
          "adult_servings": 2,
          "child_servings": 1,
          "ingredients": [
            { "item": "chicken breast", "amount": "8 oz" },
            { "item": "broccoli", "amount": "1 cup" }
          ],
          "instructions": [
            "Season chicken with salt and pepper",
            "Heat pan over medium-high heat",
            "Cook chicken 6-7 minutes per side"
          ],
          "macros_per_adult_serving": { "calories": 450, "protein_g": 35, "carbs_g": 40, "fat_g": 15 }
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
  "weekly-plan": "Weekly meal PLANNING - meals to cook fresh each day throughout the week. Focus on variety and fresh-cooked meals. DO NOT include prep_instructions or total_prep_time_hours since they'll cook fresh daily.",
  "weekly-prep": "Weekly meal PREP - BATCH COOKING where you make ONE recipe per meal type that will last the entire week. NOT different recipes each day - the SAME meal repeated.",
};

// Separate prompt for meal prep - focuses on batch cooking ONE recipe per meal type
const MEAL_PREP_PROMPT = `You are an experienced home cook focused on MEAL PREP - batch cooking ONE dish per meal type to eat throughout the week.

SERVINGS: {servings}
DAYS: {days}
MEAL TYPES TO PREP: {mealTypes}
PROTEIN PREFERENCES: {proteins}
FOODS TO EXCLUDE: {exclusions}
DIETARY RESTRICTIONS: {dietary}
COOKING STYLE: {cookingStylesDesc}

{specialInstructions}

⚠️ CRITICAL: This is MEAL PREP, not meal planning!
- Generate exactly ONE recipe per meal type selected
- If user selected "Lunch" for 5 days → ONE lunch recipe that makes {totalServings} portions
- If user selected "Breakfast, Lunch, Dinner" → THREE recipes total (1 each), each making {totalServings} portions
- DO NOT create different meals for different days
- The user will eat the SAME dish for that meal type all week
- Focus on meals that store and reheat well (NOT salads that wilt, NOT fried foods that get soggy)

MEAL PREP GUIDELINES:
- Choose dishes that taste BETTER after sitting (stews, curries, casseroles, grain bowls)
- Prioritize proteins that reheat well (chicken thighs > breast, ground meat, beans)
- Include proper storage containers guidance
- Calculate quantities to feed everyone for ALL {days} days

RESPOND WITH VALID JSON:
{
  "title": "Your {days}-Day Meal Prep",
  "description": "Brief description emphasizing it's batch cooking",
  "total_prep_time_hours": 2,
  "meals": [
    {
      "meal_type": "lunch",
      "name": "Chicken Burrito Bowls",
      "description": "Tex-Mex rice bowls that reheat perfectly",
      "prep_time_minutes": 20,
      "cook_time_minutes": 30,
      "total_portions": {totalServings},
      "portions_per_day": {portionsPerDay},
      "days_covered": {days},
      "ingredients": [
        { "item": "chicken thighs", "amount": "3 lbs" },
        { "item": "rice", "amount": "4 cups uncooked" }
      ],
      "instructions": [
        "Season chicken with cumin, chili powder, salt, pepper",
        "Cook chicken in batches until internal temp 165°F",
        "Cook rice according to package directions"
      ],
      "macros_per_portion": { "calories": 450, "protein_g": 35, "carbs_g": 40, "fat_g": 15 },
      "storage_instructions": "Store in airtight containers, refrigerate up to 5 days",
      "reheating_instructions": "Microwave 2-3 minutes or heat in skillet"
    }
  ],
  "grocery_list": [
    { "category": "Proteins", "items": ["3 lbs chicken thighs"] },
    { "category": "Grains", "items": ["4 cups rice"] }
  ],
  "prep_instructions": [
    "Start by cooking all proteins - this takes longest",
    "While proteins cook, prep vegetables and cook grains",
    "Let everything cool before portioning into containers"
  ],
  "storage_tips": [
    "Label containers with contents and date",
    "Store up to 5 days refrigerated or freeze extras"
  ]
}`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { planType, adults, children, days, selectedMeals, proteins, exclusions, dietary, cookingStyles, reducedWaste } = body;

  if (!planType) {
    return NextResponse.json({ error: "Plan type required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  // Format servings string
  const adultCount = adults || 0;
  const childCount = children || 0;
  let servingsStr = "";
  if (adultCount > 0) servingsStr += `${adultCount} adult${adultCount > 1 ? 's' : ''} (full portions)`;
  if (adultCount > 0 && childCount > 0) servingsStr += " + ";
  if (childCount > 0) servingsStr += `${childCount} child${childCount > 1 ? 'ren' : ''} (half portions)`;
  if (!servingsStr) servingsStr = "2 adults";

  // Format meal types for the prompt
  const mealTypesStr = selectedMeals?.length > 0 
    ? selectedMeals.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")
    : "Dinner only";

  // Format cooking styles description
  const styleDescriptions: Record<string, string> = {
    simple: "SIMPLE/EASY recipes (beginner-friendly, max 6-8 ingredients, basic techniques)",
    crockpot: "CROCK POT/SLOW COOKER recipes (dump and go, hands-off cooking)",
    gourmet: "GOURMET recipes (restaurant-quality, impressive presentation, special occasion worthy)"
  };
  
  let cookingStylesDesc = "Standard home cooking";
  if (cookingStyles?.length > 0) {
    if (cookingStyles.length === 1) {
      cookingStylesDesc = `Focus on ${styleDescriptions[cookingStyles[0]]}`;
    } else {
      cookingStylesDesc = `MIX of cooking styles - include some of each:\n${cookingStyles.map((s: string) => `- ${styleDescriptions[s]}`).join('\n')}`;
    }
  }

  // Build special instructions based on preferences
  const specialInstructionsList: string[] = [];
  
  if (reducedWaste) {
    specialInstructionsList.push(
      "⚠️ REDUCED WASTE MODE: CRITICAL - Every ingredient purchased MUST be used completely across the week. If you include cilantro, use it in 2-3 recipes. If you buy a whole chicken, use all parts. Plan strategically so NOTHING goes to waste. This is the #1 priority."
    );
  }

  const specialInstructions = specialInstructionsList.length > 0
    ? "SPECIAL REQUIREMENTS:\n" + specialInstructionsList.join("\n\n")
    : "";

  // Calculate total servings for meal prep
  const daysCount = days || 5;
  const portionsPerDay = adultCount + (childCount * 0.5); // children = half portions
  const totalServings = Math.ceil(portionsPerDay * daysCount);

  try {
    const openai = new OpenAI({ apiKey });

    let prompt: string;

    if (planType === "weekly-prep") {
      // Use meal prep prompt - ONE recipe per meal type
      prompt = MEAL_PREP_PROMPT
        .replace("{servings}", servingsStr)
        .replace(/{days}/g, String(daysCount))
        .replace("{mealTypes}", mealTypesStr)
        .replace("{proteins}", proteins?.length > 0 ? proteins.join(", ") : "Any")
        .replace("{exclusions}", exclusions?.length > 0 ? exclusions.join(", ") : "None")
        .replace("{dietary}", dietary?.length > 0 ? dietary.join(", ") : "None")
        .replace("{cookingStylesDesc}", cookingStylesDesc)
        .replace("{specialInstructions}", specialInstructions)
        .replace(/{totalServings}/g, String(totalServings))
        .replace(/{portionsPerDay}/g, String(Math.ceil(portionsPerDay)));
    } else {
      // Use meal plan prompt - different meals each day
      prompt = MEAL_PLAN_PROMPT
        .replace("{planType}", PLAN_TYPE_LABELS[planType] || planType)
        .replace("{servings}", servingsStr)
        .replace("{days}", String(daysCount))
        .replace("{mealTypes}", mealTypesStr)
        .replace("{proteins}", proteins?.length > 0 ? proteins.join(", ") : "Any")
        .replace("{exclusions}", exclusions?.length > 0 ? exclusions.join(", ") : "None")
        .replace("{dietary}", dietary?.length > 0 ? dietary.join(", ") : "None")
        .replace("{cookingStylesDesc}", cookingStylesDesc)
        .replace("{specialInstructions}", specialInstructions);
    }

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

    const result = JSON.parse(content);

    // Add metadata for meal prep to help UI display correctly
    if (planType === "weekly-prep") {
      result.is_meal_prep = true;
      result.days_count = daysCount;
      result.portions_per_day = Math.ceil(portionsPerDay);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}
