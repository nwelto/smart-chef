"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const PLAN_TYPES = [
  { id: "freezer-burritos", label: "Freezer Burritos", desc: "Make-ahead burritos for the week", icon: "🌯" },
  { id: "dinner-plan", label: "Dinner Plan", desc: "Complete dinners for your family", icon: "🍽️" },
  { id: "lunch-prep", label: "Lunch Meal Prep", desc: "Portioned lunches ready to grab", icon: "🥗" },
  { id: "breakfast-prep", label: "Breakfast Prep", desc: "Quick morning meals ready to go", icon: "🍳" },
  { id: "snack-prep", label: "Healthy Snacks", desc: "Portioned snacks for the week", icon: "🥜" },
  { id: "full-week", label: "Full Week Plan", desc: "Breakfast, lunch, and dinner", icon: "📅" },
];

const PROTEIN_OPTIONS = [
  "Chicken", "Beef", "Pork", "Turkey", "Fish", "Shrimp", "Tofu", "Beans/Legumes", "Eggs", "No Preference"
];

const DIETARY_OPTIONS = [
  "Gluten-Free", "Dairy-Free", "Egg-Free", "Nut-Free", "Vegetarian", "Vegan", "Keto", "Low-Carb", "Low-Sodium"
];

interface MealIngredient {
  item: string;
  amount: string;
}

