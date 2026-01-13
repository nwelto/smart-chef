import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all shopping lists for the user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("GET shopping_lists error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST create a new shopping list
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, items } = body;

  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id: user.id,
      name: name || "My Shopping List",
      items: items || [],
    })
    .select()
    .single();

  if (error) {
    console.error("POST shopping_lists error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
