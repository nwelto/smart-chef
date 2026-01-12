"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { RecipeCard } from "@/components/RecipeCard";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase.auth]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this recipe?");
    if (!confirmed) return;

    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRecipes(recipes.filter((r) => r.id !== id));
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar userEmail={userEmail} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <Link href="/generate" className="btn-primary">
            New Recipe
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-muted mb-4">No saved recipes yet</p>
            <Link href="/generate" className="btn-primary">
              Generate Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
