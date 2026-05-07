import { db } from "@better-t-app/db";
import { knowledgeCategory, knowledgeItem } from "@better-t-app/db/schema/knowledge";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../index";

const drinkCategorySchema = z.enum(["whiskey", "beer", "wine", "sake", "cocktail", "other"]);

export const knowledgeRouter = {
  listCategories: publicProcedure.handler(async () => {
    return db.select().from(knowledgeCategory);
  }),

  getCategory: publicProcedure
    .input(z.object({ slug: drinkCategorySchema }))
    .handler(async ({ input }) => {
      const [category] = await db
        .select()
        .from(knowledgeCategory)
        .where(eq(knowledgeCategory.slug, input.slug));

      if (!category) {
        throw new ORPCError("NOT_FOUND", { message: "カテゴリが見つかりません" });
      }

      const items = await db
        .select({
          id: knowledgeItem.id,
          name: knowledgeItem.name,
          origin: knowledgeItem.origin,
          description: knowledgeItem.description,
          alcoholPercent: knowledgeItem.alcoholPercent,
          imageUrl: knowledgeItem.imageUrl,
        })
        .from(knowledgeItem)
        .where(eq(knowledgeItem.categorySlug, input.slug));

      return { category, items };
    }),

  getItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const [item] = await db
        .select()
        .from(knowledgeItem)
        .where(eq(knowledgeItem.id, input.id));

      if (!item) {
        throw new ORPCError("NOT_FOUND", { message: "銘柄が見つかりません" });
      }

      return item;
    }),
};
