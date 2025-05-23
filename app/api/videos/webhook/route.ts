import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videosTable } from "@/db/schema";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { UTApi } from "uploadthing/server";

const WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
  if (!WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 400 });
  }

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");

  if (!muxSignature) {
    return new Response("Missing mux signature", { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    WEBHOOK_SECRET
  );

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        console.error("Webhook received without upload_id:", payload);
        return new Response("Missing upload_id in webhook data", {
          status: 400,
        });
      }

      await db
        .update(videosTable)
        .set({
          muxStatus: data.status,
          muxAssetId: data.id,
        })
        .where(eq(videosTable.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = data.playback_ids?.[0].id;

      if (!data.upload_id) {
        console.error("Webhook received without upload_id:", payload);
        return new Response("Missing upload_id in webhook data", {
          status: 400,
        });
      }

      if (!playbackId) {
        console.error("Webhook received without playback_id:", payload);
        return new Response("Missing playback_id in webhook data", {
          status: 400,
        });
      }

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png`;
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      const utapi = new UTApi();

      const [uploadedThumbnail, uploadedPreview] =
        await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail?.data ?? {};
      const { key: previewKey, ufsUrl: previewUrl } =
        uploadedPreview?.data ?? {};

      const updatePayload = {
        muxStatus: data.status,
        muxAssetId: data.id,
        muxPlaybackId: playbackId,
        thumbnailUrl,
        previewUrl,
        thumbnailKey,
        previewKey,
        duration,
      };

      await db
        .update(videosTable)
        .set(updatePayload)
        .where(eq(videosTable.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];

      if (!data.upload_id) {
        console.error("Webhook received without upload_id:", payload);
        return new Response("Missing upload_id in webhook data", {
          status: 400,
        });
      }

      await db
        .update(videosTable)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videosTable.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

      if (!data.upload_id) {
        console.error("Webhook received without upload_id:", payload);
        return new Response("Missing upload_id in webhook data", {
          status: 400,
        });
      }

      console.log("VIDEO DELETE WEBhook Trigger!");

      const [video] = await db
        .select({
          thumbnailKey: videosTable.thumbnailKey,
          previewKey: videosTable.previewKey,
        })
        .from(videosTable)
        .where(eq(videosTable.muxUploadId, data.upload_id))
        .limit(1);

      if (video) {
        const utapi = new UTApi();
        const filesToDelete: string[] = [];

        if (video.thumbnailKey) filesToDelete.push(video.thumbnailKey);
        if (video.previewKey) filesToDelete.push(video.previewKey);

        if (filesToDelete.length > 0) {
          await utapi.deleteFiles(filesToDelete);
        }
      }

      await db
        .delete(videosTable)
        .where(eq(videosTable.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      const assetId = data.asset_id;

      if (!assetId) {
        console.error("Webhook received without asset_id:", payload);
        return new Response("Missing asset_id in webhook data", {
          status: 400,
        });
      }

      await db
        .update(videosTable)
        .set({
          muxTrackId: data.id,
          muxTrackStatus: data.status,
        })
        .where(eq(videosTable.muxAssetId, assetId));
      break;
    }
  }

  return new Response("Mux Webhook processed", { status: 200 });
};
