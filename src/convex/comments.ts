import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

/* Founder Connect AI: comment threads on founder profiles. */

/** Public thread: everyone browsing a profile sees the conversation. */
export const listComments = query({
  args: { founderId: v.string() },
  handler: async (ctx, { founderId }) => {
    return ctx.db
      .query("founderComments")
      .withIndex("by_founder", (q) => q.eq("founderId", founderId))
      .collect();
  },
});

export const addComment = mutation({
  args: { founderId: v.string(), body: v.string() },
  handler: async (ctx, { founderId, body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to join the conversation.");

    const trimmed = body.trim().slice(0, 2000);
    if (!trimmed) throw new Error("Message cannot be empty.");

    const user = await ctx.db.get(userId);
    await ctx.db.insert("founderComments", {
      userId,
      founderId,
      body: trimmed,
      authorName: user?.name ?? undefined,
    });
  },
});

/** All threads the current user has participated in (for the dashboard). */
export const myThreads = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const mine = await ctx.db
      .query("founderComments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const threads = new Map<string, { founderId: string; count: number; lastBody: string; lastAt: number }>();
    for (const c of mine) {
      const t = threads.get(c.founderId) ?? { founderId: c.founderId, count: 0, lastBody: c.body, lastAt: c._creationTime };
      t.count += 1;
      if (c._creationTime > t.lastAt) {
        t.lastBody = c.body;
        t.lastAt = c._creationTime;
      }
      threads.set(c.founderId, t);
    }
    return [...threads.values()].sort((a, b) => b.lastAt - a.lastAt);
  },
});
