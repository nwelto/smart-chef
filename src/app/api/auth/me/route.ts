import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const response = NextResponse.json({ 
    email: user?.email || null,
    isLoggedIn: !!user 
  });
  
  // Prevent caching
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  
  return response;
}
