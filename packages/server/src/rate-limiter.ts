/**
 * Simple in-memory fixed-window rate limiter.
 * Good enough for single-instance deployments (e.g. Render free tier).
 */
export class RateLimiter {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  /**
   * Returns true if the request is allowed, false if the limit is exceeded.
   * @param key      Identifier, e.g. "ai:global" or a socket id
   * @param max      Max requests per window
   * @param windowMs Window size in milliseconds
   */
  allow(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (bucket.count >= max) return false;
    bucket.count++;
    return true;
  }
}
