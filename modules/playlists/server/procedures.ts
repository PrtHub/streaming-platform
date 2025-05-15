import { z } from "zod";
import { db } from "@/db";
import {
  playlistsTable,
  playlistVideos,
  usersTable,
  videoReactions,
  videosTable,
  videoViews,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";

export const playlistsRouter = createTRPCRouter({
  removePlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { playlistId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [deletedPlaylist] = await db
        .delete(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId)
          )
        )
        .returning();

      if (!deletedPlaylist) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to remove playlist",
        });
      }

      return deletedPlaylist;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { playlistId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      return existingPlaylist;
    }),
  getPlaylistVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit, playlistId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const videosFromPlaylist = db.$with("videos_from_playlist").as(
        db
          .select({
            videoId: playlistVideos.videoId,
          })
          .from(playlistVideos)
          .where(eq(playlistVideos.playlistId, playlistId))
      );

      const data = await db
        .with(videosFromPlaylist)
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
          viewsCount: db.$count(
            videoViews,
            eq(videoViews.videoId, videosTable.id)
          ),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .innerJoin(
          videosFromPlaylist,
          eq(videosFromPlaylist.videoId, videosTable.id)
        )
        .where(
          and(
            cursor
              ? or(
                  lt(videosTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(videosTable.updatedAt, cursor.updatedAt),
                    lt(videosTable.id, cursor.id)
                  )
                )
              : undefined,
            eq(videosTable.visibility, "public")
          )
        )
        .orderBy(desc(videosTable.updatedAt), desc(videosTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  removeVideoToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(eq(videosTable.id, videoId))
        .limit(1);

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .limit(1);

      if (!existingPlaylistVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found in playlist",
        });
      }

      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      if (!deletedPlaylistVideo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to remove video from playlist",
        });
      }

      return deletedPlaylistVideo;
    }),
  addVideoToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(eq(videosTable.id, videoId))
        .limit(1);

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .limit(1);

      if (existingPlaylistVideo) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Video already exists in playlist",
        });
      }

      const [createdPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();

      if (!createdPlaylistVideo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to add video to playlist",
        });
      }

      return createdPlaylistVideo;
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit, videoId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      if (!videoId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video ID is required",
        });
      }

      const data = await db
        .select({
          ...getTableColumns(playlistsTable),
          user: usersTable,
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlistsTable.id)
          ),
          containsVideo: videoId
            ? sql<boolean>`(
              SELECT EXISTS (
              SELECT 1 FROM ${playlistVideos} pv 
              WHERE pv.playlist_id = ${playlistsTable.id} 
              AND pv.video_id = ${videoId})
              )`
            : sql<boolean>`false`,
        })
        .from(playlistsTable)
        .innerJoin(usersTable, eq(playlistsTable.userId, usersTable.id))
        .where(
          and(
            eq(playlistsTable.userId, userId),
            cursor
              ? or(
                  lt(playlistsTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlistsTable.updatedAt, cursor.updatedAt),
                    lt(playlistsTable.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlistsTable.updatedAt), desc(playlistsTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const data = await db
        .select({
          ...getTableColumns(playlistsTable),
          user: usersTable,
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlistsTable.id)
          ),
          thumbnailUrl: sql<string | null>`(
            SELECT v.thumbnail_url 
            FROM ${videosTable} as v
            JOIN ${playlistVideos} as pv ON pv.video_id = v.id
            WHERE pv.playlist_id = ${playlistsTable.id}
            ORDER BY pv.updated_at DESC
            LIMIT 1
          )`,
        })
        .from(playlistsTable)
        .innerJoin(usersTable, eq(playlistsTable.userId, usersTable.id))
        .where(
          and(
            eq(playlistsTable.userId, userId),
            cursor
              ? or(
                  lt(playlistsTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlistsTable.updatedAt, cursor.updatedAt),
                    lt(playlistsTable.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlistsTable.updatedAt), desc(playlistsTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(1000).nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { name, description } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const [createdPlaylist] = await db
        .insert(playlistsTable)
        .values({
          userId,
          name,
          description,
        })
        .returning();

      if (!createdPlaylist) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create playlist",
        });
      }

      return createdPlaylist;
    }),
  getManyHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );

      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
          viewedAt: viewerVideoViews.viewedAt,
          viewsCount: db.$count(
            videoViews,
            eq(videoViews.videoId, videosTable.id)
          ),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .innerJoin(
          viewerVideoViews,
          eq(viewerVideoViews.videoId, videosTable.id)
        )
        .where(
          and(
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videosTable.id, cursor.id)
                  )
                )
              : undefined,
            eq(videosTable.visibility, "public")
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videosTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewedAt: lastItem.viewedAt }
        : null;

      return { items, nextCursor };
    }),
  getManyLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const viewerVideoReactions = db.$with("viewer_video_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            likedAt: videoReactions.updatedAt,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, "like")
            )
          )
      );

      const data = await db
        .with(viewerVideoReactions)
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
          likedAt: viewerVideoReactions.likedAt,
          viewsCount: db.$count(
            videoViews,
            eq(videoViews.videoId, videosTable.id)
          ),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .innerJoin(
          viewerVideoReactions,
          eq(viewerVideoReactions.videoId, videosTable.id)
        )
        .where(
          and(
            cursor
              ? or(
                  lt(viewerVideoReactions.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReactions.likedAt, cursor.likedAt),
                    lt(videosTable.id, cursor.id)
                  )
                )
              : undefined,
            eq(videosTable.visibility, "public")
          )
        )
        .orderBy(desc(viewerVideoReactions.likedAt), desc(videosTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, likedAt: lastItem.likedAt }
        : null;

      return { items, nextCursor };
    }),
});
