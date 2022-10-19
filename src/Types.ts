

export type MarkSpec = {
  attrs?: { [key: string]: unknown },
  name?: string,
  inline:boolean,
  group:string,
  parseDOM: Array<unknown>,
  toDOM: (node: unknown) => Array<unknown>,
};
