// src/components/MediaAttachmentHandler.tsx
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { Editor } from '@tiptap/core';

interface MediaAttachmentHandlerProps {
  documentId: Id<'documents'>;
  editor: Editor | null;
}

const MediaAttachmentHandler = ({ documentId, editor }: MediaAttachmentHandlerProps) => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFileMetadata);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0] || !editor) return;

    const file = event.target.files[0];
    setSelectedFile(file);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      const { storageId } = await response.json();

      // Save file metadata
      await saveFileMetadata({
        storageId,
        name: file.name,
        type: file.type,
        size: file.size,
        documentId
      });

      // Insert into editor based on file type
      if (file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: storageId }).run();
      } else {
        editor.chain().focus().insertContent({
          type: 'text',
          text: file.name,
          marks: [{
            type: 'link',
            attrs: {
              href: storageId,
              target: '_blank'
            }
          }]
        }).run();
      }

      setError('');
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('File upload error:', err);
    } finally {
      setSelectedFile(null);
    }
  };

  return (
    <div className="media-attachment-handler mt-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="media-upload"
        accept="image/*, application/pdf, .doc, .docx, .txt"
      />
      <label
        htmlFor="media-upload"
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
      >
        {selectedFile ? 'Uploading...' : 'Attach File'}
      </label>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default MediaAttachmentHandler;