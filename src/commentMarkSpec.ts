import type { MarkSpec } from './Types';
import { Mark } from 'prosemirror-model';

const commentMarkSpec: MarkSpec = {
  attrs: {
    class: { default: 'comment' },
    id: { default: '' },
    group: { default: '' },
    viewid: { default: '' },
    conversation: [],
    markFrom: { default: null },
    markTo: { default: null },
    overridden: { default: true },
    appliedHighlight: {
      default: 'transparent'
    }
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span.comment',
      getAttrs(dom) {
        return {
          class: dom.getAttribute('class'),
          id: dom.dataset.id,
          group: dom.dataset.group,
          viewid: dom.dataset.viewid,
          conversation: JSON.parse(dom.dataset.conversation),
          markFrom: dom.dataset.markFrom,
          markTo: dom.dataset.markTo,
          overridden: dom.dataset.overridden,
          appliedHighlight: dom.dataset.appliedHighlight,
        };
      },
    },
  ],

  toDOM(hook: Mark) {
    return [
      'span',
      {
        class: hook.attrs.class,
        'data-id': hook.attrs.id,
        'data-conversation': JSON.stringify(hook.attrs.conversation),
        'data-viewid': hook.attrs.viewid,
        'data-group': hook.attrs.group,
        'data-markFrom': hook.attrs.markFrom,
        'data-markTo': hook.attrs.markTo,
        'data-overridden': hook.attrs.overridden,
        'data-appliedHighlight': hook.attrs.appliedHighlight,
      },
    ];
  },
};

export default commentMarkSpec;
