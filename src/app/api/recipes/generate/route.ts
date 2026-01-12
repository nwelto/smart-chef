import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRecipe } from "@/lib/openai";
import type { GenerateRecipeRequest } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateRecipeRequest = await request.json();
  const { ingredients, spices } = body;

  if (!ingredients || ingredients.length < 2) {
    return NextResponse.json(
      { error: "At least 2 ingredients required" },
      { status: 400 }
    );
  }

  try {
    const recipe = await generateRecipe(ingredients, spices || []);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
