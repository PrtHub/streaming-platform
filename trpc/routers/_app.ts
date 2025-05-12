import { createTRPCRouter } from "../init";

import { categoriesRouter } from "@/modules/categories/server/procedures";
import { commentReactionRouter } from "@/modules/comment-reactions/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { playlistsRouter } from "@/modules/playlists/server/procedures";
import { searchRouter } from "@/modules/search/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { suggestionsRouter } from "@/modules/suggestions/server/procedures";
import { videoReactionRouter } from "@/modules/video-reactions/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  playlists: playlistsRouter,
});

export type AppRouter = typeof appRouter;
