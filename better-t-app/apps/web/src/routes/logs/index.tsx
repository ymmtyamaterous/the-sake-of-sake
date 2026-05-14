import { env } from "@better-t-app/env/web";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { DrinkLogCard } from "@/components/drink-log-card";
import { CategoryBadge } from "@/components/ui-parts";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const CATEGORIES = ["whiskey", "beer", "wine", "sake", "cocktail", "other"] as const;
type Category = (typeof CATEGORIES)[number];

const searchSchema = z.object({
  category: z.enum(CATEGORIES).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(1),
});

export const Route = createFileRoute("/logs/")({
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
  const { category, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data } = useQuery(
    orpc.drinkLog.list.queryOptions({
      input: { category, page, limit: 12 },
    }),
  );

  const setCategory = (cat: Category | undefined) => {
    navigate({ search: (prev) => ({ ...prev, category: cat, page: 1 }) });
  };
  const setPage = (p: number) => {
    navigate({ search: (prev) => ({ ...prev, page: p }) });
  };

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">マイ記録</h1>
        <Link
          to="/logs/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          + 新しく記録する
        </Link>
      </div>

      {/* カテゴリフィルター */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(undefined)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !category
              ? "bg-primary text-primary-foreground"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <CategoryBadge category={cat} />
          </button>
        ))}
      </div>

      {/* ログ一覧 */}
      {data && data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((log) => (
              <DrinkLogCard key={log.id} log={log} serverUrl={env.VITE_SERVER_URL} />
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
          <Link to="/logs/new">
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
