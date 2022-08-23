import CommentItemList from './CommentItemList';
import React from 'react';
import * as enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({adapter: new Adapter()});

const commentTracks = [
  {
    type: {
      name: 'comment',
    },
  },
];

const requiredProps = {getCommentMarkList: commentTracks};
describe('commentItemList', () => {
  describe('getCommentMarkList', () => {
    xit('should return an array with marks as elements', () => {
      const component = enzyme.render(<CommentItemList {...requiredProps} />);
      expect(component).toMatchSnapshot();
    });
  });
});