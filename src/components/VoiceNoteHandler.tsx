// src/components/VoiceNoteHandler.tsx
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import VoiceRecorder from './VoiceRecorder';
import type { Editor } from '@tiptap/core';

interface VoiceNoteHandlerProps {
  documentId: Id<'documents'>;
  editor: Editor | null;
}

const VoiceNoteHandler = ({ documentId, editor }: VoiceNoteHandlerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const createVoiceNote = useMutation(api.media.createVoiceNote);

  const handleSave = async (audioBlob: Blob) => {
    if (!editor) return;

    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = document.createElement('audio');
      audioElement.src = audioUrl;
      audioElement.controls = true;

      await createVoiceNote({
        documentId,
        audioUrl,
        duration: audioElement.duration
      });

      editor.chain().focus().insertContent(audioElement.outerHTML).run();
    } catch (error) {
      console.error('Error saving voice note:', error);
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
        Record Voice Note
      </button>

      {isOpen && (
        <VoiceRecorder
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default VoiceNoteHandler;