import { z } from "zod";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";

import { db } from "@/db";
import {
  usersTable,
  videoReactions,
  videosTable,
  videoViews,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
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
    .query(async ({ input }) => {
      const { cursor, limit, videoId } = input;

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

      const data = await db
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
        .where(
          and(
            existingVideo.categoryId
              ? eq(videosTable.categoryId, existingVideo.categoryId)
              : undefined,
            cursor
              ? or(
                  lt(videosTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(videosTable.updatedAt, cursor.updatedAt),
                    lt(videosTable.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(usersTable, eq(usersTable.id, videosTable.userId))
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
});
