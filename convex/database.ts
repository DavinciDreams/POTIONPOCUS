import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getViews = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("views")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .collect();
  },
});

export const getItems = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("items")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .collect();
  },
});

export const createItem = mutation({
  args: {
    pageId: v.id("pages"),
    fields: v.record(v.string(), v.union(
      v.string(),
      v.number(),
      v.array(v.string()),
      v.null()
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const page = await ctx.db.get(args.pageId);
    if (!page || page.ownerId !== userId || page.type !== "database") {
      throw new Error("Database not found or access denied");
    }

    return await ctx.db.insert("items", {
      pageId: args.pageId,
      fields: args.fields,
      ownerId: userId,
    });
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("items"),
    fields: v.record(v.string(), v.union(
      v.string(),
      v.number(),
      v.array(v.string()),
      v.null()
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.ownerId !== userId) {
      throw new Error("Item not found or access denied");
    }

    await ctx.db.patch(args.id, { fields: args.fields });
  },
});

export const addColumn = mutation({
  args: {
    pageId: v.id("pages"),
    column: v.object({
      name: v.string(),
      type: v.union(
        v.literal("text"),
        v.literal("number"),
        v.literal("date"),
        v.literal("select"),
        v.literal("multiselect"),
        v.literal("status")
      ),
      options: v.optional(v.array(v.object({
        label: v.string(),
        color: v.string(),
      }))),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const page = await ctx.db.get(args.pageId);
    if (!page || page.ownerId !== userId || page.type !== "database") {
      throw new Error("Database not found or access denied");
    }

    const schema = page.schema || [];
    await ctx.db.patch(args.pageId, {
      schema: [...schema, args.column],
    });
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.ownerId !== userId) {
      throw new Error("Item not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

export const createDatabase = mutation({
  args: {
    title: v.string(),
    parentId: v.optional(v.id("pages")),
    schema: v.array(v.object({
      name: v.string(),
      type: v.union(
        v.literal("text"),
        v.literal("number"),
        v.literal("date"),
        v.literal("select"),
        v.literal("multiselect"),
        v.literal("status")
      ),
      options: v.optional(v.array(v.object({
        label: v.string(),
        color: v.string(),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pageId = await ctx.db.insert("pages", {
      title: args.title,
      content: "",
      parentId: args.parentId,
      ownerId: userId,
      type: "database",
      schema: args.schema,
    });

    // Create default table view
    await ctx.db.insert("views", {
      pageId,
      name: "Table",
      type: "table",
      config: {},
      ownerId: userId,
    });

    return pageId;
  },
});

export const createView = mutation({
  args: {
    pageId: v.id("pages"),
    name: v.string(),
    type: v.union(
      v.literal("table"),
      v.literal("list"),
      v.literal("gallery"),
      v.literal("calendar"),
      v.literal("kanban")
    ),
    config: v.object({
      sortBy: v.optional(v.string()),
      sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
      groupBy: v.optional(v.string()),
      calendarField: v.optional(v.string()),
      kanbanField: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const page = await ctx.db.get(args.pageId);
    if (!page || page.ownerId !== userId || page.type !== "database") {
      throw new Error("Database not found or access denied");
    }

    return await ctx.db.insert("views", {
      pageId: args.pageId,
      name: args.name,
      type: args.type,
      config: args.config,
      ownerId: userId,
    });
  },
});

export const updateView = mutation({
  args: {
    id: v.id("views"),
    name: v.optional(v.string()),
    config: v.optional(v.object({
      sortBy: v.optional(v.string()),
      sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
      groupBy: v.optional(v.string()),
      calendarField: v.optional(v.string()),
      kanbanField: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const view = await ctx.db.get(args.id);
    if (!view || view.ownerId !== userId) {
      throw new Error("View not found or access denied");
    }

    const updates: { name?: string; config?: typeof args.config } = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.config !== undefined) updates.config = args.config;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteView = mutation({
  args: {
    id: v.id("views"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const view = await ctx.db.get(args.id);
    if (!view || view.ownerId !== userId) {
      throw new Error("View not found or access denied");
    }

    // Don't allow deleting the last view
    const views = await ctx.db
      .query("views")
      .withIndex("by_page", (q) => q.eq("pageId", view.pageId))
      .collect();
    if (views.length <= 1) {
      throw new Error("Cannot delete the last view");
    }

    await ctx.db.delete(args.id);
  },
});
