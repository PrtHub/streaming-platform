import { db } from "@/db";
import { updateVideoSchema, videosTable } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid video ID",
        });
      }

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .limit(1);

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const utapi = new UTApi();

      if (existingVideo.thumbnailKey) {
        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videosTable)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(
            and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
          );
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video playback ID not found",
        });
      }

      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.png`;

      const uploadedThumbnail = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail?.data ?? {};

      const [updatedVideo] = await db
        .update(videosTable)
        .set({
          thumbnailUrl,
          thumbnailKey,
          updatedAt: new Date(),
        })
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .returning();

      return updatedVideo;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid video ID",
        });
      }

      const [video] = await db
        .delete(videosTable)
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),
  update: protectedProcedure
    .input(updateVideoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid video ID",
        });
      }

      const [video] = await db
        .update(videosTable)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input?.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(
          and(eq(videosTable.id, input?.id), eq(videosTable.userId, userId))
        )
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policies: ["public"],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },

      cors_origin: "*",
    });

    const [video] = await db
      .insert(videosTable)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return {
      video,
      url: upload.url,
    };
  }),
});
