// src/components/tiptap-extension/SlashCommand.ts
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from 'prosemirror-state';
import type { Editor } from '@tiptap/react';
import React from 'react';

export interface SlashCommandOptions {
  suggestion: {
    char?: string;
    pluginKey?: PluginKey;
    editor?: Editor;
    command?: (props: {
      editor: Editor;
      range: { from: number; to: number };
      props: any;
    }) => React.ReactElement;
  };
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',
  
  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: new PluginKey('slash-commands'),
        editor: undefined,
        command: undefined,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.options.suggestion.editor,
        char: this.options.suggestion.char,
        pluginKey: this.options.suggestion.pluginKey,
        command: this.options.suggestion.command,
      }),
    ];
  },
});

export default SlashCommand;