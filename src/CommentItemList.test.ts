import CommentItemList from './CommentItemList';
import React from 'react';
// import { render } from 'enzyme';
// import * as enzyme from 'enzyme';
import { configure, shallow } from 'enzyme';
import { noop } from '@modusoperandi/licit-ui-commands';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const commentTracks = [{
    type: {
        name: 'comment'
    }
}
];

const requiredProps = { getCommentMarkList: commentTracks, };
describe('<CommentItemList />', () => {
    let wrapper;
    let commentItemList;
    const fakeEditorView = {
        focus: noop,
        dispatch: noop,
        state: {
          doc: {
            content: { size: 10 },
            resolve: () => ({ min: () => 0, max: () => 10 }),
          },
          tr: {
            setSelection: () => fakeEditorView.state.tr,
            scrollIntoView: noop,
          },
        },
      };

    beforeEach(() => {
        // provide an empty document just to shut up that warning
    
        // wrapper = shallow(<CommentItemList active={false} data={attrs.conversation} view={fakeEditorView} />);
       // commentItemList = wrapper.instance();

       wrapper = shallow(
            <CommentItemList
            active={false} view={fakeEditorView}
            />,
          )
          .instance() as any as InstanceType<typeof CommentItemList>;

      });

     

    // describe('getCommentMarkList', () => {
    //     xit('should return an array with marks as elements', () => {
    //         const component = render(<CommentItemList {...requiredProps} />);
    //         expect(component).toMatchSnapshot();
    //     });
    // });
});