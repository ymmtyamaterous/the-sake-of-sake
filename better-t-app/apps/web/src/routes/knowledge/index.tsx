import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

const CATEGORY_EMOJI: Record<string, string> = {
  whiskey: "🥃",
  beer: "🍺",
  wine: "🍷",
  sake: "🍶",
  cocktail: "🍹",
  other: "🍸",
};

export const Route = createFileRoute("/knowledge/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: categories, isLoading } = useQuery(
    orpc.knowledge.listCategories.queryOptions(),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <h1 className="mb-3 font-serif text-4xl font-bold text-foreground">お酒の知識</h1>
      <p className="mb-4 text-muted-foreground">
        各カテゴリからお酒の基礎知識を学びましょう。
      </p>
      <p className="mb-10 flex items-center gap-1.5 rounded-lg border border-amber-300/50 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-400">
        <span>⚠</span>
        このページのお酒に関する情報は生成 AI によって作成されたものです。内容の正確性を保証するものではありません。
      </p>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">読み込み中...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((cat) => (
            <Link
              key={cat.slug}
              to="/knowledge/$category"
              params={{ category: cat.slug }}
              className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-5xl">{CATEGORY_EMOJI[cat.slug] ?? "🍸"}</div>
              <h2 className="mb-2 font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {cat.label}
              </h2>
              {cat.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
