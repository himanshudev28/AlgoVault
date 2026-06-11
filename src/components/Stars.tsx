"use client";

export function Stars({
  value,
  onChange,
  size = "text-base",
}: {
  value: number | null;
  onChange?: (v: number) => void;
  size?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${size} leading-none`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange?.(i);
          }}
          title={`Confidence ${i}/5`}
          className={`transition-transform ${onChange ? "hover:scale-125 cursor-pointer" : "cursor-default"} ${
            value != null && i <= value
              ? "text-yellow-400"
              : "text-zinc-300 dark:text-zinc-700"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
