import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const drinkLog = sqliteTable(
  "drink_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category", {
      enum: ["whiskey", "beer", "wine", "sake", "cocktail", "other"],
    }).notNull(),
    rating: integer("rating").notNull(),
    drankAt: text("drank_at").notNull(),
    notes: text("notes"),
    imagePath: text("image_path"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("drink_log_userId_idx").on(table.userId),
    index("drink_log_category_idx").on(table.category),
    index("drink_log_drankAt_idx").on(table.drankAt),
    check("drink_log_rating_check", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

export type DrinkLog = typeof drinkLog.$inferSelect;
export type NewDrinkLog = typeof drinkLog.$inferInsert;
export type DrinkCategory = DrinkLog["category"];
