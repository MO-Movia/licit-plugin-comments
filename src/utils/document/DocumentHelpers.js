import {Decoration} from 'prosemirror-view';
import {MARK_TEXT_HIGHLIGHT} from '../../Constants';

export const HIGHLIGHTDECO = 'highLightDecoration';

export const findAllMarksWithSameId = (state, mark) => {
  const type = mark.type.name;
  const markType = state.schema.marks[type];

  const allNodes = findChildrenByMark(state.doc, markType, true);

  const allMarksWithSameId = [];
  allNodes.forEach((node) => {
    node.node.marks.filter((value) => {
      if (mark.type.name === type && mark.attrs.id === value.attrs.id) {
        allMarksWithSameId.push(node);
      }
    });
  });
  return allMarksWithSameId;
};

export const getAllMarksWithSameId = (state, mark) => {
  const type = mark.type.name;
  const markType = state.schema.marks[type];

  const allNodes = findChildrenByMark(state.doc, markType, true);

  const allMarksWithSameId = [];
  allNodes.forEach((node) => {
    node.node.marks.filter((value) => {
      if (mark.type.name === type && mark.attrs.id === value.attrs.id) {
        allMarksWithSameId.push(mark);
      }
    });
  });
  return allMarksWithSameId;
};

export const flatten = (node, descend = true) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  }
  const result = [];
  node.descendants((child, pos) => {
    result.push({node: child, pos});
    return descend;
  });
  return result;
};

const findChildren = (node, predicate, descend) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten(node, descend).filter((child) => predicate(child.node));
};

const findChildrenByMark = (node, markType, descend) => {
  return findChildren(node, (child) => markType.isInSet(child.marks), descend);
};

const getCommentWordPos = (tr, commentId) => {
  let commentNodePos = 0;
  tr.doc.descendants((node, pos) => {
    if (node.marks && 0 < node.marks.length) {
      node.marks.some((mark) => {
        if ('comment' === mark.type.name && mark.attrs.id === commentId) {
          commentNodePos = pos;
        }
      });
    }
    return true;
  });
  return commentNodePos;
};

const selectTheHighlightColor = (
  showCommenthighlight,
  onclick,
  commentTrack,
  editorView
) => {
  let highlightColor = showCommenthighlight
    ? getAppliedCustomStyle(commentTrack, editorView)
    : commentTrack.attrs.appliedHighlight;

  if (showCommenthighlight) {
    highlightColor = onclick ? '#f22' : '#fdd';
  }
  return highlightColor;
};

const isCustomStyleApplied = (editorView) => {
  const parent = editorView.state.selection.$anchor.parent;
  return parent && parent.attrs.styleName && 'None' !== parent.attrs.styleName;
};

const getAppliedCustomStyle = (commentTrack, editorView) => {
  const node = isCustomStyleApplied(editorView)
    ? editorView.state.selection.$anchor.nodeBefore
    : editorView.state.tr.doc.nodeAt(commentTrack.attrs.markFrom);
  if (node && node.marks.length > 0) {
    const highlightMark = node.marks.find(
      (mark) => mark.type.name === MARK_TEXT_HIGHLIGHT
    );

    if (
      highlightMark &&
      (null === highlightMark.attrs.hasComment ||
        !highlightMark.attrs.hasComment)
    ) {
      commentTrack.attrs.appliedHighlight = highlightMark.attrs.highlightColor;
    }
  }
};

export const onClickWrapper = (
  id,
  view,
  commentTrack,
  onclick,
  showCommenthighlight
) => {
  const container = getCommentContainer(view);
  if (
    null != container.querySelector('#commentUIDiv') ||
    (onclick && null != container.querySelector('#editcomment' + id))
  ) {
    return;
  }
  const {tr} = view.state;
  const from = getCommentWordPos(tr, commentTrack.attrs.id);
  const node = tr.doc.nodeAt(from);
  if (node) {
    const to = from + node.nodeSize;
    const highlightColor = selectTheHighlightColor(
      showCommenthighlight,
      onclick,
      commentTrack,
      view
    );
    tr.setMeta(
      HIGHLIGHTDECO,
      Decoration.inline(from, to, {
        style: `background-color: ${highlightColor};`,
      })
    );
    view.dispatch(tr.scrollIntoView());
  }
};

export const getCommentContainer = (view) => {
  // .czi-editor-frame-body-scroll
  return view.dom.parentElement.parentElement.parentElement;
};
