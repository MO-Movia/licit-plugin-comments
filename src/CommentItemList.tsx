import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DateParser from './DateParser';
import styled from 'styled-components';
import CommentReply from './CommentReply';
import { getAllMarksWithSameId, onClickWrapper } from './utils/document/DocumentHelpers';
import { EditorView } from 'prosemirror-view';
let counter = 0;
let prevPos = 0;
type CommentItemListProps = {
  active: boolean;
  data: { comment: string, timestamp: number }[];
  view: EditorView;
  // isNewComment: boolean;
  // close: () => void;
};

const Wrapper = styled.div`
  padding: 3px 13px;  
  BACKGROUND: #F1F5FF;
  box-sizing: border-box;
  border: 1px solid #e1ebff;
  border-radius: 3px;
  flex-direction: column;
  transition: box-shadow 0.2s;
  min-width: 196px;
  margin-left: 12px;
  margin-top: 8px;
  > div:not(:last-of-type) {
    margin-bottom: 16px;
  }
`;
const StyledReply = styled(CommentReply)`
  border-top: ${props => !props.isNewComment && '3px solid #E1EBFF'};
`;

const CommentItemList = (props: CommentItemListProps) => {
  const { active, view } = props;
  const [isActive, setActive] = useState(0);
  const [editedComment, setEditedComment] = useState('');
  const [selected, setSelected] = useState(0);

  const getCommentMarkList = () => {
    const commentTracks = [];
    counter = 0;
    prevPos = 0;
    view.state.tr.doc.descendants((node) => {
      if (node.marks && 0 < node.marks.length) {
        node.marks.some((mark) => {
          if ('comment' === mark.type.name && !(commentTracks.some(e => e.attrs.id === mark.attrs.id))) {
            commentTracks.push(
              mark,
            );
          }
        });
      }
      return true;
    });
    return commentTracks;
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

  const removeCommentMark = (tr, commentTrack) => {
    const commentMark = view.state.schema.marks.comment;
    const commentnodePos = getCommentWordPos(tr, commentTrack.attrs.id);
    const node = tr.doc.nodeAt(commentnodePos);
    if (node) {
      const commentTo = commentnodePos + node.nodeSize;
      tr = tr.removeMark(commentnodePos, commentTo, commentMark);
    }
    return tr;
  };

  const onResolveComment = (commentTrack) => {
    const { tr } = view.state;
    const trans = removeCommentMark(tr, commentTrack);

    if (view.dispatch) {
      view.dispatch(trans);
    }
  };

  const onReplyComment = (commentTrack) => {
    const replyDiv = document.getElementById('reply' + commentTrack.attrs.id);
    if (commentTrack && replyDiv) {
      replyDiv.style.display = 'block';
    }
  };

  const setComment = (e) => {
    setEditedComment(e.target.value);
  };

  const editComment = (e, item, commentTrack) => {
    e.stopPropagation();
    e.preventDefault();

    let {
      tr
    } = view.state;
    setSelected(0);
    const markType = view.state.schema.marks.comment;
    let allCommentsWithSameId = [];
    if (view) {
      allCommentsWithSameId = getAllMarksWithSameId(
        view.state,
        commentTrack,
      );
      allCommentsWithSameId.forEach(eachComment => {
        eachComment.attrs.conversation.forEach(comment => {
          if (comment.timestamp === item.timestamp) {
            comment.comment = editedComment ? editedComment : item.comment;
            tr = tr.removeMark(eachComment.attrs.markFrom, eachComment.attrs.markTo, markType);
            tr = tr.addMark(eachComment.attrs.markFrom, eachComment.attrs.markTo,
              markType.create(
                eachComment.attrs
              ));
          }
        });
        if (view.dispatch) {
          view.dispatch(tr);
        }
      });
    }

    hideEditButtons(item);
  };

  const hideEditButtons = (item) => {
    const editDiv = document.getElementById('editbuttons');
    if (editDiv) {
      editDiv.style.display = 'none';
    }
    renderDefaultview(item);
  };

  const toggleFunc = (item, commentTrack) => {
    const id = item.timestamp;
    setSelected(id);
    setActive(id);
    applyBorderColor(commentTrack);
    if (!isEditMode(id)) {
      //highlight the comment word in editor on click.
      onClickWrapper(id, view, commentTrack, true, true);
    }
  };

  const applyBorderColor = (commentTrack) => {
    const editDiv = document.getElementById(commentTrack.attrs.id);
    if (editDiv) {
      editDiv.style.borderColor = 'red';
      editDiv.style.borderRightColor = 'transparent';
    }
  };

  const isEditMode = (id) => {
    const editComment = document.getElementById('editcomment' + id);
    return editComment ? true : false;
  };

  const toggleClass = (id, commentTrack) => {
    if (0 === selected) setActive(id);
    if (!isEditMode(id)) {
      onClickWrapper(id, view, commentTrack, false, true);
    }
  };

  const showReplyButton = (id, show) => {
    const buttondiv = document.getElementById('btnreplyresolve' + id);
    if (buttondiv) {
      buttondiv.style.display = show ? 'flex' : 'none';
    }
  };

  const cancel = (e, item) => {
    if (null === e.relatedTarget || (e.relatedTarget && 'postcommentt' !== e.relatedTarget.id)) {
      // [FS] IRAD-1743 24-03-2022
      // Don't further propogate and avoid default.
      e.stopPropagation();
      e.preventDefault();
      setSelected(0);
      setActive(item.timestamp);
      hideEditButtons(item);
    }

  };

  function renderEditview(item, commentTrack) {
    return <div>
      <form>
        <textarea defaultValue={item.comment} id={'editcomment' + item.timestamp}
          onBlur={(e) => cancel(e, item)}
          onChange={setComment.bind(this)}
          onMouseOver={() => onClickWrapper(item.timestamp, view, commentTrack, false, true)}
          style={{
            borderColor: 'transparent',
            fontFamily: 'sans-serif',
            fontSize: '13px', marginTop: '-12px', maxWidth: '220px', minHeight: '40px',
            overflowWrap: 'break-word',
            resize: 'none',
            width: '100%',
            wordBreak: 'break-all',
          }}></textarea>
      </form>
      <div id={'editbuttons'} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button id={'postcommentt'}
          onClick={(e) => editComment(e, item, commentTrack)}
          style={{
            backgroundColor: '#E0E2E7', border: '0',
            borderRadius: '5px',
            cursor: 'pointer',
            color: '#686363',
            marginRight: '8px'
          }} type='button'>
          Post
        </button>
        <button onClick={(e) => cancel(e, item)} style={{
          backgroundColor: '#E0E2E7', border: '0',
          borderRadius: '5px',
          cursor: 'pointer',
          color: '#686363',
          marginRight: '8px'
        }}>
          Cancel
        </button>
      </div>
    </div>;
  }

  function renderDefaultview(item) {
    if (item.timestamp === selected) { return null; }
    return <div className={'commentt' + item.timestamp}> {item.comment}</div>;
  }
  const onmouseoutt = (id, commentTrack) => {
    if (isActive == id && 0 === selected) setActive(0);
    const editDiv = document.getElementById(commentTrack.attrs.id);
    if (editDiv) {
      editDiv.style.borderColor = 'transparent';
    }
    onClickWrapper(id, view, commentTrack, false, false);
  };

  return (
    <>
      {getCommentMarkList().map((commentTrack) => {
        if (commentTrack.type && commentTrack.type.name === 'comment') {
          let parentNode: Node;
          parentNode = view.domAtPos(commentTrack.attrs.markTo).node.parentNode;
          let pos = 0;
          if (parentNode) {
            pos = parentNode['offsetTop']
          }

          if (prevPos === pos) {
            // pos = pos + 42;
            // counter = counter - 1;
            // if (counter === 1) {
            //   pos = pos - (counter * 42);
            // }
          }
          if (counter > 1) {
            pos = pos - (counter * 42);
            if (prevPos > pos) {
              pos = prevPos;
            }
          }
          prevPos = pos;
          const topPosition = pos + 'px';
          return (
            <Wrapper active={active} id={commentTrack.attrs.id} key={commentTrack.attrs.id}
              onMouseLeave={() => showReplyButton(commentTrack.attrs.id, false)}
              onMouseOver={() => showReplyButton(commentTrack.attrs.id, true)}
              style={{
                position: 'relative',
                top: topPosition
              }}>

              <ul style={{ listStyleType: 'none', marginBottom: '4px', paddingLeft: '0' }} >
                {commentTrack.attrs.conversation.map((item) => (
                  <li id={'comment' + item.timestamp} key={'comment' + item.timestamp}
                    onClick={onClickWrapper.bind(this, item.timestamp, view, commentTrack, true, true)}
                    style={{
                      minHeight: '35px',
                      paddingBottom: '10px',
                    }}
                  >
                    <div className={isActive == item.timestamp ? 'r-collapse' : 'rcc-collapse'} key={'commentt' + item.timestamp}
                      onClick={() => toggleFunc(item, commentTrack)}
                      onMouseLeave={() => onmouseoutt(item.timestamp, commentTrack)}
                      onMouseOver={() => toggleClass(item.timestamp, commentTrack)}
                    >
                      {/* {renderDefaultview(item)} */}
                      {selected == item.timestamp ? renderEditview(item, commentTrack) : renderDefaultview(item)}


                    </div>
                    <div style={{ fontFamily: 'Fira Sans Condensed', fontSize: '13px', fontStyle: 'italic', color: '#7c7878', cursor: 'default' }}>
                      {/* <DateParser timestamp={item.timestamp}>
                        {(timeAgo) => {
                          return `${timeAgo} ago`;
                        }}
                      </DateParser> */}
                        <DateParser timestamp={item.timestamp}>
                        {(timeStamp, timeAgo) => {
                          return `${timeAgo} ago`;
                        }}
                      </DateParser>
                    </div>
                  </li>
                ))}
                <div id={'reply' + commentTrack.attrs.id} style={{ display: 'none' }}>
                  <StyledReply
                    commentObj={commentTrack}
                    isNewComment={commentTrack.attrs.conversation.length === 0}
                    view={view}
                  />
                </div>
              </ul>
              <div id={'btnreplyresolve' + commentTrack.attrs.id} style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '2px' }}>
                <button id={'btnreply'} onClick={onReplyComment.bind(this, commentTrack)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0042c7',
                    cursor: 'pointer',
                    marginLeft: '167px',
                  }}>
                  Reply
                </button>
                <button id={'btnresolve'} onClick={onResolveComment.bind(this, commentTrack)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0042c7',
                    cursor: 'pointer',
                  }}>
                  Resolve
                </button>
              </div>
            </Wrapper>
            //   </Panel>
            //   </Collapse>
          );
        }
        return null;
      })}
    </>
  );
};

CommentItemList.propTypes = {
  /** Whether this list belongs to the current active comment */
  active: PropTypes.bool,
  /** List of objects containing data for comment items */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      timestamp: PropTypes.number.isRequired,
    }),
  ),
};

CommentItemList.defaultProps = {
  active: false,
  data: [],
};
export default CommentItemList;
