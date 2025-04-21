import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type CommentManyOutput =
  inferRouterOutputs<AppRouter>["comments"]["getMany"];
