// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { EditorView } from 'prosemirror-view';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import '@modusoperandi/licit-ui-commands/dist/ui/czi-pop-up.css';
import CommentItemList from './CommentItemList';
import CommentUI from './CommentUI';

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
    this.createPrimeElement();
  }

  createPrimeElement() {
    const newDiv = document.createElement('div');
    newDiv.id = 'commentPlugin';
    newDiv.className = 'commentdiv';
    newDiv.style.position = 'absolute';
    newDiv.style.width = '250px';
    newDiv.style.background = 'transparent';
    newDiv.style.right = '17px';
    newDiv.style.top = '20px';
    newDiv.style.minHeight = '576px';

    const editorDiv = document.getElementsByClassName('czi-editor-frame-body-scroll')[0];
    const commentDiv = document.getElementById('commentPlugin');
    if (editorDiv && !commentDiv) {
      editorDiv.appendChild(newDiv);
    }
    this.showCommentList();
  }

  destroy() {
    this._popup && this._popup.close();
  }

  showCommentList() {
    const active = false;
    const commentDiv = document.getElementById('commentPlugin');
    if (commentDiv) {
      this.setCommentDivWidth(commentDiv);
      ReactDOM.render(
        <CommentItemList active={active} data={null} view={this.view} />,
        commentDiv
      );
    }
  }

  setCommentDivWidth(commentDiv) {
    commentDiv.style.width = '19%';
    switch (this.view.state.doc.attrs.layout) {
      case 'us_letter_landscape':
        commentDiv.style.right = '-108px';
        break;
      case 'a4_portrait':
        commentDiv.style.right = '20px';
        break;
      case 'a4_landscape':
        commentDiv.style.right = '-144px';
        break;
      case 'desktop_screen_4_3':
        commentDiv.style.right = '41px';
        break;
      case 'desktop_screen_16_9':
        commentDiv.style.right = '-34px';
        break;
      default:
        commentDiv.style.right = '14px';
        break;
    }
  }
  execute(from : number, event: PointerEvent) {
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
