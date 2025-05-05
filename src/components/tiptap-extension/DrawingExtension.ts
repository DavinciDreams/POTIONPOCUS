import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    drawing: {
      setDrawing: (options: { src: string }) => ReturnType;
    }
  }
}

export const DrawingExtension = Node.create({
  name: 'drawing',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          return {
            src: (dom as HTMLElement).getAttribute('src') || '',
          };
        },
      },
    ];
  },

  renderHTML({ _node, HTMLAttributes }: { _node?: Node; HTMLAttributes: Record<string, any> }) {
    return [
      'img', 
      mergeAttributes(HTMLAttributes, {
        class: 'drawing-node',
        style: 'max-width: 100%; height: auto;',
      })
    ];
  },

  addCommands() {
    return {
      setDrawing: (options) => ({ tr, dispatch }) => {
        const _node = this.type.create(options);
        
        if (dispatch) {
          tr.replaceSelectionWith(_node);
        }
        
        return true;
      },
    };
  },
});
