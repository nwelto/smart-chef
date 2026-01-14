"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MealPrepWizard } from "@/components/MealPrepWizard";
import { MealPlanDisplay } from "@/components/MealPlanDisplay";
import { GroceryList } from "@/components/GroceryList";
import { createClient } from "@/lib/supabase/client";
import type {
  MealPlanResponse,
  GroceryList as GroceryListType,
  MealPrepFormState,
} from "@/lib/types";

export default function MealPrepPage() {
  const [userEmail, setUserEmail] = useState<string>();
  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryListType | null>(null);
  const [formData, setFormData] = useState<MealPrepFormState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"plan" | "grocery">("plan");

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    init();
  }, [supabase.auth]);

  async function handleGenerate(data: MealPrepFormState) {
    setError("");
    setLoading(true);
    setPlan(null);
    setGroceryList(null);
    setSaved(false);
    setFormData(data);

    const res = await fetch("/api/meal-plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familySize: data.familySize,
        allergies: data.allergies,
        exclusions: data.exclusions,
        preferredProteins: data.preferredProteins,
        days: data.days,
        meals: data.meals,
      }),
    });

    if (!res.ok) {
      const responseData = await res.json();
      setError(responseData.error || "Failed to generate meal plan");
      setLoading(false);
      return;
    }

    const planData = await res.json();
    setPlan(planData);
    setLoading(false);
  }

  async function handleSave() {
    if (!plan || !formData) return;

    setSaving(true);
    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        plan,
      }),
    });

    if (res.ok) {
      const savedData = await res.json();
      setSaved(true);
      if (savedData.grocery_list) {
        setGroceryList(savedData.grocery_list);
      }
    }
    setSaving(false);
  }

  function handleNewPlan() {
    setPlan(null);
    setGroceryList(null);
    setFormData(null);
    setSaved(false);
    setView("plan");
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {!plan ? (
          <MealPrepWizard
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
          />
        ) : (
          <>
            {/* View toggle tabs */}
            <div className="flex gap-2 mb-6 sm:mb-8">
              <button
                onClick={() => setView("plan")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                  view === "plan"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground border-border hover:border-foreground"
                }`}
              >
                Meal Plan
              </button>
              <button
                onClick={() => setView("grocery")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                  view === "grocery"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground border-border hover:border-foreground"
                }`}
              >
                Grocery List
              </button>
            </div>

            {view === "plan" ? (
              <MealPlanDisplay
                plan={plan}
                familySize={formData?.familySize || 4}
                onSave={handleSave}
                onNewPlan={handleNewPlan}
                saving={saving}
                saved={saved}
              />
            ) : (
              <GroceryList plan={plan} groceryList={groceryList} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
