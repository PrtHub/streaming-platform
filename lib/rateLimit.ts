import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
