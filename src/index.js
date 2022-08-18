// /* eslint-disable */

import {Plugin, PluginKey} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import {Schema} from 'prosemirror-model';
import {CommentView} from './CommentView';
import CommentMarkSpec from './CommentMarkSpec';
import './Comment.css';
import '@modusoperandi/licit-ui-commands/dist/ui/czi-pop-up.css';
import {applyEffectiveSchema} from './CommentSchema';
import {COMMENT_KEY} from './Constants';
import {getCommentContainer} from './utils/document/DocumentHelpers';

const commentPlugin = new PluginKey(COMMENT_KEY);
const MARKTYPE = 'comment';
let commentView;

export class CommentPlugin extends Plugin {
  constructor() {
    super({
      key: commentPlugin,
      state: {
        init(config, state) {
          const {doc} = state;
          return commentDeco(doc, state);
        },
        apply(tr, prev, _, newState) {
          if (commentView) {
            commentView.showCommentList();
          }
          return commentDeco(tr.doc, newState);
        },
      },
      view(editorView) {
        commentView = new CommentView(editorView);
        return commentView;
      },
      props: {
        nodeViews: [],
        decorations(state) {
          return this.getState(state);
        },
        handleDOMEvents: {
          mouseover(view, event) {
            highLightComment(view, event, true);
          },
          mouseout(view, event) {
            highLightComment(view, event, false);
          },
        },
      },
    });
  }

  getEffectiveSchema(schema: Schema) {
    schema = applyEffectiveSchema(schema);
    const nodes = schema.spec.nodes;
    const commentmark = {
      comment: CommentMarkSpec,
    };
    const marks = schema.spec.marks.append(commentmark);
    return new Schema({
      nodes: nodes,
      marks: marks,
    });
  }
}

function validateSelection(state) {
  const showCommentIcon = true;
  if (state.selection.from === state.selection.to) {
    return false;
  } else {
    if (
      state.selection.node &&
      'paragraph' !== state.selection.node.type.name
    ) {
      return false;
    } else {
      const node = state.tr.doc.nodeAt(state.selection.from);
      if (node) {
        if (
          node.marks &&
          node.marks.find((mark) => mark.type.name === 'link')
        ) {
          return false;
        } else if ('math' === node.type.name) {
          return false;
        }
      }
    }
  }
  return showCommentIcon;
}

function commentDeco(doc, state) {
  if (!validateSelection(state)) {
    return null;
  }
  const decos = [];
  decos.push(
    Decoration.inline(state.selection.from, state.selection.to, {
      class: 'problem',
    }),
    Decoration.widget(
      state.selection.from,
      commentIcon(state.selection.empty, state)
    )
  );
  return DecorationSet.create(doc, decos);
}

function highLightComment(view, e, highlight) {
  if (commentView) {
    let clientY = 0;
    clientY = e.clientY;
    if (e.offsetY < 1) {
      clientY = clientY + Math.abs(e.offsetY);
    }

    const nodePos = view.posAtCoords({
      left: e.clientX,
      top: clientY,
    });

    let pos = null;
    if (null !== nodePos) {
      pos = nodePos.pos;
    }

    if (pos) {
      showCommentHighlight(view, pos, highlight);
    }
  }
}

function showCommentHighlight(view, pos, highlight) {
  const parentNode = view.state.tr.doc.nodeAt(pos);
  if (parentNode) {
    if (parentNode.marks) {
      let markFound;
      const actualMark = parentNode.marks.find(
        (mark) => mark.type.name === MARKTYPE
      );
      if (actualMark) {
        clearCommentHighlight(view);
        markFound = {
          attrs: actualMark.attrs,
        };
      } else {
        clearCommentHighlight(view);
      }
      if (markFound) {
        const commentDiv = getCommentContainer(view).querySelector(
          '#comment' + markFound.attrs.conversation[0].timestamp
        );
        if (commentDiv) {
          commentDiv.style.backgroundColor = highlight
            ? '#e9d8d8'
            : 'transparent';
        }
      }
    }
  } else {
    clearCommentHighlight(view);
  }
}

function clearCommentHighlight(view) {
  const commentList = getCommentContainer(view).querySelectorAll('li');
  for (let i = 0, len = commentList.length; i < len; i++) {
    commentList[i].style.backgroundColor = 'transparent';
  }
}

function commentIcon(hideIcon, state) {
  const icon = document.createElement('div');
  icon.id = 'commentIcon' + state.selection.from;
  icon.className = 'comment-icon';
  icon.style.visibility = hideIcon ? 'hidden' : 'visible';
  icon.style.marginLeft = '15px';

  if (commentView) {
    const commentUIDiv = getCommentContainer(commentView.view).querySelector(
      '#commentUIDiv'
    );
    if (commentUIDiv) {
      commentUIDiv.style.visibility = icon.style.visibility;
    }
  }

  icon.onclick = function (e) {
    if (commentView) {
      commentView.execute(state.selection.from, e);
    }
  };
  return icon;
}
