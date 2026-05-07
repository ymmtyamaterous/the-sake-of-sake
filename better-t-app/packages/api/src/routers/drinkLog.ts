import { db } from "@better-t-app/db";
import { drinkLog } from "@better-t-app/db/schema/drinkLog";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import z from "zod";
import { protectedProcedure } from "../index";

const drinkCategorySchema = z.enum(["whiskey", "beer", "wine", "sake", "cocktail", "other"]);

export const drinkLogRouter = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        category: drinkCategorySchema,
        rating: z.number().int().min(1).max(5),
        drankAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください"),
        notes: z.string().max(1000).optional(),
        imagePath: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const id = randomUUID();
      const [created] = await db
        .insert(drinkLog)
        .values({
          id,
          userId: context.session.user.id,
          name: input.name,
          category: input.category,
          rating: input.rating,
          drankAt: input.drankAt,
          notes: input.notes ?? null,
          imagePath: input.imagePath ?? null,
        })
        .returning();
      return created;
    }),

  list: protectedProcedure
    .input(
      z.object({
        category: drinkCategorySchema.optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .handler(async ({ input, context }) => {
      const { category, page, limit } = input;
      const offset = (page - 1) * limit;

      const where = and(
        eq(drinkLog.userId, context.session.user.id),
        category ? eq(drinkLog.category, category) : undefined,
      );

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(drinkLog)
          .where(where)
          .orderBy(desc(drinkLog.drankAt), desc(drinkLog.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ total: count() })
          .from(drinkLog)
          .where(where),
      ]);

      return { items, total, page, limit };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const [record] = await db
        .select()
        .from(drinkLog)
        .where(and(eq(drinkLog.id, input.id), eq(drinkLog.userId, context.session.user.id)));

      if (!record) {
        throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
      }
      return record;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        category: drinkCategorySchema.optional(),
        rating: z.number().int().min(1).max(5).optional(),
        drankAt: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください")
          .optional(),
        notes: z.string().max(1000).nullable().optional(),
        imagePath: z.string().nullable().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { id, ...rest } = input;

      const [existing] = await db
        .select({ id: drinkLog.id })
        .from(drinkLog)
        .where(and(eq(drinkLog.id, id), eq(drinkLog.userId, context.session.user.id)));

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
      }

      const updateData = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
      );

      const [updated] = await db
        .update(drinkLog)
        .set(updateData)
        .where(and(eq(drinkLog.id, id), eq(drinkLog.userId, context.session.user.id)))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const [existing] = await db
        .select({ id: drinkLog.id })
        .from(drinkLog)
        .where(and(eq(drinkLog.id, input.id), eq(drinkLog.userId, context.session.user.id)));

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
      }

      await db
        .delete(drinkLog)
        .where(and(eq(drinkLog.id, input.id), eq(drinkLog.userId, context.session.user.id)));

      return { success: true as const };
    }),
};
