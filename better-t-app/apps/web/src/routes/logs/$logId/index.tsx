import { env } from "@better-t-app/env/web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CategoryBadge, StarRating } from "@/components/ui-parts";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/logs/$logId/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) redirect({ to: "/login", throw: true });
  },
});

function RouteComponent() {
  const { logId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: log, isLoading } = useQuery(
    orpc.drinkLog.get.queryOptions({ input: { id: logId } }),
  );

  const deleteMutation = useMutation(orpc.drinkLog.delete.mutationOptions());

  const handleDelete = async () => {
    if (!confirm("この記録を削除しますか？")) return;
    deleteMutation.mutate(
      { id: logId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          toast.success("削除しました");
          navigate({ to: "/logs" });
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

  if (!log) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center text-muted-foreground">
        記録が見つかりません
      </div>
    );
  }

  const imageUrl = log.imagePath ? `${env.VITE_SERVER_URL}/${log.imagePath}` : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/logs" className="hover:text-foreground">
          マイ記録
        </Link>
        <span>›</span>
        <span className="text-foreground">{log.name}</span>
      </div>

      {imageUrl && (
        <div className="mb-6 overflow-hidden rounded-xl">
          <img src={imageUrl} alt={log.name} className="w-full object-cover max-h-80" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h1 className="font-serif text-3xl font-bold text-foreground leading-snug">{log.name}</h1>
          <div className="flex gap-2 shrink-0 sm:pt-1">
            <Link
              to="/logs/$logId/edit"
              params={{ logId: log.id }}
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

        <div className="flex items-center gap-3">
          <CategoryBadge category={log.category} />
          <StarRating value={log.rating} readonly />
        </div>

        <p className="text-sm text-muted-foreground">飲んだ日: {log.drankAt}</p>

        {log.notes && (
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">メモ・感想</h2>
            <p className="whitespace-pre-wrap text-sm text-foreground">{log.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
