import { env } from "@better-t-app/env/web";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

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

const searchSchema = z.object({
  name: z.string().optional().catch(undefined),
  category: z
    .enum(["whiskey", "beer", "wine", "sake", "cocktail", "other"])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/logs/new")({
  component: RouteComponent,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) redirect({ to: "/login", throw: true });
  },
});

function RouteComponent() {
  const { name: initialName, category: initialCategory } = Route.useSearch();
  const navigate = useNavigate();

  const [name, setName] = useState(initialName ?? "");
  const [category, setCategory] = useState<string>(initialCategory ?? "sake");
  const [rating, setRating] = useState(3);
  const [drankAt, setDrankAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useMutation(orpc.drinkLog.create.mutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("お酒の名前を入力してください");

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
      { name, category: category as any, rating, drankAt, notes: notes || undefined, imagePath },
      {
        onSuccess: (created) => {
          toast.success("記録しました！");
          navigate({ to: "/logs/$logId", params: { logId: created.id } });
        },
        onError: () => toast.error("記録に失敗しました"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">新しく記録する</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 名前 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="name">
            お酒の名前 <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 山崎 12年"
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* カテゴリ */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="category">
            カテゴリ
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* 評価 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">評価</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* 飲んだ日 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="drankAt">
            飲んだ日
          </label>
          <input
            id="drankAt"
            type="date"
            value={drankAt}
            onChange={(e) => setDrankAt(e.target.value)}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="香り、味わい、飲んだ場所など..."
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
