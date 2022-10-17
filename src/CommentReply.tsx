import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';
import {grid, th} from '@pubsweet/ui-toolkit';
import {v4 as uuidv4} from 'uuid';
import {
  findAllMarksWithSameId,
  getCommentContainer,
} from './utils/document/DocumentHelpers';

const Wrapper = styled.div`
  background: ${th('colorBackgroundHue')};
  display: flex;
  flex-direction: column;
  padding: ${grid(2)} ${grid(4)};
`;

const TextWrapper = styled.div``;

const ReplyTextArea = styled.textarea`
  autoFocus;
  background: ${th('colorBackgroundHue')};
  border: 1px solid #584848;
  position: relative;
  right: 5px;
  font-family: ${th('fontWriting')};
  width: 100%;

  &:focus {
    outline: 1px solid ${th('colorPrimary')};
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const primary = css`
  background: ${th('colorPrimary')};
  color: white;
`;

const Button = styled.button`
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  color: gray;
  padding: ${grid(2)} ${grid(4)};

  ${(props) => props.primary && primary}
  ${(props) => props.disabled && 'cursor: not-allowed;'}
`;

const ButtonGroup = styled.div`
  > button:not(:last-of-type) {
    margin-right: 8px;
  }
`;

const CommentReply = (props) => {
  const {className, isNewComment, view, commentObj} = props;
  const commentInput = useRef(null);
  const [commentValue, setCommentValue] = useState('');

  useEffect(() => {
    setTimeout(() => {
      if (commentInput.current && isNewComment) commentInput.current.focus();
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClickPost(commentValue);
    setCommentValue('');
  };

  const hideReplyDiv = (hideDiv) => {
    const replyDiv = getCommentContainer(view).querySelector(
      '#reply' + commentObj.attrs.id
    );
    if (replyDiv) {
      replyDiv.style.display = hideDiv ? 'none' : 'block';
    }
  };

  const resetValue = (_e) => {
    hideReplyDiv(true);
  };

  const onClickPost = (comment): void => {
    let {tr} = view.state;
    const {selection} = view.state;
    let {from, to} = selection;
    const {empty} = selection;
    const id = uuidv4();
    const markType = view.state.schema.marks.comment;

    let allCommentsWithSameId = [];

    if (empty) {
      from = selection.$from.before(1);
      to = selection.$to.after(1);
    }

    if (view) {
      allCommentsWithSameId = findAllMarksWithSameId(view.state, commentObj);
    }

    const obj = {
      comment: comment,
      timestamp: Math.floor(Date.now()),
    };
    let attrs;
    if (null === commentObj) {
      attrs = {
        conversation: [],
        id: id,
        markFrom: from,
        markTo: to,
      };
      attrs.conversation.push(obj);
    } else {
      commentObj.attrs.conversation.push(obj);
    }

    allCommentsWithSameId.forEach((_singleComment) => {
      tr = tr.removeMark(
        commentObj.attrs.markFrom,
        commentObj.attrs.markTo,
        markType
      );
      tr = tr.addMark(
        commentObj && commentObj.attrs ? commentObj.attrs.markFrom : from,
        commentObj && commentObj.attrs ? commentObj.attrs.markTo : to,
        markType.create(commentObj.attrs)
      );
      if (view.dispatch) {
        view.dispatch(tr.scrollIntoView());
      }
    });
    hideReplyDiv(true);
  };

  return (
    <Wrapper className={className}>
      <form onSubmit={handleSubmit}>
        <TextWrapper id={'txtComment'}>
          <ReplyTextArea
            autoFocus
            cols="5"
            id={'txtComment'}
            // onBlur={() => onBlur(commentInput.current.value)}
            onChange={() => setCommentValue(commentInput.current.value)}
            onKeyDown={(e) => {
              if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                if (commentValue) handleSubmit(e);
              }
            }}
            placeholder={isNewComment ? 'Write comment...' : 'Reply...'}
            ref={commentInput}
            rows="3"
            value={commentValue}
          />
        </TextWrapper>

        <ActionWrapper>
          <ButtonGroup>
            <Button
              disabled={commentValue.length === 0}
              id={'btnPost'}
              primary
              style={{backgroundColor: '#707581'}}
              type="submit"
            >
              Post
            </Button>

            <Button id={'btnCancel'} onClick={resetValue} type="button">
              Cancel
            </Button>
          </ButtonGroup>
        </ActionWrapper>
      </form>
    </Wrapper>
  );
};

CommentReply.propTypes = {
  isNewComment: PropTypes.bool.isRequired,
  onClickPost: PropTypes.func.isRequired,
  onTextAreaBlur: PropTypes.func.isRequired,
};

CommentReply.defaultProps = {};

export default CommentReply;
