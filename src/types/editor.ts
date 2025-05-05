// src/types/editor.ts
import type { Document } from "../../convex/schema";

export interface EditorProps {
  documentId: Id<"documents">;
  initialContent?: Document["content"];
}

export type FormattingOption = 
  | "bold" 
  | "italic"
  | "underline"
  | "highlight"
  | "heading1"
  | "heading2"
  | "alignLeft"
  | "alignCenter"
  | "alignRight";