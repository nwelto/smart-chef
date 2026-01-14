"use client";

import { TagInput } from "@/components/TagInput";

const COMMON_ALLERGIES = [
  "peanuts",
  "tree nuts",
  "dairy",
  "eggs",
  "shellfish",
  "fish",
  "soy",
  "wheat",
  "gluten",
];

interface AllergiesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function AllergiesStep({ value, onChange }: AllergiesStepProps) {
  function toggleAllergy(allergy: string) {
    if (value.includes(allergy)) {
      onChange(value.filter((a) => a !== allergy));
    } else {
      onChange([...value, allergy]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label text-xs mb-3">Common Allergies</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((allergy) => (
            <button
              key={allergy}
              onClick={() => toggleAllergy(allergy)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium border-2 transition-all ${
                value.includes(allergy)
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-transparent border-border hover:border-foreground"
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
      </div>
      <TagInput
        label="Add Other Allergies"
        placeholder="Type an allergy..."
        tags={value.filter((a) => !COMMON_ALLERGIES.includes(a))}
        onChange={(custom) => {
          const common = value.filter((a) => COMMON_ALLERGIES.includes(a));
          onChange([...common, ...custom]);
        }}
      />
      {value.length === 0 && (
        <p className="text-muted text-sm">
          No allergies selected - skip to continue
        </p>
      )}
    </div>
  );
}