interface Meal {
  name: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes?: number;
  servings?: number;
  ingredients?: MealIngredient[];
  instructions?: string[];
  macros: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

interface MealPlanResult {
  title: string;
  description: string;
  days: {
    day: string;
    meals: Meal[];
  }[];
  grocery_list: { category: string; items: string[] }[];
  prep_instructions: string[];
  storage_tips: string[];
  total_prep_time_hours: number;
}

export default function PlanPage() {
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState<string>();
  const supabase = createClient();

  // Wizard state
  const [planType, setPlanType] = useState("");
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(5);
  const [mealsPerDay, setMealsPerDay] = useState(1);
  const [proteins, setProteins] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  
  // Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MealPlanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  function toggleMeal(mealKey: string) {
    setExpandedMeals(prev => {
      const next = new Set(prev);
      if (next.has(mealKey)) {
        next.delete(mealKey);
      } else {
        next.add(mealKey);
      }
      return next;
    });
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    }
    init();
  }, [supabase.auth]);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    
    const res = await fetch("/api/meal-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planType,
        people,
        days,
        mealsPerDay,
        proteins,
        exclusions: exclusions.split(",").map(s => s.trim()).filter(Boolean),
        dietary,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to generate meal plan");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setResult(data);
    setLoading(false);
    setSaved(false);
    setStep(7);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);

    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: result.title,
        description: result.description,
        plan_type: planType,
        people,
        days,
        meals_per_day: mealsPerDay,
        total_prep_time_hours: result.total_prep_time_hours,
        plan_data: {
          days: result.days,
          grocery_list: result.grocery_list,
          prep_instructions: result.prep_instructions,
          storage_tips: result.storage_tips,
        },
      }),
    });

    if (res.ok) {
      setSaved(true);
    }
    setSaving(false);
  }

  function toggleProtein(p: string) {
    if (proteins.includes(p)) {
      setProteins(proteins.filter(x => x !== p));
    } else {
      setProteins([...proteins, p]);
    }
  }

  function toggleDietary(d: string) {
    if (dietary.includes(d)) {
      setDietary(dietary.filter(x => x !== d));
    } else {
      setDietary([...dietary, d]);
    }
  }

  const selectedPlan = PLAN_TYPES.find(p => p.id === planType);

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        
        {/* Header */}
        {step === 1 && (
          <div className="mb-12 text-center">
            <span className="text-5xl sm:text-6xl mb-4 block">📅</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Meal Plan <span className="text-accent">Wizard</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Create a complete meal prep plan with full recipes, grocery lists, and prep instructions in just 6 steps.
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {step < 7 && (
          <div className="flex gap-1 mb-8">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 ${s <= step ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Choose Plan Type */}
        {step === 1 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              What are you planning?
            </h2>
            <p className="text-muted mb-6">Choose the type of meal plan you want to create.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {PLAN_TYPES.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setPlanType(plan.id)}
                  className={`p-4 sm:p-6 text-left border-2 transition-all ${
                    planType === plan.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  <span className="text-3xl mb-2 block">{plan.icon}</span>
                  <span className="text-lg font-bold block">{plan.label}</span>
                  <span className="text-sm text-muted">{plan.desc}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!planType}
                className="btn-primary"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: How many people & days */}
        {step === 2 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 2 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Who are you feeding?
            </h1>
            <p className="text-muted mb-8">Tell us about your household.</p>

            <div className="space-y-8">
              <div>
                <label className="label block mb-3">Number of People</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPeople(Math.max(1, people - 1))}
                    className="w-12 h-12 border-2 border-border text-2xl font-bold hover:border-foreground"
                  >
                    -
                  </button>
                  <span className="text-4xl font-black w-16 text-center">{people}</span>
                  <button
                    onClick={() => setPeople(Math.min(12, people + 1))}
                    className="w-12 h-12 border-2 border-border text-2xl font-bold hover:border-foreground"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="label block mb-3">Number of Days</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="w-12 h-12 border-2 border-border text-2xl font-bold hover:border-foreground"
                  >
                    -
                  </button>
                  <span className="text-4xl font-black w-16 text-center">{days}</span>
                  <button
                    onClick={() => setDays(Math.min(14, days + 1))}
                    className="w-12 h-12 border-2 border-border text-2xl font-bold hover:border-foreground"
                  >
                    +
                  </button>
                </div>
              </div>

              {(planType === "full-week" || planType === "dinner-plan") && (
                <div>
                  <label className="label block mb-3">Meals Per Day</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setMealsPerDay(n)}
                        className={`px-6 py-3 border-2 font-bold ${
                          mealsPerDay === n
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Protein preferences */}
        {step === 3 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 3 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Protein preferences
            </h1>
            <p className="text-muted mb-8">Select all proteins you enjoy. We&apos;ll vary them throughout your plan.</p>

            <div className="flex flex-wrap gap-2">
              {PROTEIN_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleProtein(p)}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    proteins.includes(p)
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Exclusions */}
        {step === 4 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 4 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Anything you dislike?
            </h1>
            <p className="text-muted mb-8">
              Not allergies, just foods you don&apos;t enjoy. Separate with commas.
            </p>

            <input
              type="text"
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              placeholder="e.g., mushrooms, olives, cilantro"
              className="input text-lg"
            />
            <p className="text-xs text-muted mt-2">Leave blank if there&apos;s nothing you want to exclude.</p>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(3)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(5)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Dietary restrictions */}
        {step === 5 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 5 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Dietary restrictions
            </h1>
            <p className="text-muted mb-8">Select any that apply. Skip if none.</p>

            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDietary(d)}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    dietary.includes(d)
                      ? "bg-accent text-white border-accent"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(4)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(6)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Generate */}
        {step === 6 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 6 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Review your plan
            </h1>
            <p className="text-muted mb-8">Make sure everything looks right.</p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted">Plan Type</span>
                <span className="font-bold">{selectedPlan?.icon} {selectedPlan?.label}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted">Servings</span>
                <span className="font-bold">{people} people × {days} days</span>
              </div>
              {mealsPerDay > 1 && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Meals Per Day</span>
                  <span className="font-bold">{mealsPerDay}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted">Proteins</span>
                <span className="font-bold">{proteins.length > 0 ? proteins.join(", ") : "Any"}</span>
              </div>
              {exclusions && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Excluding</span>
                  <span className="font-bold">{exclusions}</span>
                </div>
              )}
              {dietary.length > 0 && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Dietary</span>
                  <span className="font-bold">{dietary.join(", ")}</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-accent font-medium mb-4">{error}</p>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(5)} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary text-lg px-8 py-4"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Plan...
                  </span>
                ) : (
                  "Generate Meal Plan 🍳"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Results */}
        {step === 7 && result && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                {result.title}
              </h1>
              <p className="text-muted">{result.description}</p>
              <p className="text-sm text-accent font-bold mt-2">
                Total prep time: ~{result.total_prep_time_hours} hours
              </p>
            </div>

            {/* Grocery List */}
            <div className="mb-12 p-6 bg-card border border-border">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">🛒 Grocery List</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {result.grocery_list.map((cat) => (
                  <div key={cat.category}>
                    <p className="font-bold text-accent mb-2">{cat.category}</p>
                    <ul className="space-y-1">
                      {cat.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-4 h-4 border-2 border-border shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Meals */}
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">📅 Your Meal Plan</h2>
              <div className="space-y-6">
                {result.days.map((day, dayIndex) => (
                  <div key={day.day} className="border border-border p-4 sm:p-6">
                    <h3 className="font-bold text-lg mb-4">{day.day}</h3>
                    <div className="space-y-4">
                      {day.meals.map((meal, mealIndex) => {
                        const mealKey = `${dayIndex}-${mealIndex}`;
                        const isExpanded = expandedMeals.has(mealKey);
                        const hasRecipe = meal.ingredients && meal.ingredients.length > 0;

                        return (
                          <div key={mealIndex} className="border border-border/50">
                            {/* Meal Header */}
                            <button
                              onClick={() => hasRecipe && toggleMeal(mealKey)}
                              className={`w-full text-left p-4 ${hasRecipe ? "cursor-pointer hover:bg-card/50" : ""}`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold">{meal.name}</p>
                                    {hasRecipe && (
                                      <span className="text-xs text-accent">
                                        {isExpanded ? "▼" : "▶"} Recipe
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted">{meal.description}</p>
                                  <p className="text-xs text-muted mt-1">
                                    Prep: {meal.prep_time_minutes} min
                                    {meal.cook_time_minutes && ` • Cook: ${meal.cook_time_minutes} min`}
                                  </p>
                                </div>
                                <div className="flex gap-4 text-xs text-center">
                                  <div>
                                    <p className="font-bold text-accent">{meal.macros?.calories || 0}</p>
                                    <p className="text-muted">cal</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">{meal.macros?.protein_g || 0}g</p>
                                    <p className="text-muted">protein</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">{meal.macros?.carbs_g || 0}g</p>
                                    <p className="text-muted">carbs</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">{meal.macros?.fat_g || 0}g</p>
                                    <p className="text-muted">fat</p>
                                  </div>
                                </div>
                              </div>
                            </button>

                            {/* Expanded Recipe */}
                            {isExpanded && hasRecipe && (
                              <div className="border-t border-border/50 p-4 bg-card/30">
                                <div className="grid md:grid-cols-2 gap-6">
                                  {/* Ingredients */}
                                  <div>
                                    <h4 className="font-bold mb-3">Ingredients</h4>
                                    <ul className="space-y-1">
                                      {(meal.ingredients || []).map((ing, i) => (
                                        <li key={i} className="text-sm flex gap-2">
                                          <span className="text-accent font-medium">{ing.amount}</span>
                                          <span>{ing.item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Instructions */}
                                  {meal.instructions && meal.instructions.length > 0 && (
                                    <div>
                                      <h4 className="font-bold mb-3">Instructions</h4>
                                      <ol className="space-y-2">
                                        {meal.instructions.map((instrStep, i) => (
                                          <li key={i} className="text-sm flex gap-3">
                                            <span className="w-5 h-5 bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">
                                              {i + 1}
                                            </span>
                                            <span>{instrStep}</span>
                                          </li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prep Instructions */}
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">👨‍🍳 Prep Instructions</h2>
              <ol className="space-y-3">
                {result.prep_instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-8 h-8 bg-foreground text-background font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Storage Tips */}
            <div className="mb-12 p-6 bg-card border border-border">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">💡 Storage Tips</h2>
              <ul className="space-y-2">
                {result.storage_tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-accent">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`btn-primary ${saved ? "bg-green-600 border-green-600" : ""}`}
              >
                {saving ? "Saving..." : saved ? "✓ Saved to My Meal Plans" : "Save Plan"}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setSaved(false);
                }}
                className="btn-secondary"
              >
                Create Another Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
