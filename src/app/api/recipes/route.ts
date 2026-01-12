import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/recipes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      ingredients: body.ingredients,
      instructions: body.instructions,
      ingredients_input: body.ingredients_input,
      spices_used: body.spices_used,
      prep_time_minutes: body.prep_time_minutes,
      cook_time_minutes: body.cook_time_minutes,
      servings: body.servings,
      difficulty: body.difficulty,
    })
    .select()
    .single();

  if (error) {
    console.error("POST /api/recipes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
