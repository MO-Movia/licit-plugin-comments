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
    const n = p('bold');
    const newNode = toMarkDOM(mockToDOM, n);

    expect(newNode).not.toBe(n);
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
    const n = p('bold');
    const newNode = toMarkDOM(mockToDOM, n);

    expect(newNode).not.toBe(n);
  });

  xit('toMarkDOM without props', () => {
    const mockToDOM = jest.fn((_node) => {
      return {
        0: 'one',
      };
    });
    const n = p('bold');
    const newNode = toMarkDOM(mockToDOM, n);

    expect(newNode).not.toBe(n);
  });

  const mockGetAttrs = jest.fn((dom) => {
    return {
      hasComment: dom.getAttribute('hasComment'),
      markFrom: dom.getAttribute('markFrom'),
    };
  });

  const getSpan = (color) => {
    const span = document.createElement('span');
    span.setAttribute('hasComment', 'true');
    span.setAttribute('markFrom', '1');
    span.style.backgroundColor = color;
    span.style.zIndex = '1';
    span.style.opacity = '0.25';
    return span;
  };

  it('getMarkAttrs transparent', () => {
    const span = getSpan('transparent');

    expect(getMarkAttrs(mockGetAttrs, span)).not.toBe({
      highlightColor: '',
      hasComment: true,
      markFrom: 1,
    });
  });

  it('getMarkAttrs solid color', () => {
    const span = getSpan('#c40df2');

    expect(getMarkAttrs(mockGetAttrs, span)).not.toBe({
      highlightColor: '',
      hasComment: true,
      markFrom: 1,
    });
  });
});
