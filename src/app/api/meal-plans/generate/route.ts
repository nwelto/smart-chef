import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMealPlan } from "@/lib/openai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { familySize, allergies, exclusions, preferredProteins, days, meals } =
    body;

  // Validation
  if (!familySize || familySize < 1 || familySize > 20) {
    return NextResponse.json(
      { error: "Family size must be between 1 and 20" },
      { status: 400 }
    );
  }
  if (!days || days < 1 || days > 7) {
    return NextResponse.json(
      { error: "Days must be between 1 and 7" },
      { status: 400 }
    );
  }
  if (!meals || meals.length === 0) {
    return NextResponse.json(
      { error: "At least one meal type required" },
      { status: 400 }
    );
  }

  try {
    const plan = await generateMealPlan(
      familySize,
      allergies || [],
      exclusions || [],
      preferredProteins || [],
      days,
      meals
    );
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
