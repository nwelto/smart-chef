import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ShoppingListItem } from "@/lib/types";

// POST - Add items to the default shopping list (or create one)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { items, source_id, source_type } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Items required" }, { status: 400 });
  }

  // Get or create the default shopping list
  let { data: list } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!list) {
    // Create a new default list
    const { data: newList, error: createError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        name: "My Shopping List",
        items: [],
      })
      .select()
      .single();

    if (createError) {
      console.error("Create shopping list error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    list = newList;
  }

  // Parse existing items
  const existingItems: ShoppingListItem[] = list.items || [];

  // Add new items with deduplication
  const newItems: ShoppingListItem[] = items.map((item: { item: string; amount: string; category?: string }) => ({
    id: crypto.randomUUID(),
    item: item.item,
    amount: item.amount,
    category: item.category || "Other",
    checked: false,
    source_id,
    source_type,
  }));

  // Simple deduplication by item name (case-insensitive)
  const existingNames = new Set(existingItems.map(i => i.item.toLowerCase()));
  const itemsToAdd = newItems.filter(i => !existingNames.has(i.item.toLowerCase()));
  
  const updatedItems = [...existingItems, ...itemsToAdd];

  // Update the list
  const { data: updatedList, error: updateError } = await supabase
    .from("shopping_lists")
    .update({
      items: updatedItems,
      updated_at: new Date().toISOString(),
    })
    .eq("id", list.id)
    .select()
    .single();

  if (updateError) {
    console.error("Update shopping list error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ 
    list: updatedList, 
    added: itemsToAdd.length,
    skipped: newItems.length - itemsToAdd.length,
  });
}
