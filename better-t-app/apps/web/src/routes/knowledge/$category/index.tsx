import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/knowledge/$category/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { category } = Route.useParams();

  const { data, isLoading } = useQuery(
    orpc.knowledge.getCategory.queryOptions({
      input: { slug: category as "whiskey" | "beer" | "wine" | "sake" | "cocktail" | "other" },
    }),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/knowledge" className="hover:text-foreground">
          お酒の知識
        </Link>
        <span>›</span>
        <span className="text-foreground">{data?.category.label ?? category}</span>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">読み込み中...</div>
      ) : !data ? (
        <div className="text-center text-muted-foreground py-10">カテゴリが見つかりません</div>
      ) : (
        <>
          <h1 className="mb-3 font-serif text-4xl font-bold text-foreground">
            {data.category.label}
          </h1>
          {data.category.fullDescription && (
            <p className="mb-10 max-w-2xl whitespace-pre-wrap text-muted-foreground">
              {data.category.fullDescription}
            </p>
          )}

          <h2 className="mb-6 font-serif text-2xl font-semibold">代表的な銘柄</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <Link
                key={item.id}
                to="/knowledge/$category/$itemId"
                params={{ category, itemId: item.id }}
                className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-1 font-serif text-lg font-semibold group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                {item.origin && (
                  <p className="mb-2 text-xs text-muted-foreground">{item.origin}</p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                )}
                {item.alcoholPercent != null && (
                  <p className="mt-3 text-xs font-medium text-primary">
                    アルコール度数: {item.alcoholPercent}%
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
