// @flow

import { Schema } from 'prosemirror-model';
import {
  toMarkDOM,
  getMarkAttrs,
} from './CommentHighlightMarkSpec';
import {
  MARK_TEXT_HIGHLIGHT,
  HASCOMMENT,
  MARKFROM
} from './Constants';

const SPEC = 'spec';
const CONTENT = 'content';
const GETATTRS = 'getAttrs';
const PARSEDOM = 'parseDOM';
const TODOM = 'toDOM';
const MARKS = 'marks';

export function effectiveSchema(schema: Schema) {
  if (schema && schema[SPEC]) {
    createCommentMarkAttributes(schema);
  }
  return schema;
}

function createAttribute(content, attr, newAttrs, value) {
  const requiredAttrs = [...newAttrs];
  requiredAttrs.forEach((key) => {
    if (content) {
      let commentAttrSpec = content.attrs[key];
      if (attr && content.attrs && !commentAttrSpec) {
        commentAttrSpec = Object.assign(
          Object.create(Object.getPrototypeOf(attr)),
          attr
        );
        commentAttrSpec.default = value;
        content.attrs[key] = commentAttrSpec;
      }
    }
  });
}

function getContent(type, schema: Schema, nodeAttrs, toDOM) {
  let content = null;
  const contentArr = schema[SPEC][MARKS][CONTENT];
  const len = contentArr.length;
  for (let i = 0; i < len; i += 2) {
    if (type === contentArr[i]) {
      content = contentArr[i + 1];
      // Always append to base calls.
      content[PARSEDOM][0][GETATTRS] = nodeAttrs.bind(
        null,
        content[PARSEDOM][0][GETATTRS]
      );
      content[TODOM] = toDOM.bind(null, content[TODOM]);
      break;
    }
  }
  return content;
}

function getAnExistingAttribute(schema) {
  let existingAttr = null;

  try {
    existingAttr = schema['marks']['link']['attrs']['href'];
  } catch (err) { }

  return existingAttr;
}

function createCommentMarkAttributes(schema: Schema) {
  const textHighlightContent = getContent(
    MARK_TEXT_HIGHLIGHT,
    schema,
    getMarkAttrs,
    toMarkDOM
  );

  const contentArr = [
    textHighlightContent,
    schema.marks[MARK_TEXT_HIGHLIGHT],
  ];

  const existingAttr = getAnExistingAttribute(schema);
  const NEWATTRS = [HASCOMMENT, MARKFROM];

  contentArr.forEach((content) => {
    createAttribute(content, existingAttr, NEWATTRS, null);
  });
}

export const applyEffectiveSchema = effectiveSchema;
