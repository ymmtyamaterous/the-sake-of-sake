import { db } from "@better-t-app/db";
import { venue } from "@better-t-app/db/schema/venue";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import z from "zod";
import { protectedProcedure } from "../index";

const venueTypeSchema = z.enum(["izakaya", "bar", "wine_bar", "sake_bar", "beer_bar", "other"]);

export const venueRouter = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        type: venueTypeSchema,
        address: z.string().max(200).optional(),
        visitedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください"),
        rating: z.number().int().min(1).max(5),
        notes: z.string().max(1000).optional(),
        imagePath: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const id = randomUUID();
      const [created] = await db
        .insert(venue)
        .values({
          id,
          userId: context.session.user.id,
          name: input.name,
          type: input.type,
          address: input.address ?? null,
          visitedAt: input.visitedAt,
          rating: input.rating,
          notes: input.notes ?? null,
          imagePath: input.imagePath ?? null,
        })
        .returning();
      return created;
    }),

  list: protectedProcedure
    .input(
      z.object({
        type: venueTypeSchema.optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .handler(async ({ input, context }) => {
      const { type, page, limit } = input;
      const offset = (page - 1) * limit;

      const where = and(
        eq(venue.userId, context.session.user.id),
        type ? eq(venue.type, type) : undefined,
      );

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(venue)
          .where(where)
          .orderBy(desc(venue.visitedAt), desc(venue.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(venue).where(where),
      ]);

      return { items, total, page, limit };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const [record] = await db
        .select()
        .from(venue)
        .where(and(eq(venue.id, input.id), eq(venue.userId, context.session.user.id)));

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
        type: venueTypeSchema.optional(),
        address: z.string().max(200).nullable().optional(),
        visitedAt: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください")
          .optional(),
        rating: z.number().int().min(1).max(5).optional(),
        notes: z.string().max(1000).nullable().optional(),
        imagePath: z.string().nullable().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { id, ...rest } = input;

      const [existing] = await db
        .select({ id: venue.id })
        .from(venue)
        .where(and(eq(venue.id, id), eq(venue.userId, context.session.user.id)));

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
      }

      const updateData = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
      );

      const [updated] = await db
        .update(venue)
        .set(updateData)
        .where(and(eq(venue.id, id), eq(venue.userId, context.session.user.id)))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const [existing] = await db
        .select({ id: venue.id })
        .from(venue)
        .where(and(eq(venue.id, input.id), eq(venue.userId, context.session.user.id)));

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
      }

      await db
        .delete(venue)
        .where(and(eq(venue.id, input.id), eq(venue.userId, context.session.user.id)));

      return { success: true as const };
    }),
};
