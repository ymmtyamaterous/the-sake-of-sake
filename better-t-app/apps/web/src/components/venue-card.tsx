import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { StarRating, VenueTypeBadge } from "./ui-parts";

type Venue = {
  id: string;
  name: string;
  type: string;
  address: string | null;
  visitedAt: string;
  rating: number;
  notes: string | null;
  imagePath: string | null;
};

export function VenueCard({ venue, serverUrl }: { venue: Venue; serverUrl: string }) {
  const imageUrl = venue.imagePath ? `${serverUrl}/${venue.imagePath}` : null;

  return (
    <Link
      to="/venues/$venueId"
      params={{ venueId: venue.id }}
      className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* サムネイル */}
      <div className="aspect-video w-full overflow-hidden bg-surface-container-high">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl opacity-30">🏮</div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif font-semibold text-foreground leading-snug line-clamp-2">
            {venue.name}
          </h3>
          <VenueTypeBadge type={venue.type} />
        </div>

        <StarRating value={venue.rating} readonly size="sm" />

        {venue.address && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{venue.address}</span>
          </p>
        )}

        <p className="text-xs text-muted-foreground">{venue.visitedAt}</p>

        {venue.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{venue.notes}</p>
        )}
      </div>
    </Link>
  );
}
