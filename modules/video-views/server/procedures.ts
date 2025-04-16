import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { videoViews } from "@/db/schema";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [existingVideoViews] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.videoId, videoId), eq(videoViews.userId, userId))
        );

      if (existingVideoViews) {
        return existingVideoViews;
      }

      const [newVideoViews] = await db
        .insert(videoViews)
        .values({
          videoId,
          userId,
        })
        .returning();

      return newVideoViews;
    }),
});
