import { env } from "@better-t-app/env/web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/image-upload";
import { StarRating } from "@/components/ui-parts";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const VENUE_TYPES = [
  { value: "izakaya", label: "居酒屋" },
  { value: "bar", label: "バー" },
  { value: "wine_bar", label: "ワインバー" },
  { value: "sake_bar", label: "日本酒バー" },
  { value: "beer_bar", label: "ビアバー" },
  { value: "other", label: "その他" },
] as const;

export const Route = createFileRoute("/venues/$venueId/edit")({
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

  const updateMutation = useMutation(orpc.venue.update.mutationOptions());

  const [name, setName] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  const [visitedAt, setVisitedAt] = useState<string | undefined>();
  const [rating, setRating] = useState<number | undefined>();
  const [notes, setNotes] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading || !venue) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  const currentName = name ?? venue.name;
  const currentType = type ?? venue.type;
  const currentAddress = address ?? (venue.address ?? "");
  const currentVisitedAt = visitedAt ?? venue.visitedAt;
  const currentRating = rating ?? venue.rating;
  const currentNotes = notes ?? (venue.notes ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName.trim()) return toast.error("お店の名前を入力してください");

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
        id: venueId,
        name: currentName,
        type: currentType as any,
        address: currentAddress || null,
        visitedAt: currentVisitedAt,
        rating: currentRating,
        notes: currentNotes || null,
        ...(imagePath !== undefined ? { imagePath } : {}),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          toast.success("更新しました！");
          navigate({ to: "/venues/$venueId", params: { venueId } });
        },
        onError: () => toast.error("更新に失敗しました"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/venues" className="hover:text-foreground">
          お店記録
        </Link>
        <span>›</span>
        <Link to="/venues/$venueId" params={{ venueId }} className="hover:text-foreground">
          {venue.name}
        </Link>
        <span>›</span>
        <span className="text-foreground">編集</span>
      </div>

      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">お店記録を編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 店名 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="name">
            お店の名前 <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={currentName}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* タイプ */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="type">
            種類
          </label>
          <select
            id="type"
            value={currentType}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {VENUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* 住所 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="address">
            住所・場所（任意）
          </label>
          <input
            id="address"
            type="text"
            value={currentAddress}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 評価 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">評価</label>
          <StarRating value={currentRating} onChange={setRating} size="lg" />
        </div>

        {/* 訪問日 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="visitedAt">
            訪問日
          </label>
          <input
            id="visitedAt"
            type="date"
            value={currentVisitedAt}
            onChange={(e) => setVisitedAt(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* メモ */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="notes">
            メモ・感想
          </label>
          <textarea
            id="notes"
            value={currentNotes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* 画像 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">画像を変更（任意）</label>
          <ImageUpload
            value={venue.imagePath}
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
          <Link
            to="/venues/$venueId"
            params={{ venueId }}
            className="rounded-lg border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
