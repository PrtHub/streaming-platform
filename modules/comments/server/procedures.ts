import { db } from "@/db";
import { commentReactions, commentTable, usersTable } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId, content } = input;

      const [newComment] = await db
        .insert(commentTable)
        .values({
          videoId,
          userId,
          content,
        })
        .returning();

      return newComment;
    }),
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
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit } = input;
      const { clerkUserId } = ctx;

      let userId;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReaction = db.$with("viewer_reaction").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.reactionType,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const [comments, [{ count: totalCount } = { count: 0 }]] =
        await Promise.all([
          db
            .with(viewerReaction)
            .select({
              ...getTableColumns(commentTable),
              user: usersTable,
              viewerReaction: viewerReaction.type,
              likeCount: db.$count(
                commentReactions,
                and(
                  eq(commentReactions.commentId, commentTable.id),
                  eq(commentReactions.reactionType, "like")
                )
              ),
              dislikeCount: db.$count(
                commentReactions,
                and(
                  eq(commentReactions.commentId, commentTable.id),
                  eq(commentReactions.reactionType, "dislike")
                )
              ),
            })
            .from(commentTable)
            .where(
              and(
                eq(commentTable.videoId, videoId),
                cursor
                  ? or(
                      lt(commentTable.updatedAt, cursor.updatedAt),
                      and(
                        eq(commentTable.updatedAt, cursor.updatedAt),
                        lt(commentTable.id, cursor.id)
                      )
                    )
                  : undefined
              )
            )
            .innerJoin(usersTable, eq(commentTable.userId, usersTable.id))
            .leftJoin(
              viewerReaction,
              eq(viewerReaction.commentId, commentTable.id)
            )
            .orderBy(desc(commentTable.updatedAt), desc(commentTable.id))
            .limit(limit + 1),

          db
            .select({ count: count() })
            .from(commentTable)
            .where(eq(commentTable.videoId, videoId)),
        ]);

      const hasMore = comments.length > limit;

      const items = hasMore ? comments.slice(0, -1) : comments;

      const lastItem = items[items.length - 1];

      const newCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor: newCursor,
        totalCount,
      };
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const [deletedComment] = await db
        .delete(commentTable)
        .where(and(eq(commentTable.id, id), eq(commentTable.userId, userId)))
        .returning();

      return deletedComment;
    }),
});
