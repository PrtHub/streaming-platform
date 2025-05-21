import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { subscriptionTable, usersTable } from "@/db/schema";

export const subscriptionsRouter = createTRPCRouter({
  getManySubscriptions: protectedProcedure
     .input(
       z.object({
         cursor: z
           .object({
             creatorId: z.string().uuid(),
             updatedAt: z.date(),
           })
           .nullish(),
         limit: z.number().min(1).max(1000000000),
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
           ...getTableColumns(subscriptionTable),
           user: {
            ...getTableColumns(usersTable),
            subscriberCount: db.$count(
              subscriptionTable,
              eq(subscriptionTable.creatorId, usersTable.id)
            ),
           },
         })
         .from(subscriptionTable)
         .innerJoin(usersTable, eq(subscriptionTable.creatorId, usersTable.id))
         .where(
           and(
             cursor
               ? or(
                   lt(subscriptionTable.updatedAt, cursor.updatedAt),
                   and(
                     eq(subscriptionTable.updatedAt, cursor.updatedAt),
                     lt(subscriptionTable.creatorId, cursor.creatorId)
                   )
                 )
               : undefined,
             eq(subscriptionTable.viewerId, userId)
           )
         )
         .orderBy(desc(subscriptionTable.updatedAt))
         .limit(limit + 1);
 
       const hasMore = data.length > limit;
       const items = hasMore ? data.slice(0, -1) : data;
 
       const lastItem = items[items.length - 1];
       const nextCursor = hasMore
         ? { creatorId: lastItem.creatorId, updatedAt: lastItem.updatedAt }
         : null;
 
       return { items, nextCursor };
     }),

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
  //     .from(subscriptionTable)
  //     .innerJoin(
  //       usersTable,
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
