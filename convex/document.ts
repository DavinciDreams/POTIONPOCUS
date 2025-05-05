// convex/document.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDocument = mutation({
  args: {
    title: v.string(),
    ownerId: v.id("users")
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      title: args.title,
      content: { type: "doc", content: [] }, // Proper rich text format
      ownerId: args.ownerId
    });
  }
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    content: v.any() // Allow any rich text content
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      content: args.content
    });
  }
});

export const getDocument = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});