import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const venue = sqliteTable(
  "venue",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", {
      enum: ["izakaya", "bar", "wine_bar", "sake_bar", "beer_bar", "other"],
    }).notNull(),
    address: text("address"),
    visitedAt: text("visited_at").notNull(),
    rating: integer("rating").notNull(),
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
    index("venue_userId_idx").on(table.userId),
    index("venue_type_idx").on(table.type),
    index("venue_visitedAt_idx").on(table.visitedAt),
    check("venue_rating_check", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

export type Venue = typeof venue.$inferSelect;
export type NewVenue = typeof venue.$inferInsert;
export type VenueType = Venue["type"];
