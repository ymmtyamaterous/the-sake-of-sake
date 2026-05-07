import { useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@better-t-app/ui/lib/utils";

type ImageUploadProps = {
  value?: string | null;
  onChange?: (file: File | null) => void;
  serverUrl?: string;
  className?: string;
};

export function ImageUpload({ value, onChange, serverUrl, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    value ? (value.startsWith("uploads/") ? `${serverUrl}/${value}` : value) : null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPEG・PNG・WEBP 形式のファイルを選択してください");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("ファイルサイズは 2MB 以内にしてください");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-container transition-colors hover:bg-surface-container-high",
          preview ? "h-48" : "h-36",
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="プレビュー" className="h-full w-full rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              aria-label="画像を削除"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-50" />
            <span className="text-sm">クリックまたはドラッグで画像をアップロード</span>
            <span className="text-xs opacity-60">JPEG・PNG・WEBP / 最大 2MB</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
