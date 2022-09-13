// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import {EditorView} from 'prosemirror-view';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import '@modusoperandi/licit-ui-commands/dist/ui/czi-pop-up.css';
import CommentItemList from './CommentItemList';
import CommentUI from './CommentUI';
import {getCommentContainer} from './utils/document/DocumentHelpers';
import {COMMENT_KEY} from './Constants';

export type CBFn = () => void;

export class CommentView {
  view: EditorView;
  getCurPos: CBFn;
  dom: HTMLElement;

  inputComment: string;
  _anchorEl = null;
  _popup = null;

  constructor(view: EditorView) {
    // This will help in updating document views.
    this.view = view;
  }

  getCommentUI() {
    let commentDiv = null;
    const editorDiv = getCommentContainer(this.view);
    if (editorDiv) {
      commentDiv = editorDiv.querySelector('#' + COMMENT_KEY);
      let add = false;
      if (!commentDiv) {
        add = true;
        commentDiv = document.createElement('div');
        commentDiv.id = COMMENT_KEY;
        commentDiv.className = 'commentdiv';
        commentDiv.style.position = 'absolute';
        commentDiv.style.background = 'transparent';
        commentDiv.style.top = '20px';
        commentDiv.style.minHeight = '576px';
      }

      let padding = editorDiv.offsetWidth - editorDiv.clientWidth;
      if (0 === padding) {
        padding = this.view.dom.offsetWidth - this.view.dom.clientWidth;
        if (0 === padding) {
          padding = this.view.dom.scrollWidth - this.view.dom.clientWidth;
        }
      }
      commentDiv.style.width =
        editorDiv.clientWidth - (this.view.dom.offsetWidth + padding) + 'px';
      commentDiv.style.left = this.view.dom.offsetWidth + padding + 'px';
      if (add) {
        editorDiv.appendChild(commentDiv);
      }
    }

    return commentDiv;
  }

  destroy() {
    this._popup && this._popup.close();
  }

  showCommentList(state) {
    const commentDiv = this.getCommentUI();
    const active = false;
    if (commentDiv) {
      let setMarginLeft = false;
      state.tr.doc.descendants((node) => {
        if (node.marks && 0 < node.marks.length) {
          node.marks.some((mark) => {
            if ('comment' === mark.type.name) {
              setMarginLeft = true;
              return true;
            } else {
              return false;
            }
          });
        }
        return true;
      });
      this.view.dom.style.marginLeft = setMarginLeft ? '10px' : 'auto';
      ReactDOM.render(
        <CommentItemList
          active={active}
          data={null}
          state={state}
          view={this.view}
        />,
        commentDiv
      );
    }
  }

  execute(from: number, event: PointerEvent) {
    const anchor1 = event ? event.currentTarget : null;
    const viewPops = {
      editorView: this.view,
      commentInput: '',
    };

    const domFound = this.view.domAtPos(from);
    if (!domFound) {
      this.destroy();
      return;
    }
    if (!anchor1) {
      this.destroy();
      return;
    }
    this._popup && this._popup.close();
    this._anchorEl = anchor1;
    this._popup = createPopUp(CommentUI, viewPops, {
      anchor: anchor1,
      autoDismiss: false,
      onClose: () => {
        if (this._popup) {
          this._popup = null;
          this._anchorEl = null;
        }
      },
      // position: atAnchorTopRight,
    });
  }
}
