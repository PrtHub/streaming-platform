import { db } from "@/db";
import {
  subscriptionTable,
  updateVideoSchema,
  usersTable,
  videoReactions,
  videosTable,
  videoViews,
} from "@/db/schema";
import { geminiAI } from "@/lib/gemini";
import { mux } from "@/lib/mux";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or,
} from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(),
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
      const { categoryId, cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
          viewsCount: db.$count(
            videoViews,
            eq(videoViews.videoId, videosTable.id)
          ),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .where(
          and(
            categoryId ? eq(videosTable.categoryId, categoryId) : undefined,
            cursor
              ? or(
                  lt(videosTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(videosTable.updatedAt, cursor.updatedAt),
                    lt(videosTable.id, cursor.id)
                  )
                )
              : undefined,
            eq(videosTable.visibility, "public")
          )
        )
        .orderBy(desc(videosTable.updatedAt), desc(videosTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
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
            type: videoReactions.type,
            videoId: videoReactions.videoId,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      const viewerSubscription = db.$with("viewer_subscription").as(
        db
          .select()
          .from(subscriptionTable)
          .where(inArray(subscriptionTable.viewerId, userId ? [userId] : []))
      );

      const [existingVideo] = await db
        .with(viewerReaction, viewerSubscription)
        .select({
          ...getTableColumns(videosTable),
          user: {
            ...getTableColumns(usersTable),
            subscriberCount: db.$count(
              subscriptionTable,
              eq(subscriptionTable.creatorId, usersTable.id)
            ),
            viewerSubscribed: isNotNull(viewerSubscription.creatorId).mapWith(
              Boolean
            ),
          },
          viewsCount: db.$count(
            videoViews,
            eq(videoViews.videoId, videosTable.id)
          ),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videosTable.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          viewerReaction: viewerReaction.type,
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .leftJoin(viewerReaction, eq(viewerReaction.videoId, videosTable.id))
        .leftJoin(
          viewerSubscription,
          eq(viewerSubscription.creatorId, usersTable.id)
        )
        .where(eq(videosTable.id, id));
      // .groupBy(videosTable.id, usersTable.id, viewerReaction.type);

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return existingVideo;
    }),
  generateAiThumbnail: protectedProcedure
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
        .select()
        .from(videosTable)
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .limit(1);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      if (!video.muxPlaybackId || !video.muxTrackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video playback ID or track ID not found",
        });
      }

      const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
      const response = await fetch(trackUrl);
      const text = await response.text();

      if (!text) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video text not found",
        });
      }

      // if (video.thumbnailUrl) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message:
      //       "AI thumbnail already generated for this video (limit 1 per video)",
      //   });
      // }

      const geminiResponse = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: `You are a professional YouTube thumbnail designer. Create a high-quality, eye-catching thumbnail image based on the following video transcript: 

"${text.substring(0, 2000)}"

Requirements:
- Create a visually striking, professional-looking thumbnail image
- The image should clearly represent the main topic of the video
- Use vibrant colors and clear composition
- Make it attention-grabbing but not clickbait-style
- Include key visual elements that represent the video content
- Make it appealing to the likely target audience
- Do not include any text on the thumbnail
- Use a 16:9 aspect ratio

I need ONLY the image, no explanations or text responses.`,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      let imageData = null;

      if (geminiResponse?.candidates?.[0]?.content?.parts) {
        for (const part of geminiResponse.candidates[0].content.parts) {
          if (part.inlineData?.mimeType?.startsWith("image/")) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }

      if (!imageData) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate thumbnail image",
        });
      }

      const utapi = new UTApi();

      if (video.thumbnailKey) {
        await utapi.deleteFiles(video.thumbnailKey);
        await db
          .update(videosTable)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(
            and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
          );
      }

      const dataUrl = `data:image/png;base64,${imageData}`;

      const uploadResponse = await utapi.uploadFilesFromUrl(dataUrl);

      if (!uploadResponse || !Array.isArray(uploadResponse)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload thumbnail: Invalid response format",
        });
      }

      const fileData = uploadResponse[0];

      if (!fileData || !fileData.key || !fileData.ufsUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload thumbnail: Missing file data",
        });
      }

      const thumbnailKey = fileData.key;
      const thumbnailUrl = fileData.ufsUrl;

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

      if (!updatedVideo) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update video with generated thumbnail",
        });
      }

      return thumbnailUrl;
    }),
  generateAiDescription: protectedProcedure
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
        .select()
        .from(videosTable)
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .limit(1);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Check for description generation limits - max 2 times
      const descMatch = video.description
        ? video.description.match(/\[AI:(\d+)\]$/)
        : null;
      const aiGenerationCount = descMatch ? parseInt(descMatch[1]) : 0;

      if (aiGenerationCount >= 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI description generation limit reached (max 2 per video)",
        });
      }

      if (!video.muxPlaybackId || !video.muxTrackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video playback ID or track ID not found",
        });
      }

      const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
      const response = await fetch(trackUrl);
      const text = await response.text();

      if (!text) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video text not found",
        });
      }

      const geminiResponse = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Transcript of the video: "${text.substring(0, 5000)}"
Generate a description for this video:`,
        config: {
          systemInstruction: `You are a YouTube description expert tasked with creating ONE perfect description for a video based on its transcript.

