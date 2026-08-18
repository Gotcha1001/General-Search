import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGet = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized -- no identity found");
    }

    const clerkId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      return existing;
    }

    const email = typeof identity.email === "string" ? identity.email : "";
    const name =
      typeof identity.name === "string"
        ? identity.name
        : typeof identity.givenName === "string"
          ? identity.givenName
          : "Unknown User";
    const imageUrl =
      typeof identity.pictureUrl === "string"
        ? identity.pictureUrl
        : typeof identity.picture === "string"
          ? identity.picture
          : typeof identity.image === "string"
            ? identity.image
            : undefined;

    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      imageUrl,
      role: "user" as const,
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return (
      (await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first()) ?? null
    );
  },
});

// Lets a signed-in user set which location their searches should default
// to (free text -- e.g. "Durban, South Africa" or "Anywhere").
export const setLocation = mutation({
  args: { location: v.string() },
  handler: async (ctx, { location }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const trimmed = location.trim();
    if (trimmed.length === 0) {
      throw new Error("Location cannot be empty");
    }
    // Catches the common "City, Country or Anywhere" copy-paste mistake --
    // this field takes exactly one place, not a disjunction of two.
    if (/\bor\b/i.test(trimmed)) {
      throw new Error(
        'Enter one location, e.g. "Durban, South Africa" or just "Anywhere" -- not both joined by "or".',
      );
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { location: trimmed });
  },
});
