import { db } from "@/db";
import { subscriptionTable, usersTable, videosTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
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
});
