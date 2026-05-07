import { index, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const knowledgeCategory = sqliteTable("knowledge_category", {
  slug: text("slug", {
    enum: ["whiskey", "beer", "wine", "sake", "cocktail", "other"],
  }).primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description").notNull(),
  imageUrl: text("image_url"),
});

export const knowledgeItem = sqliteTable(
  "knowledge_item",
  {
    id: text("id").primaryKey(),
    categorySlug: text("category_slug", {
      enum: ["whiskey", "beer", "wine", "sake", "cocktail", "other"],
    })
      .notNull()
      .references(() => knowledgeCategory.slug, { onDelete: "cascade" }),
    name: text("name").notNull(),
    origin: text("origin"),
    description: text("description").notNull(),
    alcoholPercent: real("alcohol_percent"),
    tastingNotes: text("tasting_notes"),
    servingStyle: text("serving_style"),
    imageUrl: text("image_url"),
  },
  (table) => [index("knowledge_item_categorySlug_idx").on(table.categorySlug)],
);

export type KnowledgeCategory = typeof knowledgeCategory.$inferSelect;
export type KnowledgeItem = typeof knowledgeItem.$inferSelect;
