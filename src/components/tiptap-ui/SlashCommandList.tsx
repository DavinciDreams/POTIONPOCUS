import React from 'react';
import { Editor } from '@tiptap/react';

interface SlashCommandListProps {
  editor: Editor;
  query: string;
}

const SLASH_COMMANDS = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    command: (editor: Editor, range: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    command: (editor: Editor, range: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
  },
  {
    title: 'Bold',
    description: 'Make text bold',
    command: (editor: Editor, range: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBold()
        .run();
    },
  },
  {
    title: 'Italic',
    description: 'Make text italic',
    command: (editor: Editor, range: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleItalic()
        .run();
    },
  },
  {
    title: 'Code',
    description: 'Insert inline code',
    command: (editor: Editor, range: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCode()
        .run();
    },
  },
];

export const SlashCommandList: React.FC<SlashCommandListProps> = ({ 
  editor, 
  query 
}) => {
  const filteredCommands = SLASH_COMMANDS.filter(
    (command) => 
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase())
  );

  if (filteredCommands.length === 0) return null;

  return (
    <div className="slash-command-list bg-white border rounded shadow-lg absolute z-50 mt-2">
      {filteredCommands.map((command, index) => (
        <div 
          key={index} 
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => command.command(editor, { from: editor.state.selection.from, to: editor.state.selection.to })}
        >
          <div className="font-bold">{command.title}</div>
          <div className="text-sm text-gray-500">{command.description}</div>
        </div>
      ))}
    </div>
  );
};
