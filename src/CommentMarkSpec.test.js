import CommentMarkSpec from './commentMarkSpec';

const node = {
  attrs: {
    class: 'comment',
    id: '99c348c6-86de-4e99-b670-52bf54163fa4',
    conversation: {user: 'Antony', text: 'success!!!'},
    viewid: '1234567890',
    group: 'internal',
    markFrom: '10',
    markTo: '20',
    overridden: 'true',
    appliedHighlight: 'transparent',
  },
};

describe('CommentMarkSpec', () => {
  it('dom should have matching node attributes', () => {
    expect(CommentMarkSpec.toDOM(node, true)).toStrictEqual([
      'span',
      {
        class: node.attrs.class,
        'data-id': node.attrs.id,
        'data-conversation': JSON.stringify(node.attrs.conversation),
        'data-viewid': node.attrs.viewid,
        'data-group': node.attrs.group,
        'data-markFrom': node.attrs.markFrom,
        'data-markTo': node.attrs.markTo,
        'data-overridden': node.attrs.overridden,
        'data-appliedHighlight': node.attrs.appliedHighlight,
      },
    ]);
  });

  it('parse dom attributes', () => {
    const dom = document.createElement('span');
    dom.setAttribute('class', node.attrs.class);
    dom.dataset.id = node.attrs.id;
    dom.dataset.conversation = JSON.stringify(node.attrs.conversation);
    dom.dataset.viewid = node.attrs.viewid;
    dom.dataset.group = node.attrs.group;
    dom.dataset.markFrom = node.attrs.markFrom;
    dom.dataset.markTo = node.attrs.markTo;
    dom.dataset.overridden = node.attrs.overridden;
    dom.dataset.appliedHighlight = node.attrs.appliedHighlight;

    const attrs = CommentMarkSpec.parseDOM[0].getAttrs(dom);
    expect(attrs).toStrictEqual(node.attrs);
  });
});
