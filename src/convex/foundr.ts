import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

/* FoundrMatch: persist the signed-in founder's onboarding profile. */

const profileArgs = {
  name: v.string(),
  vision: v.string(),
  stage: v.string(),
  industries: v.array(v.string()),
  gaps: v.array(v.string()),
  commitment: v.string(),
  equity: v.string(),
  workStyle: v.string(),
  lookingFor: v.string(),
  parsedSkills: v.optional(v.array(v.string())),
  radar: v.optional(
    v.object({
      Tech: v.number(),
      Product: v.number(),
      Growth: v.number(),
      Ops: v.number(),
    }),
  ),
};

/** Idempotent upsert of the current user's founder profile. */
export const upsertProfile = mutation({
  args: profileArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated: cannot save founder profile.");
    }
    const existing = await ctx.db
      .query("founderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return ctx.db.insert("founderProfiles", { userId, ...args });
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return ctx.db
      .query("founderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

/** Record a deck action (coffee / nda / pass). Skips duplicates silently. */
export const recordAction = mutation({
  args: {
    founderId: v.string(),
    action: v.union(v.literal("coffee"), v.literal("nda"), v.literal("pass")),
  },
  handler: async (ctx, { founderId, action }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated: cannot record deck action.");
    }
    const existing = await ctx.db
      .query("founderActions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.some((a) => a.founderId === founderId && a.action === action)) return;

    await ctx.db.insert("founderActions", { userId, founderId, action });
  },
});

export const myActions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return ctx.db
      .query("founderActions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Demo reset — clears the current user's deck actions. */
export const resetActions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return;
    const actions = await ctx.db
      .query("founderActions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of actions) await ctx.db.delete(a._id);
  },
});
