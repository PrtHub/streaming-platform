import { db } from "@/db";
import { serve } from "@upstash/workflow/nextjs";
import { NextRequest } from "next/server";
import { videosTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

export const POST = async (request: NextRequest) => {
  const { POST: handler } = serve<InputType>(async (context) => {
    const { userId, videoId } = context.requestPayload;

    const video = await context.run("get-video", async () => {
      const [data] = await db
        .select()
        .from(videosTable)
        .where(
          and(eq(videosTable.id, videoId), eq(videosTable.userId, userId))
        );

      if (!data) {
        throw new Error("Video not found");
      }

      return data;
    });

    await context.run("update-video", async () => {
      await db
        .update(videosTable)
        .set({
          title: "Update Title from workflow",
        })
        .where(
          and(
            eq(videosTable.id, video.id),
            eq(videosTable.userId, video.userId)
          )
        );
    });
  });

  return await handler(request);
};
