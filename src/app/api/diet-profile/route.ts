import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET the user's diet profile
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("diet_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine for new users
    console.error("GET diet_profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return empty profile structure if none exists
  if (!data) {
    return NextResponse.json({
      user_id: user.id,
      dietary_restrictions: [],
      cuisine_preferences: [],
      protein_preferences: [],
      disliked_ingredients: [],
      calorie_target: null,
      kitchen_equipment: [],
      budget_mode: false,
    });
  }

  return NextResponse.json(data);
}

// POST/PUT - Create or update diet profile
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    dietary_restrictions,
    cuisine_preferences,
    protein_preferences,
    disliked_ingredients,
    calorie_target,
    kitchen_equipment,
    budget_mode,
  } = body;

  // Upsert the profile
  const { data, error } = await supabase
    .from("diet_profiles")
    .upsert({
      user_id: user.id,
      dietary_restrictions: dietary_restrictions || [],
      cuisine_preferences: cuisine_preferences || [],
      protein_preferences: protein_preferences || [],
      disliked_ingredients: disliked_ingredients || [],
      calorie_target: calorie_target || null,
      kitchen_equipment: kitchen_equipment || [],
      budget_mode: budget_mode || false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    })
    .select()
    .single();

  if (error) {
    console.error("POST diet_profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
