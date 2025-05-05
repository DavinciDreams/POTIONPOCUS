import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDrawing = mutation({
  args: {
    pageId: v.id("pages"),
    dataUrl: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  returns: v.id("drawings"),
  handler: async (ctx, args) => {
    const drawing = await ctx.db.insert("drawings", {
      pageId: args.pageId,
      dataUrl: args.dataUrl,
      width: args.width,
      height: args.height,
      createdAt: Date.now(),
    });
    return drawing;
  },
});

export const createVoiceNote = mutation({
  args: {
    pageId: v.id("pages"),
    audioUrl: v.string(),
    duration: v.optional(v.number()),
    transcription: v.optional(v.string()),
  },
  returns: v.id("voiceNotes"),
  handler: async (ctx, args) => {
    const voiceNote = await ctx.db.insert("voiceNotes", {
      pageId: args.pageId,
      audioUrl: args.audioUrl,
      duration: args.duration,
      transcription: args.transcription,
      createdAt: Date.now(),
    });
    return voiceNote;
  },
});

export const getDrawingsForPage = query({
  args: { pageId: v.id("pages") },
  returns: v.array(
    v.object({
      _id: v.id("drawings"),
      dataUrl: v.string(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const drawings = await ctx.db
      .query("drawings")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();
    return drawings;
  },
});

export const getVoiceNotesForPage = query({
  args: { pageId: v.id("pages") },
  returns: v.array(
    v.object({
      _id: v.id("voiceNotes"),
      audioUrl: v.string(),
      duration: v.optional(v.number()),
      transcription: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const voiceNotes = await ctx.db
      .query("voiceNotes")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();
    return voiceNotes;
  },
});
