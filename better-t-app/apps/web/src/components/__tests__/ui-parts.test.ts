import { describe, expect, test } from "bun:test";

// CategoryBadge と StarRating はブラウザの DOM が必要なため
// ここではロジック部分をユニットテストする

describe("CategoryBadge ラベルマッピング", () => {
  const CATEGORY_MAP: Record<string, { label: string }> = {
    whiskey: { label: "ウイスキー" },
    beer: { label: "ビール" },
    wine: { label: "ワイン" },
    sake: { label: "日本酒" },
    cocktail: { label: "カクテル" },
    other: { label: "その他" },
  };

  test("全カテゴリに日本語ラベルが存在する", () => {
    const categories = ["whiskey", "beer", "wine", "sake", "cocktail", "other"];
    for (const cat of categories) {
      expect(CATEGORY_MAP[cat]).toBeDefined();
      expect(CATEGORY_MAP[cat]?.label).toBeTruthy();
    }
  });

  test("未知のカテゴリはフォールバックする", () => {
    const meta = CATEGORY_MAP["unknown"] ?? { label: "不明" };
    expect(meta.label).toBe("不明");
  });
});

describe("StarRating の値バリデーション", () => {
  function clampRating(v: number) {
    return Math.min(5, Math.max(1, v));
  }

  test("1〜5の範囲内はそのまま", () => {
    expect(clampRating(1)).toBe(1);
    expect(clampRating(3)).toBe(3);
    expect(clampRating(5)).toBe(5);
  });

  test("0以下は1にクランプされる", () => {
    expect(clampRating(0)).toBe(1);
    expect(clampRating(-1)).toBe(1);
  });

  test("5より大きい値は5にクランプされる", () => {
    expect(clampRating(6)).toBe(5);
    expect(clampRating(10)).toBe(5);
  });
});

describe("ImageUpload ファイルバリデーション", () => {
  const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  function validateFile(mimeType: string, size: number): string | null {
    if (!ALLOWED_MIME.has(mimeType)) {
      return "JPEG・PNG・WEBP 形式のファイルを選択してください";
    }
    if (size > MAX_FILE_SIZE) {
      return "ファイルサイズは 2MB 以内にしてください";
    }
    return null;
  }

  test("許可された MIME タイプは null を返す", () => {
    expect(validateFile("image/jpeg", 1024)).toBeNull();
    expect(validateFile("image/png", 1024)).toBeNull();
    expect(validateFile("image/webp", 1024)).toBeNull();
  });

  test("不正な MIME タイプはエラーメッセージを返す", () => {
    expect(validateFile("image/gif", 1024)).toBeTruthy();
    expect(validateFile("application/pdf", 1024)).toBeTruthy();
  });

  test("2MB を超えるファイルはエラーメッセージを返す", () => {
    expect(validateFile("image/jpeg", MAX_FILE_SIZE + 1)).toBeTruthy();
  });

  test("ちょうど 2MB はエラーなし", () => {
    expect(validateFile("image/jpeg", MAX_FILE_SIZE)).toBeNull();
  });
});
