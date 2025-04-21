import { db } from "@/db";
import { commentTable, usersTable } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { and, eq, getTableColumns } from "drizzle-orm";
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
      })
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      const comments = await db
        .select({
          ...getTableColumns(commentTable),
          user: usersTable,
        })
        .from(commentTable)
        .where(eq(commentTable.videoId, videoId))
        .innerJoin(usersTable, eq(commentTable.userId, usersTable.id));

      return comments;
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
