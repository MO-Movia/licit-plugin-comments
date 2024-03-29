// /* eslint-disable */

import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node, Schema } from 'prosemirror-model';
import { CommentView } from './CommentView';
import CommentMarkSpec from './commentMarkSpec';
import './Comment.css';
import '@modusoperandi/licit-ui-commands/dist/ui/czi-pop-up.css';
import { applyEffectiveSchema } from './CommentSchema';
import { COMMENT_KEY } from './Constants';
import {
  getCommentContainer,
  HIGHLIGHTDECO,
} from './utils/document/DocumentHelpers';
import OrderedMap from 'orderedmap';

const commentPlugin = new PluginKey(COMMENT_KEY);
const MARKTYPE = 'comment';

export class CommentPlugin extends Plugin {

  constructor() {
    super({
      key: commentPlugin,
      state: {
        init(_config, state) {
          window.addEventListener('resize', () => {
            if (this.spec.commentView) {
              this.spec.commentView.getCommentUI();
            }
          });
          const { doc } = state;
          return commentDeco(doc, state);
        },
        apply(tr, _prev, _, newState) {
          if (this.spec.commentView) {
            this.spec.commentView.showCommentList(newState);
          }
          return commentDeco(tr.doc, newState, this.spec.commentView, tr);
        },
      },
      view(editorView) {
        this.commentView = new CommentView(editorView);
        return this.commentView;
      },
      props: {
        nodeViews: {},
        decorations(state) {
          return this.getState(state);
        },
        handleDOMEvents: {
          mouseover(view, event) {
            highLightComment(view, event, true, this.spec.commentView);
          },
          mouseout(view, event) {
            highLightComment(view, event, false, this.spec.commentView);
          },
        },
      },
      filterTransaction(tr: Transaction, _state: EditorState): boolean {
        // skip if the highlight thru collab
        return !isHighlightViaCollab(tr);
      },
    });
  }

  getEffectiveSchema(schema: Schema) {
    schema = applyEffectiveSchema(schema);
    const nodes = schema.spec.nodes;
    const commentmark = {
      comment: CommentMarkSpec,
    };
    const marks = (schema.spec.marks as OrderedMap).append(commentmark);
    return new Schema({
      nodes: nodes,
      marks: marks,
    });
  }
}

function isHighlightViaCollab(tr: Transaction) {
  let viaCollab = false;
  let isHighlight = false;

  viaCollab = !!tr.getMeta('collab$');
  if (viaCollab) {
    isHighlight = !!tr.getMeta(HIGHLIGHTDECO);
  }

  return isHighlight && viaCollab;
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
        return hideCommentIcon(node);
      }
    }
  }
  return showCommentIcon;
}

function hideCommentIcon(node: Node) {
  if (
    (node.marks &&
      node.marks.find(
        (mark) =>
          'link' === mark.type.name || 'comment' === mark.type.name
      )) ||
    'math' === node.type.name
  ) {
    return false;
  }
  return true;
}

function commentDeco(doc, state, commentView?, tr?) {
  const decos = [];
  if (validateSelection(state)) {
    decos.push(
      Decoration.inline(state.selection.from, state.selection.to, {
        class: 'molcmt-problem',
      }),
      Decoration.widget(
        state.selection.from,
        commentIcon(state.selection.empty, state, commentView)
      )
    );
  }

  if (tr) {
    let d = tr.getMeta(HIGHLIGHTDECO);
    if (!d) {
      const t = tr.getMeta('appendedTransaction');
      if (t) {
        d = t.getMeta(HIGHLIGHTDECO);
      }
    }

    if (d) {
      decos.push(d);
    }
  }
  return 0 < decos.length ? DecorationSet.create(doc, decos) : null;
}

function highLightComment(view, e, highlight, commentView) {
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
  if (parentNode && parentNode.marks) {
    let markFound;
    const actualMark = parentNode.marks.find(
      (mark) => mark.type.name === MARKTYPE
    );
    clearCommentHighlight(view);
    if (actualMark) {
      markFound = {
        attrs: actualMark.attrs,
      };
      const commentDiv = getCommentContainer(view).querySelector(
        '#comment' + markFound.attrs.conversation[0].timestamp
      );
      if (commentDiv) {
        commentDiv.style.backgroundColor = highlight
          ? '#e9d8d8'
          : 'transparent';
      }
    }
  } else {
    clearCommentHighlight(view);
  }
}

function clearCommentHighlight(view) {
  const commentList = getCommentContainer(view).querySelectorAll('li');
  for (let i = 0, len = commentList.length; i < len; i++) {
    let bkgClr = commentList[i].style.backgroundColor;
    // Set transparent only if a color is set to avoid unnecessary calls.
    if ('' !== bkgClr && 'transparent' !== bkgClr) {
      bkgClr = 'transparent';
    }
  }
}

function commentIcon(hideIcon, state, commentView) {
  const icon = document.createElement('div');
  icon.id = 'commentIcon' + state.selection.from;
  icon.className = 'molcmt-comment-icon';
  icon.style.visibility = hideIcon ? 'hidden' : 'visible';
  icon.style.marginLeft = '15px';
  icon.style.marginRight = '23px';

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
