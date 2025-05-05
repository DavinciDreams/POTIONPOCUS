import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCallback, useEffect, useState } from "react";
import { DatabaseView } from "./DatabaseView";

// Tiptap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import SlashCommand from './tiptap-extension/SlashCommand';
import { SlashCommandList } from './tiptap-ui/SlashCommandList';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _Suggestion from '@tiptap/suggestion';

export function Editor({ pageId }: { pageId: Id<"pages"> }) {
  const page = useQuery(api.pages.list)?.find((p) => p._id === pageId);
  const updatePage = useMutation(api.pages.update);
  const [title, setTitle] = useState(page?.title || "");
  const [_content, setContent] = useState(page?.content || "");

  const [_slashQuery, setSlashQuery] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Placeholder.configure({
        placeholder: 'Type "/" for commands...',
      }),
      SlashCommand.configure({
        suggestion: {
          char: '/',
          command: ({ editor, range, props }) => {
            props.command(editor, range);
          },
        },
      }),
    ],
    content: page?.content || '',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      debouncedUpdate({ content: newContent });
    },
  });

  useEffect(() => {
    setTitle(page?.title || "");
    if (editor && page?.content) {
      editor.commands.setContent(page.content);
    }
  }, [page, editor]);

  const debouncedUpdate = useCallback(
    (updates: { title?: string; content?: string }) => {
      void updatePage({ id: pageId, ...updates });
    },
    [pageId, updatePage]
  );

  // Cleanup Tiptap editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!page) return <div>Loading...</div>;

  if (page.type === "database") {
    return (
      <div className="p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            debouncedUpdate({ title: e.target.value });
          }}
          className="text-3xl font-bold w-full mb-4 px-2 py-1"
          placeholder="Untitled"
        />
        <DatabaseView pageId={pageId} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          debouncedUpdate({ title: e.target.value });
        }}
        className="text-3xl font-bold w-full mb-4 px-2 py-1"
        placeholder="Untitled"
      />
      <div className="relative">
        <EditorContent
          editor={editor}
          className="w-full h-[calc(100vh-200px)] p-2 border rounded"
        />
        {_slashQuery !== '' && editor && (
          <SlashCommandList 
            editor={editor} 
            query={_slashQuery} 
          />
        )}
      </div>
      {editor && (
        <div className="flex space-x-2 mt-2 flex-wrap">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Underline
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`px-2 py-1 rounded ${editor.isActive('highlight') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Left
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Center
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Right
          </button>
        </div>
      )}
    </div>
  );
}
