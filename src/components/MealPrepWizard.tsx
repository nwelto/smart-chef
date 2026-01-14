"use client";

import { useState } from "react";
import { FamilySizeStep } from "@/components/WizardSteps/FamilySizeStep";
import { AllergiesStep } from "@/components/WizardSteps/AllergiesStep";
import { ExclusionsStep } from "@/components/WizardSteps/ExclusionsStep";
import { ProteinsStep } from "@/components/WizardSteps/ProteinsStep";
import { ScheduleStep } from "@/components/WizardSteps/ScheduleStep";
import type { MealPrepFormState } from "@/lib/types";

interface MealPrepWizardProps {
  onGenerate: (data: MealPrepFormState) => void;
  loading: boolean;
  error: string;
}

const STEPS = [
  {
    id: 1,
    title: "Family Size",
    description: "How many people are you cooking for?",
  },
  { id: 2, title: "Allergies", description: "Any food allergies to avoid?" },
  { id: 3, title: "Exclusions", description: "Foods you want to exclude?" },
  { id: 4, title: "Proteins", description: "Preferred protein sources?" },
  {
    id: 5,
    title: "Schedule",
    description: "How many days and which meals?",
  },
  { id: 6, title: "Generate", description: "Review and create your plan" },
];

export function MealPrepWizard({
  onGenerate,
  loading,
  error,
}: MealPrepWizardProps) {
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<MealPrepFormState>({
    familySize: 4,
    allergies: [],
    exclusions: [],
    preferredProteins: [],
    days: 7,
    meals: ["breakfast", "lunch", "dinner"],
  });

  function updateFormState<K extends keyof MealPrepFormState>(
    key: K,
    value: MealPrepFormState[K]
  ) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function nextStep() {
    if (step < 6) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  function handleSubmit() {
    onGenerate(formState);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <p className="label text-xs sm:text-sm mb-2">Meal Prep Wizard</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9]">
          Plan your
          <br />
          <span className="text-accent">week</span>
        </h1>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1 sm:gap-2 mb-8 sm:mb-12">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1 sm:h-2 flex-1 transition-colors ${
              s.id <= step ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step title */}
      <div className="mb-6 sm:mb-8">
        <p className="label text-xs sm:text-sm mb-1">Step {step} of 6</p>
        <h2 className="text-xl sm:text-2xl font-bold">
          {STEPS[step - 1].title}
        </h2>
        <p className="text-muted text-sm sm:text-base mt-1">
          {STEPS[step - 1].description}
        </p>
      </div>

      {/* Step content */}
      <div className="mb-8 sm:mb-12 pb-8 sm:pb-12 border-b border-border">
        {step === 1 && (
          <FamilySizeStep
            value={formState.familySize}
            onChange={(v) => updateFormState("familySize", v)}
          />
        )}
        {step === 2 && (
          <AllergiesStep
            value={formState.allergies}
            onChange={(v) => updateFormState("allergies", v)}
          />
        )}
        {step === 3 && (
          <ExclusionsStep
            value={formState.exclusions}
            onChange={(v) => updateFormState("exclusions", v)}
          />
        )}
        {step === 4 && (
          <ProteinsStep
            value={formState.preferredProteins}
            onChange={(v) => updateFormState("preferredProteins", v)}
          />
        )}
        {step === 5 && (
          <ScheduleStep
            days={formState.days}
            meals={formState.meals}
            onDaysChange={(v) => updateFormState("days", v)}
            onMealsChange={(v) => updateFormState("meals", v)}
          />
        )}
        {step === 6 && <ReviewStep formState={formState} />}
      </div>

      {/* Error display */}
      {error && (
        <p className="text-accent font-medium text-sm sm:text-base mb-4">
          {error}
        </p>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="btn-secondary text-sm sm:text-base"
            disabled={loading}
          >
            Back
          </button>
        )}
        {step < 6 ? (
          <button onClick={nextStep} className="btn-primary text-sm sm:text-base">
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn-primary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5"
            disabled={loading || formState.meals.length === 0}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Meal Plan"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewStep({ formState }: { formState: MealPrepFormState }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 border border-border">
          <p className="label text-xs mb-1">Family Size</p>
          <p className="text-lg font-bold">{formState.familySize} people</p>
        </div>
        <div className="p-4 border border-border">
          <p className="label text-xs mb-1">Days</p>
          <p className="text-lg font-bold">{formState.days} days</p>
        </div>
      </div>
      <div className="p-4 border border-border">
        <p className="label text-xs mb-2">Meals</p>
        <div className="flex flex-wrap gap-2">
          {formState.meals.map((m) => (
            <span key={m} className="tag text-xs sm:text-sm capitalize">
              {m}
            </span>
          ))}
        </div>
      </div>
      {formState.allergies.length > 0 && (
        <div className="p-4 border border-border">
          <p className="label text-xs mb-2">Allergies (will avoid)</p>
          <div className="flex flex-wrap gap-2">
            {formState.allergies.map((a) => (
              <span
                key={a}
                className="tag text-xs sm:text-sm bg-red-100 text-red-800"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
      {formState.exclusions.length > 0 && (
        <div className="p-4 border border-border">
          <p className="label text-xs mb-2">Exclusions</p>
          <div className="flex flex-wrap gap-2">
            {formState.exclusions.map((e) => (
              <span key={e} className="tag text-xs sm:text-sm">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
      {formState.preferredProteins.length > 0 && (
        <div className="p-4 border border-border">
          <p className="label text-xs mb-2">Preferred Proteins</p>
          <div className="flex flex-wrap gap-2">
            {formState.preferredProteins.map((p) => (
              <span key={p} className="tag text-xs sm:text-sm">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
