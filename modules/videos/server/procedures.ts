import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const [video] = await db
      .insert(videosTable)
      .values({
        userId,
        title: "Untitled",
      })
      .returning();

    return {
      video,
    };
  }),
});
