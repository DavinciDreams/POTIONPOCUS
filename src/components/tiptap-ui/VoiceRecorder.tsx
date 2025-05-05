import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onSave: (audioBlob: Blob) => void;
  onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSave, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSave(audioBlob);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg text-center">
        <h2 className="text-xl mb-4">
          {isRecording ? 'Recording...' : 'Record Voice Note'}
        </h2>
        
        {audioURL && (
          <div className="mb-4">
            <audio src={audioURL} controls />
          </div>
        )}

        <div className="flex justify-center space-x-4 mb-4">
          {!isRecording ? (
            <button 
              onClick={startRecording} 
              className="bg-green-500 text-white px-4 py-2 rounded-full"
            >
              Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording} 
              className="bg-red-500 text-white px-4 py-2 rounded-full"
            >
              Stop Recording
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose} 
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
          {audioURL && (
            <button 
              onClick={handleSave} 
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
