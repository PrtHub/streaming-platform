import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { subscriptionTable, usersTable } from "@/db/schema";

export const subscriptionsRouter = createTRPCRouter({
  // getManySubscribedCreators: protectedProcedure.query(async ({ ctx }) => {
  //   const { id: userId } = ctx.user;

  //   if (!userId) {
  //     throw new TRPCError({
  //       code: "UNAUTHORIZED",
  //       message: "User not authenticated",
  //     });
  //   }

  //   const subscribedCreators = await db
  //     .select({
  //       ...getTableColumns(usersTable),
  //       subscribedAt: subscriptionTable.createdAt,
  //       subscriberCount: db.$count(
  //         subscriptionTable,
  //         eq(subscriptionTable.creatorId, usersTable.id)
  //       ),
  //     })
  //     .from(usersTable)
  //     .innerJoin(
  //       subscriptionTable,
  //       and(
  //         eq(subscriptionTable.creatorId, usersTable.id),
  //         eq(subscriptionTable.viewerId, userId)
  //       )
  //     )
  //     .orderBy(desc(subscriptionTable.createdAt));

  //   return subscribedCreators;
  // }),
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
