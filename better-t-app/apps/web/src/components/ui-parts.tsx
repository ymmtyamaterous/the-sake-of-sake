import { Star } from "lucide-react";
import { cn } from "@better-t-app/ui/lib/utils";

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  whiskey: { label: "ウイスキー", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  beer: { label: "ビール", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  wine: { label: "ワイン", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
  sake: { label: "日本酒", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
  cocktail: { label: "カクテル", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  other: { label: "その他", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

const VENUE_TYPE_MAP: Record<string, { label: string; color: string }> = {
  izakaya: { label: "居酒屋", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  bar: { label: "バー", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  wine_bar: { label: "ワインバー", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
  sake_bar: { label: "日本酒バー", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
  beer_bar: { label: "ビアバー", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  other: { label: "その他", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const meta = CATEGORY_MAP[category] ?? { label: category, color: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        meta.color,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function VenueTypeBadge({ type, className }: { type: string; className?: string }) {
  const meta = VENUE_TYPE_MAP[type] ?? { label: type, color: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        meta.color,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "focus:outline-none",
            !readonly && "cursor-pointer hover:scale-110 transition-transform",
            readonly && "cursor-default",
          )}
          aria-label={`${star}星`}
        >
          <Star
            className={cn(
              sizeClass,
              "transition-colors",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
