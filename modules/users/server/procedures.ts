import { db } from "@/db";
import {
  subscriptionTable,
  usersTable,
  videoReactions,
  videosTable,
  videoViews,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      let userId;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerSubscription = db.$with("viewer_subscription").as(
        db
          .select()
          .from(subscriptionTable)
          .where(inArray(subscriptionTable.viewerId, userId ? [userId] : []))
      );

      const [existingUser] = await db
        .with(viewerSubscription)
        .select({
          ...getTableColumns(usersTable),
          viewerSubscribed: isNotNull(viewerSubscription.viewerId).mapWith(
            Boolean
          ),
          subscriberCount: db.$count(
            subscriptionTable,
            eq(subscriptionTable.creatorId, usersTable.id)
          ),
          videosCount: db.$count(
            videosTable,
            eq(videosTable.userId, usersTable.id)
          ),
        })
        .from(usersTable)
        .leftJoin(
          viewerSubscription,
          eq(viewerSubscription.creatorId, usersTable.id)
        )
        .where(eq(usersTable.id, input.id));

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      return existingUser;
    }),
  getManyVideos: baseProcedure
    .input(
      z.object({
        userId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1),
      })
    )
    .query(async ({ input }) => {
      const { userId, cursor, limit } = input;

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
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .where(
          and(
            userId ? eq(videosTable.userId, userId) : undefined,
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
});
