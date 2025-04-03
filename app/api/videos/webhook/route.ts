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
} from "@mux/mux-node/resources/webhooks.mjs";

const WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

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
  }

  return new Response("Mux Webhook processed", { status: 200 });
};
