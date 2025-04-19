import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { subscriptionTable } from "@/db/schema";

export const subscriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot subscribe to yourself",
        });
      }

      const [newSubscription] = await db
        .insert(subscriptionTable)
        .values({
          viewerId: ctx.user.id,
          creatorId: userId,
        })
        .returning();

      return newSubscription;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot unsubscribe from yourself",
        });
      }

      const [removedSubscription] = await db
        .delete(subscriptionTable)
        .where(
          and(
            eq(subscriptionTable.viewerId, ctx.user.id),
            eq(subscriptionTable.creatorId, userId)
          )
        )
        .returning();

      return removedSubscription;
    }),
});
