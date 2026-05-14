import { env } from "@better-t-app/env/web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/image-upload";
import { StarRating } from "@/components/ui-parts";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const CATEGORIES = [
  { value: "whiskey", label: "ウイスキー" },
  { value: "beer", label: "ビール" },
  { value: "wine", label: "ワイン" },
  { value: "sake", label: "日本酒" },
  { value: "cocktail", label: "カクテル" },
  { value: "other", label: "その他" },
] as const;

export const Route = createFileRoute("/logs/$logId/edit")({
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

  const updateMutation = useMutation(orpc.drinkLog.update.mutationOptions());

  const [name, setName] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [rating, setRating] = useState<number | undefined>();
  const [drankAt, setDrankAt] = useState<string | undefined>();
  const [notes, setNotes] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading || !log) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  const currentName = name ?? log.name;
  const currentCategory = category ?? log.category;
  const currentRating = rating ?? log.rating;
  const currentDrankAt = drankAt ?? log.drankAt;
  const currentNotes = notes ?? (log.notes ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName.trim()) return toast.error("お酒の名前を入力してください");

    let imagePath: string | null | undefined = undefined;

    if (imageFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch(`${env.VITE_SERVER_URL}/api/uploads/drink-logs`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const json = await res.json() as { filePath: string };
        imagePath = json.filePath;
      } catch {
        toast.error("画像のアップロードに失敗しました");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    updateMutation.mutate(
      {
        id: logId,
        name: currentName,
        category: currentCategory as any,
        rating: currentRating,
        drankAt: currentDrankAt,
        notes: currentNotes || null,
        ...(imagePath !== undefined ? { imagePath } : {}),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          toast.success("更新しました！");
          navigate({ to: "/logs/$logId", params: { logId } });
        },
        onError: () => toast.error("更新に失敗しました"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/logs" className="hover:text-foreground">マイ記録</Link>
        <span>›</span>
        <Link to="/logs/$logId" params={{ logId }} className="hover:text-foreground">{log.name}</Link>
        <span>›</span>
        <span className="text-foreground">編集</span>
      </div>

      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">記録を編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="name">
            お酒の名前 <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={currentName}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="category">
            カテゴリ
          </label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">評価</label>
          <StarRating value={currentRating} onChange={setRating} size="lg" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="drankAt">
            飲んだ日
          </label>
          <input
            id="drankAt"
            type="date"
            value={currentDrankAt}
            onChange={(e) => setDrankAt(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="notes">
            メモ・感想
          </label>
          <textarea
            id="notes"
            value={currentNotes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">画像を変更（任意）</label>
          <ImageUpload
            value={log.imagePath}
            onChange={setImageFile}
            serverUrl={env.VITE_SERVER_URL}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending || isUploading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateMutation.isPending || isUploading ? "更新中..." : "更新する"}
          </button>
          <Link to="/logs/$logId" params={{ logId }}>
            <button
              type="button"
              className="rounded-lg border bg-card px-5 py-2.5 text-sm hover:bg-muted"
            >
              キャンセル
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
