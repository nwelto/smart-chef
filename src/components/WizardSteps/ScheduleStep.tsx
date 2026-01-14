"use client";

interface ScheduleStepProps {
  days: number;
  meals: string[];
  onDaysChange: (value: number) => void;
  onMealsChange: (value: string[]) => void;
}

const MEAL_OPTIONS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

export function ScheduleStep({
  days,
  meals,
  onDaysChange,
  onMealsChange,
}: ScheduleStepProps) {
  function toggleMeal(meal: string) {
    if (meals.includes(meal)) {
      onMealsChange(meals.filter((m) => m !== meal));
    } else {
      onMealsChange([...meals, meal]);
    }
  }

  return (
    <div className="space-y-8">
      {/* Days selector */}
      <div>
        <p className="label text-xs mb-3">Number of Days</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base font-bold border-2 transition-all ${
                days === d
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent border-border hover:border-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Meal checkboxes */}
      <div>
        <p className="label text-xs mb-3">Meals to Plan</p>
        <div className="space-y-2">
          {MEAL_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 sm:p-4 border border-border cursor-pointer hover:border-foreground transition-colors"
            >
              <input
                type="checkbox"
                checked={meals.includes(option.id)}
                onChange={() => toggleMeal(option.id)}
                className="w-5 h-5 accent-accent"
              />
              <span className="text-sm sm:text-base font-medium">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {meals.length === 0 && (
          <p className="text-accent text-sm mt-2 font-medium">
            Select at least one meal type
          </p>
        )}
      </div>
    </div>
  );
}
