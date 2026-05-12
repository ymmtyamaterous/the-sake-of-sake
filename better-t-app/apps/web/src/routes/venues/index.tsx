import { env } from "@better-t-app/env/web";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { VenueCard } from "@/components/venue-card";
import { VenueTypeBadge } from "@/components/ui-parts";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const VENUE_TYPES = ["izakaya", "bar", "wine_bar", "sake_bar", "beer_bar", "other"] as const;
type VenueType = (typeof VENUE_TYPES)[number];

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  izakaya: "居酒屋",
  bar: "バー",
  wine_bar: "ワインバー",
  sake_bar: "日本酒バー",
  beer_bar: "ビアバー",
  other: "その他",
};

const searchSchema = z.object({
  type: z.enum(VENUE_TYPES).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(1),
});

export const Route = createFileRoute("/venues/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
  },
});

function RouteComponent() {
  const { type, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data } = useQuery(
    orpc.venue.list.queryOptions({
      input: { type, page, limit: 12 },
    }),
  );

  const setType = (t: VenueType | undefined) => {
    navigate({ search: (prev) => ({ ...prev, type: t, page: 1 }) });
  };
  const setPage = (p: number) => {
    navigate({ search: (prev) => ({ ...prev, page: p }) });
  };

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">お店記録</h1>
        <Link
          to="/venues/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          + 新しく記録する
        </Link>
      </div>

      {/* タイプフィルター */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setType(undefined)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !type
              ? "bg-primary text-primary-foreground"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          すべて
        </button>
        {VENUE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              type === t
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {VENUE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {data && data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((v) => (
              <VenueCard key={v.id} venue={v} serverUrl={env.VITE_SERVER_URL} />
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded px-3 py-1.5 text-sm border bg-card disabled:opacity-40 hover:bg-muted"
              >
                ← 前へ
              </button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded px-3 py-1.5 text-sm border bg-card disabled:opacity-40 hover:bg-muted"
              >
                次へ →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border bg-card p-16 text-center text-muted-foreground">
          <p className="mb-4 text-lg">記録がありません</p>
          <Link to="/venues/new">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              最初の記録を作成する
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
