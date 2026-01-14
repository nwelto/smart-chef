"use client";

import { TagInput } from "@/components/TagInput";

const COMMON_EXCLUSIONS = [
  "soy",
  "mushrooms",
  "onions",
  "tomatoes",
  "spicy food",
  "cilantro",
  "olives",
  "anchovies",
];

interface ExclusionsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ExclusionsStep({ value, onChange }: ExclusionsStepProps) {
  function toggleExclusion(exclusion: string) {
    if (value.includes(exclusion)) {
      onChange(value.filter((e) => e !== exclusion));
    } else {
      onChange([...value, exclusion]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label text-xs mb-3">Common Exclusions</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_EXCLUSIONS.map((exclusion) => (
            <button
              key={exclusion}
              onClick={() => toggleExclusion(exclusion)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium border-2 transition-all ${
                value.includes(exclusion)
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent border-border hover:border-foreground"
              }`}
            >
              {exclusion}
            </button>
          ))}
        </div>
      </div>
      <TagInput
        label="Add Other Exclusions"
        placeholder="Type a food to exclude..."
        tags={value.filter((e) => !COMMON_EXCLUSIONS.includes(e))}
        onChange={(custom) => {
          const common = value.filter((e) => COMMON_EXCLUSIONS.includes(e));
          onChange([...common, ...custom]);
        }}
      />
      {value.length === 0 && (
        <p className="text-muted text-sm">
          No exclusions - skip to continue
        </p>
      )}
    </div>
  );
}
