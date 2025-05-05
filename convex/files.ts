// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});

export const saveFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    documentId: v.optional(v.id("documents")) // Changed from pageId to documentId
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("fileMetadata", {
      originalName: args.name,
      contentType: args.type,
      size: args.size,
      documentId: args.documentId
    });

    if (args.documentId) {
      const doc = await ctx.db.get(args.documentId);
      if (doc) {
        await ctx.db.patch(args.documentId, {
          content: {
            ...doc.content,
            attachments: [
              ...(doc.content.attachments || []),
              {
                fileId: args.storageId,
                name: args.name,
                type: args.type
              }
            ]
          }
        });
      }
    }
    return fileId;
  }
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  }
});