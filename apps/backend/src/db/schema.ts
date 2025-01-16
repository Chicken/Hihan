import { relations } from "drizzle-orm";
import { index, int, sqliteTable, text, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

export const embeds = sqliteTable("embeds", {
    id: text()
        .$defaultFn(() => randomUUID())
        .primaryKey(),
    // maybe something here someday
});

export type Embed = typeof embeds.$inferSelect;

export const comments = sqliteTable(
    "comments",
    {
        id: text()
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        embedId: text("embed_id")
            .notNull()
            .references(() => embeds.id),
        inReplyId: text("in_reply_id").references((): AnySQLiteColumn => comments.id),
        timestamp: int().notNull(),
        name: text().notNull(),
        content: text().notNull(),
    },
    (table) => [index("embed_idx").on(table.embedId)]
);

export type Comment = typeof comments.$inferSelect;

export const commentRelations = relations(comments, ({ one, many }) => ({
    replies: many(comments, {
        relationName: "reply",
    }),
    inReply: one(comments, {
        fields: [comments.inReplyId],
        references: [comments.id],
        relationName: "reply",
    }),
}));
