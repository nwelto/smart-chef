"use client";

import type { MealPlanResponse, Meal } from "@/lib/types";

interface MealPlanDisplayProps {
  plan: MealPlanResponse;
  familySize: number;
  onSave?: () => void;
  onNewPlan?: () => void;
  saving?: boolean;
  saved?: boolean;
}

export function MealPlanDisplay({
  plan,
  familySize,
  onSave,
  onNewPlan,
  saving,
  saved,
}: MealPlanDisplayProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <p className="label text-xs sm:text-sm mb-2">Your Meal Plan</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
            {plan.days.length}-Day Plan
          </h2>
          <p className="text-muted text-sm sm:text-base mt-2">
            For {familySize} {familySize === 1 ? "person" : "people"}
          </p>
        </div>
      </div>

      <div className="space-y-8 sm:space-y-12">
        {plan.days.map((day) => (
          <div key={day.day} className="border border-border">
            <div className="bg-foreground text-background px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-lg sm:text-xl font-bold">{day.day}</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {day.meals.breakfast && (
                <MealCard title="Breakfast" meal={day.meals.breakfast} />
              )}
              {day.meals.lunch && (
                <MealCard title="Lunch" meal={day.meals.lunch} />
              )}
              {day.meals.dinner && (
                <MealCard title="Dinner" meal={day.meals.dinner} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
        {onSave && !saved && (
          <button
            onClick={onSave}
            className="btn-primary text-sm sm:text-base"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Meal Plan"}
          </button>
        )}
        {saved && (
          <span className="text-green-600 font-bold uppercase tracking-wider text-xs sm:text-sm py-3 sm:py-4">
            Meal plan saved
          </span>
        )}
        {onNewPlan && (
          <button
            onClick={onNewPlan}
            className="btn-secondary text-sm sm:text-base"
          >
            Create New Plan
          </button>
        )}
      </div>
    </div>
  );
}

function MealCard({ title, meal }: { title: string; meal: Meal }) {
  return (
    <div className="pb-6 border-b border-border last:border-0 last:pb-0">
      <p className="label text-xs mb-2">{title}</p>
      <h4 className="text-base sm:text-lg font-bold mb-1">{meal.title}</h4>
      <p className="text-muted text-sm mb-4">{meal.description}</p>

      <details className="group">
        <summary className="cursor-pointer text-xs sm:text-sm font-medium uppercase tracking-wider text-accent hover:underline">
          View Details
        </summary>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="label text-xs mb-2">Ingredients</p>
            <ul className="space-y-1">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{ing.amount}</span> {ing.item}
                  {ing.note && (
                    <span className="text-muted"> ({ing.note})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label text-xs mb-2">Instructions</p>
            <ol className="space-y-2">
              {meal.instructions.map((step, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="font-bold text-accent">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </details>
    </div>
  );
}
