import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

export interface SlashCommandOptions {
  suggestion: {
    char?: string;
    pluginKey?: string;
    command?: (props: { editor: any; range: any; props: any }) => void;
  };
}

const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: 'slashCommand',
        command: ({ editor, range, props }) => {
          props.command(editor, range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommand;
