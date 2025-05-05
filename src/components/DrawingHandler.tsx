// src/components/DrawingHandler.tsx
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import DrawingCanvas from './DrawingCanvas';
import type { Editor } from '@tiptap/core';

interface DrawingHandlerProps {
  documentId: Id<'documents'>;
  editor: Editor | null;
}

const DrawingHandler = ({ documentId, editor }: DrawingHandlerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const createDrawing = useMutation(api.media.createDrawing);

  const handleSave = async (dataUrl: string) => {
    if (!editor) return;
    
    try {
      await createDrawing({
        documentId,
        dataUrl
      });
      
      editor.chain().focus().setDrawing({ src: dataUrl }).run();
    } catch (error) {
      console.error('Error saving drawing:', error);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        Add Drawing
      </button>

      {isOpen && (
        <DrawingCanvas
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DrawingHandler;