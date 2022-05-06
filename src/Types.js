// @flow

export type MarkSpec = {
  attrs?: ?{ [key: string]: any },
  name?: ?string,
  parseDOM: Array<any>,
  toDOM: (node: any) => Array<any>,
};
