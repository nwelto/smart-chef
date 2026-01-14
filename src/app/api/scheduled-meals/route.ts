import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET scheduled meals - optionally filtered by date range
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  let query = supabase
    .from("scheduled_meals")
    .select(`
      *,
      recipe:recipes(id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("GET scheduled_meals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Schedule a meal
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, meal_type, recipe_id, meal_plan_id, custom_meal } = body;

  if (!date || !meal_type) {
    return NextResponse.json({ error: "Date and meal_type required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("scheduled_meals")
    .insert({
      user_id: user.id,
      date,
      meal_type,
      recipe_id: recipe_id || null,
      meal_plan_id: meal_plan_id || null,
      custom_meal: custom_meal || null,
    })
    .select(`
      *,
      recipe:recipes(id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty)
    `)
    .single();

  if (error) {
    console.error("POST scheduled_meals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
