// @flow

import {Node, DOMOutputSpec} from 'prosemirror-model';
import type {KeyValuePair} from './Constants';
import {isTransparent, toCSSColor} from './toCSSColor';

// Always append to base calls.
const HASCOMMENT = 'hasComment';

type toDOMFn = (node: Node) => DOMOutputSpec;
type getAttrsFn = (p: Node | string) => KeyValuePair;

function getAttrs(base: getAttrsFn, dom: HTMLElement) {
  const attrs = base(dom);
  attrs[HASCOMMENT] = dom.getAttribute(HASCOMMENT);

  const {backgroundColor, zIndex} = dom.style;
  const color = toCSSColor(backgroundColor);
  return {
    highlightColor: isTransparent(color) ? '' : color,
    hasComment: zIndex === '1' ? true : false,
    // markFrom: opacity,
  };
}

function toDOM(base: toDOMFn, node: Node) {
  const output = base(node);
  output[1][HASCOMMENT] = node.attrs[HASCOMMENT];
  const {highlightColor, hasComment} = node.attrs;
  let style = '';
  if (highlightColor && hasComment) {
    style += `background-color: ${highlightColor};z-index: 1;`;
    output[1].style = style;
  }
  return output;
}

export const toMarkDOM = toDOM;
export const getMarkAttrs = getAttrs;