Requirements:
- Create ONLY ONE engaging, well-structured description
- The description should accurately reflect the content of the video
- Keep it between 100-250 words
- Include relevant keywords and phrases naturally
- Format with paragraphs for readability
- Add 3-5 relevant hashtags at the end
- Do NOT provide multiple options or explanations
- IMPORTANT: NEVER REPEAT PREVIOUSLY GENERATED DESCRIPTIONS. Create something completely different from any previous generation.
- Try a different writing style, tone, or perspective than what might have been used before
- Focus on different aspects of the video than previous generations might have highlighted
- This is generation #${
            aiGenerationCount + 1
          } - make it distinct from previous descriptions

Return only the description, no introductions or explanations.`,
        },
      });

      let generatedDescription =
        geminiResponse.text?.trim() || "AI Generated Description";

      const newGenerationCount = aiGenerationCount + 1;
      generatedDescription = generatedDescription.replace(/\s*\[AI:\d+\]$/, "");
      generatedDescription = `${generatedDescription} [AI:${newGenerationCount}]`;

      const [updatedVideo] = await db
        .update(videosTable)
        .set({
          description: generatedDescription,
          updatedAt: new Date(),
        })
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update video with generated description",
        });
      }

      return generatedDescription;
    }),
  generateAiTitle: protectedProcedure
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
        .select()
        .from(videosTable)
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .limit(1);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const titleMatch = video.title.match(/\[AI:(\d+)\]$/);
      const aiGenerationCount = titleMatch ? parseInt(titleMatch[1]) : 0;

      if (aiGenerationCount >= 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI title generation limit reached (max 2 per video)",
        });
      }

      if (!video.muxPlaybackId || !video.muxTrackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video playback ID or track ID not found",
        });
      }

      const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
      const response = await fetch(trackUrl);
      const text = await response.text();

      if (!text) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video text not found",
        });
      }

      const geminiResponse = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Transcript of the video: "${text.substring(0, 5000)}"
Generate a title for this video:`,
        config: {
          systemInstruction: `You are a YouTube title expert tasked with creating ONE perfect title for a video based on its transcript.

Requirements:
- Create ONLY ONE compelling, attention-grabbing title
- The title should accurately reflect the main topic of the video
- Keep it under 60 characters if possible
- Make it engaging and click-worthy without being clickbait
- Do NOT provide multiple options or explanations
- Return ONLY the title text, nothing else
- IMPORTANT: NEVER REPEAT A PREVIOUSLY GENERATED TITLE. Create something completely different.
- Try a different approach, perspective, or framing than any previous title
- Be creative with different title formats (question, statement, how-to, etc.)
- This is generation #${
            aiGenerationCount + 1
          } - it must be unique and distinct from any previous title

Return only the title, no introductions or explanations.`,
          temperature: 0.7,
          maxOutputTokens: 100,
        },
      });

      let generatedTitle = geminiResponse.text?.trim() || "AI Generated Title";

      const newGenerationCount = aiGenerationCount + 1;
      generatedTitle = generatedTitle.replace(/\s*\[AI:\d+\]$/, "");
      generatedTitle = `${generatedTitle} [AI:${newGenerationCount}]`;

      const [updatedVideo] = await db
        .update(videosTable)
        .set({
          title: generatedTitle,
          updatedAt: new Date(),
        })
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update video with generated title",
        });
      }

      return generatedTitle;
    }),
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
        .select({
          thumbnailKey: videosTable.thumbnailKey,
          previewKey: videosTable.previewKey,
          muxAssetId: videosTable.muxAssetId,
        })
        .from(videosTable)
        .where(
          and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
        )
        .limit(1);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const utapi = new UTApi();
      const filesToDelete: string[] = [];

      if (video.thumbnailKey) filesToDelete.push(video.thumbnailKey);
      if (video.previewKey) filesToDelete.push(video.previewKey);

      if (filesToDelete.length > 0) {
        try {
          console.log("Deleting files:", filesToDelete);
          await utapi.deleteFiles(filesToDelete);
        } catch (err) {
          console.error("Failed to delete files (continuing anyway):", err);
        }
      }

      if (video.muxAssetId) {
        try {
          console.log("Deleting mux asset:", video.muxAssetId);
          await mux.video.assets.delete(video.muxAssetId);
        } catch (err: unknown) {
          console.error("Failed to delete mux asset (continuing anyway):", err);
        }
      }

      try {
        await db
          .delete(videosTable)
          .where(
            and(eq(videosTable.id, input.id), eq(videosTable.userId, userId))
          );
      } catch (err) {
        console.error("Failed to delete video from DB:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete video from DB",
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
  revalidate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
        .limit(1);

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      if (!existingVideo.muxUploadId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video upload ID not found",
        });
      }

      const directUpload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      );

      if (!directUpload || !directUpload.asset_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video upload not found",
        });
      }

      const asset = await mux.video.assets.retrieve(directUpload.asset_id);

      if (!asset) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video asset not found",
        });
      }

      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      const [updatedVideo] = await db
        .update(videosTable)
        .set({
          muxAssetId: asset.id,
          muxStatus: asset.status,
          muxPlaybackId: asset?.playback_ids?.[0].id,
          muxTrackId: asset?.tracks?.[0].id,
          muxTrackStatus: asset?.tracks?.[0].status,
          duration,
          updatedAt: new Date(),
        })
        .where(and(eq(videosTable.id, videoId), eq(videosTable.userId, userId)))
        .returning();

      return updatedVideo;
    }),
});
