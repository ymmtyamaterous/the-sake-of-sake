import { describe, expect, test } from "bun:test";
import { z } from "zod";

const drinkCategorySchema = z.enum(["whiskey", "beer", "wine", "sake", "cocktail", "other"]);

const createInputSchema = z.object({
  name: z.string().min(1).max(100),
  category: drinkCategorySchema,
  rating: z.number().int().min(1).max(5),
  drankAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください"),
  notes: z.string().max(1000).optional(),
  imagePath: z.string().optional(),
});

describe("drinkLog validation", () => {
  test("正常な入力は検証を通過する", () => {
    const result = createInputSchema.safeParse({
      name: "山崎 12年",
      category: "whiskey",
      rating: 5,
      drankAt: "2025-06-01",
      notes: "スモーキーで深い味わい",
    });
    expect(result.success).toBe(true);
  });

  test("名前が空の場合はエラー", () => {
    const result = createInputSchema.safeParse({
      name: "",
      category: "sake",
      rating: 3,
      drankAt: "2025-06-01",
    });
    expect(result.success).toBe(false);
  });

  test("評価が範囲外の場合はエラー", () => {
    const resultLow = createInputSchema.safeParse({
      name: "テスト酒",
      category: "beer",
      rating: 0,
      drankAt: "2025-06-01",
    });
    expect(resultLow.success).toBe(false);

    const resultHigh = createInputSchema.safeParse({
      name: "テスト酒",
      category: "beer",
      rating: 6,
      drankAt: "2025-06-01",
    });
    expect(resultHigh.success).toBe(false);
  });

  test("日付フォーマットが不正な場合はエラー", () => {
    const result = createInputSchema.safeParse({
      name: "テスト酒",
      category: "wine",
      rating: 3,
      drankAt: "2025/06/01",
    });
    expect(result.success).toBe(false);
  });

  test("不正なカテゴリはエラー", () => {
    const result = createInputSchema.safeParse({
      name: "テスト酒",
      category: "unknown",
      rating: 3,
      drankAt: "2025-06-01",
    });
    expect(result.success).toBe(false);
  });

  test("全カテゴリが有効", () => {
    const categories = ["whiskey", "beer", "wine", "sake", "cocktail", "other"];
    for (const cat of categories) {
      const result = drinkCategorySchema.safeParse(cat);
      expect(result.success).toBe(true);
    }
  });
});

describe("知識ベースのカテゴリスラッグ検証", () => {
  const categorySlugSchema = z.enum(["whiskey", "beer", "wine", "sake", "cocktail", "other"]);

  test("有効なスラッグを受け付ける", () => {
    expect(categorySlugSchema.safeParse("sake").success).toBe(true);
  });

  test("無効なスラッグを拒否する", () => {
    expect(categorySlugSchema.safeParse("spirits").success).toBe(false);
  });
});
