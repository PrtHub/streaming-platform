import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type PlaylistManyOutput =
  inferRouterOutputs<AppRouter>["playlists"]["getMany"];
