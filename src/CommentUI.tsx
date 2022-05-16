
import React from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import { grid, th } from '@pubsweet/ui-toolkit';
import { v4 as uuidv4 } from 'uuid';
import CommentItemList from './CommentItemList';
import { EditorView } from 'prosemirror-view';
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
    height: 65px;
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
    ${props => props.disabled && 'cursor: not-allowed;'}
  `;

const ButtonGroup = styled.div`
    > button:not(:last-of-type) {
      margin-right: 8px;
    }
  `;

const handleSubmit = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const className = 'sc-jDwBTQ gADgrc sc-kkGfuU RbheI';


type CommentUIProps = {
  primary;
  disabled: boolean;
  editorView: EditorView;
  close: () => void;
};
let inputComment = '';
let _popUp = null;

const CommentUI = (props: CommentUIProps) => {


  const { editorView, disabled } = props;

  // constructor(props: CommentUIProps) {
  //   super(props);
  //   this.state = {
  //     ...props,
  //   };
  // }
  const setCommentValue = (e: React.ChangeEvent) => {
    inputComment = (e.target as HTMLInputElement).value;
  }

  const cancel = (): void => {
    props.close();
  };

  const postComment = (): void => {
    if ('' === inputComment) {
      return;
    }
    let { tr } = editorView.state;
    const { selection } = editorView.state;
    const comment = inputComment;
    const id = uuidv4();
    const obj = {
      comment,
      timestamp: Math.floor(Date.now()),
    };
    const highLightMarkType = editorView.state.schema.marks['comment'];

    const attrs = {
      conversation: [],
      id: id,
      markFrom: selection.from,
      markTo: selection.to
    };
    attrs.conversation.push(obj);

    tr = tr.addMark(selection.from, selection.to, highLightMarkType.create(attrs));
    if (editorView.dispatch) {
      editorView.dispatch(tr);
      const active = false;
      ReactDOM.render(
        <CommentItemList active={active} data={attrs.conversation} view={editorView} />,
        document.getElementById('commentPlugin')
      );
    }
  };

  return (<Wrapper className={className}>
    <div id="commentUIDiv"
      style={{
        background: '#F1F5FF',
        padding: 'calc(4px * 2) calc(4px * 4)',
        fontSize: '14px',
        lineHeight: 'calc(4px * 4)',
        width: '205px',
        marginLeft: '19px',
        zIndex: '9999'
      }}
    >
      <form onSubmit={handleSubmit}>
        <TextWrapper>
          <ReplyTextArea
            autoFocus
            cols='5'
            onChange={setCommentValue}
            placeholder={'Write comment...'}
          // ref={inputComment}
          // rows='3'
          />
        </TextWrapper>

        <ActionWrapper>
          <ButtonGroup>
            <Button id={'postcomment'}
              onClick={() => postComment()}
              primary
              style={{
                backgroundColor: '#707581',
                border: '0px',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer'                
              }} type="button">
              Post
            </Button>
            <Button onClick={cancel}>
              Cancel
            </Button>
          </ButtonGroup>
        </ActionWrapper>
      </form>
    </div>
  </Wrapper>
  );
}

export default CommentUI;
