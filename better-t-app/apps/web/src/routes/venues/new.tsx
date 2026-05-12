import { env } from "@better-t-app/env/web";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/venues/new")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) redirect({ to: "/login", throw: true });
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("izakaya");
  const [address, setAddress] = useState("");
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useMutation(orpc.venue.create.mutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("お店の名前を入力してください");

    let imagePath: string | undefined;

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
        if (!res.ok) throw new Error("アップロード失敗");
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

    createMutation.mutate(
      {
        name,
        type: type as any,
        address: address || undefined,
        visitedAt,
        rating,
        notes: notes || undefined,
        imagePath,
      },
      {
        onSuccess: (created) => {
          toast.success("記録しました！");
          navigate({ to: "/venues/$venueId", params: { venueId: created.id } });
        },
        onError: () => toast.error("記録に失敗しました"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">お店を記録する</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 店名 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="name">
            お店の名前 <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 炭火焼 鳥勝"
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* タイプ */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="type">
            種類
          </label>
          <select
            id="type"
            value={type}
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
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="例: 東京都渋谷区道玄坂1-1-1"
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 評価 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">評価</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* 訪問日 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="visitedAt">
            訪問日
          </label>
          <input
            id="visitedAt"
            type="date"
            value={visitedAt}
            onChange={(e) => setVisitedAt(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* メモ */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="notes">
            メモ・感想（任意）
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="雰囲気、おすすめメニュー、また行きたいかなど..."
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* 画像 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">画像（任意）</label>
          <ImageUpload onChange={setImageFile} serverUrl={env.VITE_SERVER_URL} />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || isUploading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createMutation.isPending || isUploading ? "保存中..." : "記録する"}
        </button>
      </form>
    </div>
  );
}
