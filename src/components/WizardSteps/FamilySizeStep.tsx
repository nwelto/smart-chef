"use client";

interface FamilySizeStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function FamilySizeStep({ value, onChange }: FamilySizeStepProps) {
  function increment() {
    if (value < 20) onChange(value + 1);
  }

  function decrement() {
    if (value > 1) onChange(value - 1);
  }

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-8">
      <button
        onClick={decrement}
        className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-border text-2xl sm:text-3xl font-bold hover:border-foreground transition-colors disabled:opacity-50"
        disabled={value <= 1}
      >
        -
      </button>
      <span className="text-5xl sm:text-7xl font-black w-24 sm:w-32 text-center">
        {value}
      </span>
      <button
        onClick={increment}
        className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-border text-2xl sm:text-3xl font-bold hover:border-foreground transition-colors disabled:opacity-50"
        disabled={value >= 20}
      >
        +
      </button>
    </div>
  );
}
