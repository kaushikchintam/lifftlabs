import { Ratelimit } from "@upstash/ratelimit"; // npm i @upstash/ratelimit @upstash/redis
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

/**
 * SC-01 — rate limiting. Key by user id when authenticated, IP otherwise.
 * Webhook routes (/api/webhooks/*) and cron routes are NEVER rate limited —
 * throttling Google's burst pings or Stripe retries breaks our own systems;
 * they authenticate by signature/secret instead.
 *
 * Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (free tier is ample).
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** Auth endpoints: tight — credential stuffing / OTP abuse target. */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:auth",
});

/** Booking: generous for humans, hostile to scripts holding slots. */
export const bookingLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:booking",
});

/** Messages: chatty humans are fine; floods are not. */
export const messageLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:messages",
});

/** Public forms (mentor apply): slow drip. */
export const publicFormLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rl:public",
});

export function rateLimitKey(
  request: NextRequest,
  userId?: string | null
): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return `ip:${ip}`;
}

/** Usage in a route:
 *    const { success } = await bookingLimiter.limit(rateLimitKey(request, userId));
 *    if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
 */