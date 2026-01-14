import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, meal_type, recipe_id, meal_plan_id, custom_meal } = body;

  const updateData: Record<string, unknown> = {};
  if (date !== undefined) updateData.date = date;
  if (meal_type !== undefined) updateData.meal_type = meal_type;
  if (recipe_id !== undefined) updateData.recipe_id = recipe_id;
  if (meal_plan_id !== undefined) updateData.meal_plan_id = meal_plan_id;
  if (custom_meal !== undefined) updateData.custom_meal = custom_meal;

  const { data, error } = await supabase
    .from("scheduled_meals")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      recipe:recipes(id, title, description, prep_time_minutes, cook_time_minutes, servings, difficulty)
    `)
    .single();

  if (error) {
    console.error("PATCH scheduled_meals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("scheduled_meals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
