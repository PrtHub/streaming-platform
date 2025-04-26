import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createUpdateSchema,
  createSelectSchema,
} from "drizzle-zod";

export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("clerk_id_idx").on(table.clerkId)]
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  videos: many(videosTable),
  videoViews: many(videoViews),
  reactions: many(videoReactions),
  subscriptions: many(subscriptionTable, {
    relationName: "subscriptions_viewer_id_key",
  }),
  subscribers: many(subscriptionTable, {
    relationName: "subscriptions_creator_id_key",
  }),
  comments: many(commentTable),
  commentReactions: many(commentReactions),
}));

export const subscriptionTable = pgTable(
  "subscriptions",
  {
    viewerId: uuid("viewer_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [table.viewerId, table.creatorId],
    }),
  ]
);

export const subscriptionsRelations = relations(
  subscriptionTable,
  ({ one }) => ({
    viewer: one(usersTable, {
      fields: [subscriptionTable.viewerId],
      references: [usersTable.id],
      relationName: "subscriptions_viewer_id_key",
    }),
    creator: one(usersTable, {
      fields: [subscriptionTable.creatorId],
      references: [usersTable.id],
      relationName: "subscriptions_creator_id_key",
    }),
  })
);

export const categoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)]
);

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  videos: many(videosTable),
}));

export const videoVisibility = pgEnum("video_visibility", [
  "public",
  "private",
]);

export const videosTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),
  duration: integer("duration"),
  visibility: videoVisibility("visibility").notNull().default("private"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const videoRelations = relations(videosTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [videosTable.userId],
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [videosTable.categoryId],
    references: [categoriesTable.id],
  }),
  views: many(videoViews),
  reactions: many(videoReactions),
  comments: many(commentTable),
}));

export const insertVideoSchema = createInsertSchema(videosTable);
export const updateVideoSchema = createUpdateSchema(videosTable);
export const selectVideoSchema = createSelectSchema(videosTable);

export const commentTable = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "comments_parent_id_key",
      }).onDelete("cascade"),
    ];
  }
);

export const commentRelation = relations(commentTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [commentTable.userId],
    references: [usersTable.id],
  }),
  video: one(videosTable, {
    fields: [commentTable.videoId],
    references: [videosTable.id],
  }),
  parent: one(commentTable, {
    fields: [commentTable.parentId],
    references: [commentTable.id],
    relationName: "comments_parent_id_key",
  }),
  reactions: many(commentReactions),
  replies: many(commentTable, {
    relationName: "comments_parent_id_key",
  }),
}));

export const insertCommentSchema = createInsertSchema(commentTable);
export const updateCommentSchema = createUpdateSchema(commentTable);
export const selectCommentSchema = createSelectSchema(commentTable);

export const commentReactions = pgTable(
  "comment_reactions",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => commentTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    reactionType: reactionType("reaction_type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "comment_reactions_pk",
      columns: [table.commentId, table.userId],
    }),
  ]
);

export const commentReactionsRelation = relations(
  commentReactions,
  ({ one }) => ({
    comment: one(commentTable, {
      fields: [commentReactions.commentId],
      references: [commentTable.id],
    }),
    user: one(usersTable, {
      fields: [commentReactions.userId],
      references: [usersTable.id],
    }),
  })
);

export const insertCommentReactionSchema = createInsertSchema(commentReactions);
export const updateCommentReactionSchema = createUpdateSchema(commentReactions);
export const selectCommentReactionSchema = createSelectSchema(commentReactions);

export const videoViews = pgTable(
  "video_views",
  {
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "video_views_pk",
      columns: [table.videoId, table.userId],
    }),
  ]
);

export const videoViewsRelation = relations(videoViews, ({ one }) => ({
  video: one(videosTable, {
    fields: [videoViews.videoId],
    references: [videosTable.id],
  }),
  user: one(usersTable, {
    fields: [videoViews.userId],
    references: [usersTable.id],
  }),
}));

export const insertVideoViewSchema = createInsertSchema(videoViews);
export const updateVideoViewSchema = createUpdateSchema(videoViews);
export const selectVideoViewSchema = createSelectSchema(videoViews);

export const videoReactions = pgTable(
  "video_reactions",
  {
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: reactionType("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [table.videoId, table.userId],
    }),
  ]
);

export const videoReactionsRelation = relations(videoReactions, ({ one }) => ({
  video: one(videosTable, {
    fields: [videoReactions.videoId],
    references: [videosTable.id],
  }),
  user: one(usersTable, {
    fields: [videoReactions.userId],
    references: [usersTable.id],
  }),
}));

export const insertVideoReactionSchema = createInsertSchema(videoReactions);
export const updateVideoReactionSchema = createUpdateSchema(videoReactions);
export const selectVideoReactionSchema = createSelectSchema(videoReactions);
