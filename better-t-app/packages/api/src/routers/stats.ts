import { db } from "@better-t-app/db";
import { drinkLog } from "@better-t-app/db/schema/drinkLog";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { protectedProcedure } from "../index";

export const statsRouter = {
  summary: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const [
      [{ totalLogs }],
      [{ logsThisMonth }],
      categoryBreakdown,
      favoriteItems,
    ] = await Promise.all([
      db
        .select({ totalLogs: count() })
        .from(drinkLog)
        .where(eq(drinkLog.userId, userId)),

      db
        .select({ logsThisMonth: count() })
        .from(drinkLog)
        .where(and(eq(drinkLog.userId, userId), gte(drinkLog.drankAt, firstDayOfMonth))),

      db
        .select({ category: drinkLog.category, count: count() })
        .from(drinkLog)
        .where(eq(drinkLog.userId, userId))
        .groupBy(drinkLog.category),

      db
        .select()
        .from(drinkLog)
        .where(and(eq(drinkLog.userId, userId), gte(drinkLog.rating, 4)))
        .orderBy(desc(drinkLog.createdAt))
        .limit(5),
    ]);

    return {
      totalLogs,
      logsThisMonth,
      categoryBreakdown,
      favoriteItems,
    };
  }),
};
