import { env } from "@better-t-app/env/web";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { DrinkLogCard } from "@/components/drink-log-card";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data: stats } = useQuery(orpc.stats.summary.queryOptions());
  const { data: recentLogs } = useQuery(
    orpc.drinkLog.list.queryOptions({ input: { page: 1, limit: 5 } }),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <h1 className="mb-2 font-serif text-4xl font-bold text-foreground">
        ようこそ、{session.data?.user.name} さん
      </h1>
      <p className="mb-10 text-muted-foreground">あなたのお酒手帳へ</p>

      {/* サマリーカード */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">総記録数</p>
          <p className="mt-1 font-serif text-4xl font-bold text-primary">{stats?.totalLogs ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">今月の記録</p>
          <p className="mt-1 font-serif text-4xl font-bold text-primary">{stats?.logsThisMonth ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">お気に入り（★4以上）</p>
          <p className="mt-1 font-serif text-4xl font-bold text-primary">
            {stats?.favoriteItems.length ?? 0}
          </p>
        </div>
      </div>

      {/* カテゴリ分布 */}
      {stats && stats.categoryBreakdown.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-xl font-semibold">カテゴリ別内訳</h2>
          <div className="flex flex-wrap gap-3">
            {stats.categoryBreakdown.map(({ category, count }) => (
              <div key={category} className="rounded-lg border bg-card px-4 py-2 shadow-sm">
                <span className="text-sm font-medium">{category}</span>
                <span className="ml-2 text-sm text-muted-foreground">{count} 件</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近の記録 */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">最近の記録</h2>
          <Link to="/logs" className="text-sm text-primary hover:underline">
            すべて見る →
          </Link>
        </div>
        {recentLogs && recentLogs.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentLogs.items.map((log) => (
              <DrinkLogCard key={log.id} log={log} serverUrl={env.VITE_SERVER_URL} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
            <p className="mb-4">まだ記録がありません</p>
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
    </div>
  );
}
