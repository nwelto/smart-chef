"use client";

import { TagInput } from "@/components/TagInput";

const COMMON_PROTEINS = [
  "chicken",
  "beef",
  "pork",
  "fish",
  "shrimp",
  "tofu",
  "eggs",
  "turkey",
  "lamb",
];

interface ProteinsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ProteinsStep({ value, onChange }: ProteinsStepProps) {
  function toggleProtein(protein: string) {
    if (value.includes(protein)) {
      onChange(value.filter((p) => p !== protein));
    } else {
      onChange([...value, protein]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label text-xs mb-3">Common Proteins</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_PROTEINS.map((protein) => (
            <button
              key={protein}
              onClick={() => toggleProtein(protein)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium border-2 transition-all ${
                value.includes(protein)
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent border-border hover:border-foreground"
              }`}
            >
              {protein}
            </button>
          ))}
        </div>
      </div>
      <TagInput
        label="Add Other Proteins"
        placeholder="Type a protein..."
        tags={value.filter((p) => !COMMON_PROTEINS.includes(p))}
        onChange={(custom) => {
          const common = value.filter((p) => COMMON_PROTEINS.includes(p));
          onChange([...common, ...custom]);
        }}
      />
      {value.length === 0 && (
        <p className="text-muted text-sm">
          No preferences - we&apos;ll use variety
        </p>
      )}
    </div>
  );
}
