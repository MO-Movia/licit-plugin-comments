// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import { grid, th } from '@pubsweet/ui-toolkit';
import { v4 as uuidv4 } from 'uuid';
import CommentItemList from './CommentItemList';

class CommentUI extends React.PureComponent<any, any> {
  _popUp = null;
  inputComment = '';

  constructor(props: any) {
    super(props);
    this.state = {
      ...props,
    };
  }

  setCommentValue(e: any) {
    this.inputComment = e.target.value;
  }

  cancel = (): void => {
    this.props.close();
  };

  postComment = (): void => {
    if ('' === this.inputComment) {
      return;
    }
    let { tr } = this.state.editorView.state;
    const { selection } = this.state.editorView.state;
    const comment = this.inputComment;
    const id = uuidv4();
    const obj = {
      comment,
      timestamp: Math.floor(Date.now()),
    };
    const highLightMarkType = this.state.editorView.state.schema.marks['comment'];

    const attrs = {
      conversation: [],
      id: id,
      markFrom: selection.from,
      markTo: selection.to
    };
    attrs.conversation.push(obj);

    tr = tr.addMark(selection.from, selection.to, highLightMarkType.create(attrs));
    if (this.state.editorView.dispatch) {
      this.state.editorView.dispatch(tr);
      const active = false;
      ReactDOM.render(
        <CommentItemList active={active} data={attrs.conversation} view={this.state.editorView} />,
        document.getElementById('commentPlugin')
      );
    }
  };

  render(): React.Element<any> {
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
    border: 3px solid ${th('colorBackgroundTabs')};
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
  
    ${props => props.primary && primary}
    ${props => props.disabled && 'cursor: not-allowed;'}
  `;

    const ButtonGroup = styled.div`
    > button:not(:last-of-type) {
      margin-right: 8px;
    }
  `;

    const handleSubmit = e => {
      e.preventDefault();
      e.stopPropagation();
    };

    const className = 'sc-jDwBTQ gADgrc sc-kkGfuU RbheI';
    return <Wrapper className={className}>
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
              onChange={this.setCommentValue.bind(this)}
              placeholder={'Write comment...'}
              ref={this.inputComment}
              rows='3'
              style={{ border: '1px solid #584848', height: '65px' }}
            />
          </TextWrapper>

          <ActionWrapper>
            <ButtonGroup>
              <Button id={'postcomment'}
                onClick={this.postComment.bind(this)} primary
                style={{ backgroundColor: '#707581' }} type="button">
                Post
              </Button>
              <Button onClick={this.cancel}>
                Cancel
              </Button>
            </ButtonGroup>
          </ActionWrapper>
        </form>
      </div>
    </Wrapper>;
  }
}

export default CommentUI;
