import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aggregateGroceryList } from "@/lib/grocery";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("meal_plans")
    .select("plan, grocery_list")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Return cached grocery list or regenerate
  if (data.grocery_list) {
    return NextResponse.json(data.grocery_list);
  }

  const groceryList = aggregateGroceryList(data.plan);
  return NextResponse.json(groceryList);
}
