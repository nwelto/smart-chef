import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_SPICES = [
  { id: 1, name: "Salt", category: "Basic", is_common: true },
  { id: 2, name: "Black Pepper", category: "Basic", is_common: true },
  { id: 3, name: "Garlic Powder", category: "Basic", is_common: true },
  { id: 4, name: "Onion Powder", category: "Basic", is_common: true },
  { id: 5, name: "Paprika", category: "Warm", is_common: true },
  { id: 6, name: "Cumin", category: "Warm", is_common: true },
  { id: 7, name: "Chili Powder", category: "Warm", is_common: true },
  { id: 8, name: "Cayenne", category: "Warm", is_common: true },
  { id: 9, name: "Oregano", category: "Herbs", is_common: true },
  { id: 10, name: "Basil", category: "Herbs", is_common: true },
  { id: 11, name: "Thyme", category: "Herbs", is_common: true },
  { id: 12, name: "Rosemary", category: "Herbs", is_common: true },
  { id: 13, name: "Cinnamon", category: "Sweet", is_common: true },
  { id: 14, name: "Nutmeg", category: "Sweet", is_common: true },
  { id: 15, name: "Ginger", category: "Asian", is_common: true },
  { id: 16, name: "Turmeric", category: "Asian", is_common: true },
  { id: 17, name: "Curry Powder", category: "Asian", is_common: true },
  { id: 18, name: "Italian Seasoning", category: "Blends", is_common: true },
  { id: 19, name: "Taco Seasoning", category: "Blends", is_common: true },
  { id: 20, name: "Everything Bagel", category: "Blends", is_common: true },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("spices")
      .select("*")
      .order("category", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_SPICES);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEFAULT_SPICES);
  }
}
