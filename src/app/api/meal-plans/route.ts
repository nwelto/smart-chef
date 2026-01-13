import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all meal plans for the user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET meal_plans error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST save a new meal plan
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, plan_type, people, days, meals_per_day, total_prep_time_hours, plan_data } = body;

  const { data, error } = await supabase
    .from("meal_plans")
    .insert({
      user_id: user.id,
      title,
      description,
      plan_type,
      people,
      days,
      meals_per_day,
      total_prep_time_hours,
      plan_data,
    })
    .select()
    .single();

  if (error) {
    console.error("POST meal_plans error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
