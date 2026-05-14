import { env } from "@better-t-app/env/web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StarRating, VenueTypeBadge } from "@/components/ui-parts";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/venues/$venueId/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) redirect({ to: "/login", throw: true });
  },
});

function RouteComponent() {
  const { venueId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: venue, isLoading } = useQuery(
    orpc.venue.get.queryOptions({ input: { id: venueId } }),
  );

  const deleteMutation = useMutation(orpc.venue.delete.mutationOptions());

  const handleDelete = async () => {
    if (!confirm("この記録を削除しますか？")) return;
    deleteMutation.mutate(
      { id: venueId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          toast.success("削除しました");
          navigate({ to: "/venues" });
        },
        onError: () => toast.error("削除に失敗しました"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center text-muted-foreground">
        記録が見つかりません
      </div>
    );
  }

  const imageUrl = venue.imagePath ? `${env.VITE_SERVER_URL}/${venue.imagePath}` : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/venues" className="hover:text-foreground">
          お店記録
        </Link>
        <span>›</span>
        <span className="text-foreground">{venue.name}</span>
      </div>

      {imageUrl && (
        <div className="mb-6 overflow-hidden rounded-xl">
          <img src={imageUrl} alt={venue.name} className="w-full object-cover max-h-80" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h1 className="font-serif text-3xl font-bold text-foreground leading-snug">
            {venue.name}
          </h1>
          <div className="flex gap-2 shrink-0 sm:pt-1">
            <Link
              to="/venues/$venueId/edit"
              params={{ venueId: venue.id }}
              className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" /> 編集
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-card px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> 削除
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <VenueTypeBadge type={venue.type} />
          <StarRating value={venue.rating} readonly />
        </div>

        {venue.address && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {venue.address}
          </p>
        )}

        <p className="text-sm text-muted-foreground">訪問日: {venue.visitedAt}</p>

        {venue.notes && (
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">メモ・感想</h2>
            <p className="whitespace-pre-wrap text-sm text-foreground">{venue.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
