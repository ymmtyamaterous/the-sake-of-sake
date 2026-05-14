import { Link } from "@tanstack/react-router";
import { CategoryBadge, StarRating } from "./ui-parts";

type DrinkLog = {
  id: string;
  name: string;
  category: string;
  rating: number;
  drankAt: string;
  notes: string | null;
  imagePath: string | null;
};

export function DrinkLogCard({ log, serverUrl }: { log: DrinkLog; serverUrl: string }) {
  const imageUrl = log.imagePath ? `${serverUrl}/${log.imagePath}` : null;

  return (
    <Link
      to="/logs/$logId"
      params={{ logId: log.id }}
      className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* サムネイル */}
      <div className="aspect-video w-full overflow-hidden bg-surface-container-high">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={log.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl opacity-30">🍶</div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif font-semibold text-foreground leading-snug line-clamp-2">
            {log.name}
          </h3>
          <CategoryBadge category={log.category} className="shrink-0" />
        </div>

        <StarRating value={log.rating} readonly size="sm" />

        <p className="text-xs text-muted-foreground">{log.drankAt}</p>

        {log.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{log.notes}</p>
        )}
      </div>
    </Link>
  );
}
