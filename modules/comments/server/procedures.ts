import { db } from "@/db";
import { commentTable, usersTable } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
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
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const comments = await db
        .select({
          ...getTableColumns(commentTable),
          user: usersTable,
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
        .orderBy(desc(commentTable.updatedAt), desc(commentTable.id))
        .limit(limit + 1);

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
