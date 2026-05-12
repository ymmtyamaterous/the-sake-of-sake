import { describe, expect, test } from "bun:test";
import { z } from "zod";

const venueTypeSchema = z.enum(["izakaya", "bar", "wine_bar", "sake_bar", "beer_bar", "other"]);

const createInputSchema = z.object({
  name: z.string().min(1).max(100),
  type: venueTypeSchema,
  address: z.string().max(200).optional(),
  visitedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください"),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
  imagePath: z.string().optional(),
});

describe("venue validation", () => {
  test("正常な入力は検証を通過する", () => {
    const result = createInputSchema.safeParse({
      name: "炭火焼 鳥勝",
      type: "izakaya",
      address: "東京都渋谷区道玄坂1-1-1",
      visitedAt: "2025-06-01",
      rating: 5,
      notes: "雰囲気が良く、焼き鳥が絶品でした",
    });
    expect(result.success).toBe(true);
  });

  test("住所・メモなしでも通過する", () => {
    const result = createInputSchema.safeParse({
      name: "BAR NEGRONI",
      type: "bar",
      visitedAt: "2025-06-01",
      rating: 4,
    });
    expect(result.success).toBe(true);
  });

  test("名前が空の場合はエラー", () => {
    const result = createInputSchema.safeParse({
      name: "",
      type: "bar",
      visitedAt: "2025-06-01",
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  test("評価が範囲外の場合はエラー", () => {
    const resultLow = createInputSchema.safeParse({
      name: "テスト店",
      type: "izakaya",
      visitedAt: "2025-06-01",
      rating: 0,
    });
    expect(resultLow.success).toBe(false);

    const resultHigh = createInputSchema.safeParse({
      name: "テスト店",
      type: "izakaya",
      visitedAt: "2025-06-01",
      rating: 6,
    });
    expect(resultHigh.success).toBe(false);
  });

  test("日付フォーマットが不正な場合はエラー", () => {
    const result = createInputSchema.safeParse({
      name: "テスト店",
      type: "bar",
      visitedAt: "2025/06/01",
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  test("不正なタイプはエラー", () => {
    const result = createInputSchema.safeParse({
      name: "テスト店",
      type: "pub",
      visitedAt: "2025-06-01",
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  test("全タイプが有効", () => {
    const types = ["izakaya", "bar", "wine_bar", "sake_bar", "beer_bar", "other"];
    for (const t of types) {
      const result = venueTypeSchema.safeParse(t);
      expect(result.success).toBe(true);
    }
  });

  test("住所が200文字を超えるとエラー", () => {
    const result = createInputSchema.safeParse({
      name: "テスト店",
      type: "izakaya",
      address: "あ".repeat(201),
      visitedAt: "2025-06-01",
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  test("メモが1000文字を超えるとエラー", () => {
    const result = createInputSchema.safeParse({
      name: "テスト店",
      type: "izakaya",
      visitedAt: "2025-06-01",
      rating: 3,
      notes: "あ".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
