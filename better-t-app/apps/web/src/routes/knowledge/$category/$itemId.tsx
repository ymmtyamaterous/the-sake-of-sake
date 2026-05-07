import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/knowledge/$category/$itemId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { category, itemId } = Route.useParams();

  const { data: item, isLoading } = useQuery(
    orpc.knowledge.getItem.queryOptions({ input: { id: itemId } }),
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/knowledge" className="hover:text-foreground">お酒の知識</Link>
        <span>›</span>
        <Link to="/knowledge/$category" params={{ category }} className="hover:text-foreground">
          {category}
        </Link>
        <span>›</span>
        <span className="text-foreground">{item?.name ?? itemId}</span>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">読み込み中...</div>
      ) : !item ? (
        <div className="text-center text-muted-foreground py-10">銘柄が見つかりません</div>
      ) : (
        <div className="space-y-6">
          <p className="flex items-center gap-1.5 rounded-lg border border-amber-300/50 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-400">
            <span>⚠</span>
            このページの情報は生成 AI によって作成されたものです。内容の正確性を保証するものではありません。
          </p>
          <div>
            <h1 className="mb-1 font-serif text-4xl font-bold text-foreground">{item.name}</h1>
            {item.origin && (
              <p className="text-sm text-muted-foreground">{item.origin}</p>
            )}
          </div>

          {item.description && (
            <p className="text-base leading-relaxed text-foreground">{item.description}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {item.alcoholPercent != null && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">アルコール度数</p>
                <p className="mt-1 text-xl font-bold text-primary">{item.alcoholPercent}%</p>
              </div>
            )}
            {item.tastingNotes && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">テイスティングノート</p>
                <p className="mt-1 text-sm">{item.tastingNotes}</p>
              </div>
            )}
            {item.servingStyle && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">飲み方</p>
                <p className="mt-1 text-sm">{item.servingStyle}</p>
              </div>
            )}
          </div>

          {/* この銘柄を記録するCTA */}
          <div className="rounded-xl border bg-primary/5 p-5 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              この銘柄を飲んだことがありますか？
            </p>
            <Link
              to="/logs/new"
              search={{ name: item.name, category: item.categorySlug as any }}
            >
              <button
                type="button"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                この銘柄を記録する
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
