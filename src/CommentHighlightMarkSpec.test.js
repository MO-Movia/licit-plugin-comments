import {p} from 'jest-prosemirror';
import {toMarkDOM, getMarkAttrs} from './CommentHighlightMarkSpec';

fdescribe('CommentHighlightMarkSpec', () => {
  it('toMarkDOM with properties', () => {
    const mockToDOM = jest.fn((node) => {
      node.attrs['hasComment'] = true;
      node.attrs['markFrom'] = 12;
      node.attrs['highlightColor'] = 'green';
      return {
        0: 'one',
        1: {hasComment: true, markFrom: 11, style: 'color: blue'},
      };
    });
    const node = p('bold');
    const newNode = toMarkDOM(mockToDOM, node);

    expect(newNode).not.toBe(node);
  });

  it('toMarkDOM without properties', () => {
    const mockToDOM = jest.fn((node) => {
      node.attrs['hasComment'] = true;
      node.attrs['markFrom'] = 12;
      node.attrs['highlightColor'] = 'green';
      return {
        0: 'one',
        1: {hasComment: false, markFrom: 0, style: 'color: blue'},
      };
    });
    const node = p('bold');
    const newNode = toMarkDOM(mockToDOM, node);

    expect(newNode).not.toBe(node);
  });

  xit('toMarkDOM without props', () => {
    const mockToDOM = jest.fn((node) => {
      return {
        0: 'one',
      };
    });
    const node = p('bold');
    const newNode = toMarkDOM(mockToDOM, node);

    expect(newNode).not.toBe(node);
  });

  it('getMarkAttrs transparent', () => {
    const mockGetAttrs = jest.fn((dom) => {
      return {
        hasComment: dom.getAttribute('hasComment'),
        markFrom: dom.getAttribute('markFrom'),
      };
    });
    const dom = document.createElement('span');
    dom.setAttribute('hasComment', 'true');
    dom.setAttribute('markFrom', '1');
    dom.style.backgroundColor = 'transparent';
    dom.style.zIndex = '1';
    dom.style.opacity = '0.25';

    expect(getMarkAttrs(mockGetAttrs, dom)).not.toBe({
      highlightColor: '',
      hasComment: true,
      markFrom: 1,
    });
  });

  it('getMarkAttrs solid color', () => {
    const mockGetAttrs = jest.fn((dom) => {
      return {
        hasComment: dom.getAttribute('hasComment'),
        markFrom: dom.getAttribute('markFrom'),
      };
    });
    const dom = document.createElement('span');
    dom.setAttribute('hasComment', 'true');
    dom.setAttribute('markFrom', '1');
    dom.style.backgroundColor = '#c40df2';
    dom.style.zIndex = '2';
    dom.style.opacity = '0.25';

    expect(getMarkAttrs(mockGetAttrs, dom)).not.toBe({
      highlightColor: '',
      hasComment: true,
      markFrom: 1,
    });
  });
});
