"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { DietProfile } from "@/lib/types";

const DIETARY_OPTIONS = [
  "Gluten-Free", "Dairy-Free", "Egg-Free", "Nut-Free", 
  "Vegetarian", "Vegan", "Keto", "Low-Carb", "Low-Sodium", "Halal", "Kosher"
];

const CUISINE_OPTIONS = [
  "American", "Italian", "Mexican", "Chinese", "Japanese", "Thai", "Indian",
  "Mediterranean", "French", "Korean", "Vietnamese", "Greek", "Middle Eastern"
];

const PROTEIN_OPTIONS = [
  "Chicken", "Beef", "Pork", "Turkey", "Fish", "Shrimp", "Lamb",
  "Tofu", "Tempeh", "Beans/Legumes", "Eggs"
];

const EQUIPMENT_OPTIONS = [
  "Instant Pot", "Air Fryer", "Slow Cooker", "Stand Mixer", 
  "Food Processor", "Grill", "Smoker", "Sous Vide", "Dutch Oven"
];

export default function DietSettingsPage() {
  const [userEmail, setUserEmail] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Profile state
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [proteinPreferences, setProteinPreferences] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState("");
  const [calorieTarget, setCalorieTarget] = useState<number | "">("");
  const [kitchenEquipment, setKitchenEquipment] = useState<string[]>([]);
  const [budgetMode, setBudgetMode] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email);

      const res = await fetch("/api/diet-profile");
      if (res.ok) {
        const profile: DietProfile = await res.json();
        setDietaryRestrictions(profile.dietary_restrictions || []);
        setCuisinePreferences(profile.cuisine_preferences || []);
        setProteinPreferences(profile.protein_preferences || []);
        setDislikedIngredients((profile.disliked_ingredients || []).join(", "));
        setCalorieTarget(profile.calorie_target || "");
        setKitchenEquipment(profile.kitchen_equipment || []);
        setBudgetMode(profile.budget_mode || false);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase.auth, router]);

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/diet-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dietary_restrictions: dietaryRestrictions,
        cuisine_preferences: cuisinePreferences,
        protein_preferences: proteinPreferences,
        disliked_ingredients: dislikedIngredients.split(",").map(s => s.trim()).filter(Boolean),
        calorie_target: calorieTarget || null,
        kitchen_equipment: kitchenEquipment,
        budget_mode: budgetMode,
      }),
    });

    if (res.ok) {
      setSaved(true);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar userEmail={userEmail} />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-muted uppercase tracking-wider text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <p className="label text-xs sm:text-sm mb-2">Personalization</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[0.9]">
            Diet
            <br />
            <span className="text-accent">Profile</span>
          </h1>
          <p className="text-muted mt-4">
            Set your preferences once and they&apos;ll auto-apply to recipe and meal plan generation.
          </p>
        </div>

        {/* Dietary Restrictions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Dietary Restrictions</h2>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleItem(dietaryRestrictions, setDietaryRestrictions, opt)}
                className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                  dietaryRestrictions.includes(opt)
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:border-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Cuisine Preferences */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Favorite Cuisines</h2>
          <p className="text-sm text-muted mb-3">Select cuisines you enjoy for recipe suggestions</p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleItem(cuisinePreferences, setCuisinePreferences, opt)}
                className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                  cuisinePreferences.includes(opt)
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:border-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Protein Preferences */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Protein Preferences</h2>
          <p className="text-sm text-muted mb-3">Proteins you typically cook with</p>
          <div className="flex flex-wrap gap-2">
            {PROTEIN_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleItem(proteinPreferences, setProteinPreferences, opt)}
                className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                  proteinPreferences.includes(opt)
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:border-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Disliked Ingredients */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Disliked Ingredients</h2>
          <p className="text-sm text-muted mb-3">Ingredients you want to avoid (comma-separated)</p>
          <input
            type="text"
            value={dislikedIngredients}
            onChange={(e) => { setDislikedIngredients(e.target.value); setSaved(false); }}
            placeholder="e.g., mushrooms, olives, cilantro"
            className="w-full bg-transparent border border-border px-4 py-3 focus:outline-none focus:border-foreground"
          />
        </section>

        {/* Kitchen Equipment */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Kitchen Equipment</h2>
          <p className="text-sm text-muted mb-3">Special equipment you have available</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleItem(kitchenEquipment, setKitchenEquipment, opt)}
                className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
                  kitchenEquipment.includes(opt)
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:border-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Calorie Target & Budget Mode */}
        <section className="mb-10 grid sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Daily Calorie Target</h2>
            <input
              type="number"
              value={calorieTarget}
              onChange={(e) => { setCalorieTarget(e.target.value ? parseInt(e.target.value) : ""); setSaved(false); }}
              placeholder="e.g., 2000"
              className="w-full bg-transparent border border-border px-4 py-3 focus:outline-none focus:border-foreground"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Budget Mode</h2>
            <button
              onClick={() => { setBudgetMode(!budgetMode); setSaved(false); }}
              className={`w-full px-4 py-3 text-sm font-medium border transition-colors ${
                budgetMode
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:border-foreground"
              }`}
            >
              {budgetMode ? "✓ Enabled - Prefer affordable ingredients" : "Disabled"}
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex gap-4 pt-6 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary ${saved ? "bg-green-600 border-green-600" : ""}`}
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Profile"}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">
            Back
          </button>
        </div>
      </div>
    </main>
  );
}
