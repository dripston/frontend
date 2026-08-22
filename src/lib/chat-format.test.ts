import { describe, expect, it } from 'vitest';

import { parseBlocks, parseInline } from './chat-format';

describe('parseInline', () => {
  it('returns plain text untouched', () => {
    expect(parseInline('hello there')).toEqual([{ kind: 'text', value: 'hello there' }]);
  });

  it('extracts inline code', () => {
    expect(parseInline('run `pnpm dev` now')).toEqual([
      { kind: 'text', value: 'run ' },
      { kind: 'code', value: 'pnpm dev' },
      { kind: 'text', value: ' now' },
    ]);
  });

  it('extracts bold text', () => {
    expect(parseInline('**bold** tail')).toEqual([
      { kind: 'strong', value: 'bold' },
      { kind: 'text', value: ' tail' },
    ]);
  });

  it('extracts links', () => {
    expect(parseInline('see [docs](https://example.com)')).toEqual([
      { kind: 'text', value: 'see ' },
      { kind: 'link', value: 'docs', href: 'https://example.com' },
    ]);
  });

  it('handles several tokens in one line', () => {
    const tokens = parseInline('`a` and **b** and [c](/d)');
    expect(tokens.map((token) => token.kind)).toEqual([
      'code',
      'text',
      'strong',
      'text',
      'link',
    ]);
  });

  it('returns nothing for an empty string', () => {
    expect(parseInline('')).toEqual([]);
  });
});

describe('parseBlocks', () => {
  it('reads a paragraph', () => {
    expect(parseBlocks('one line')).toEqual([{ kind: 'paragraph', content: 'one line' }]);
  });

  it('joins wrapped lines into one paragraph', () => {
    expect(parseBlocks('one\ntwo')).toEqual([{ kind: 'paragraph', content: 'one two' }]);
  });

  it('splits paragraphs on a blank line', () => {
    expect(parseBlocks('one\n\ntwo')).toEqual([
      { kind: 'paragraph', content: 'one' },
      { kind: 'paragraph', content: 'two' },
    ]);
  });

  it('reads a fenced code block with a language', () => {
    expect(parseBlocks('```ts\nconst a = 1;\n```')).toEqual([
      { kind: 'code', language: 'ts', content: 'const a = 1;' },
    ]);
  });

  it('reads a fenced code block without a language', () => {
    expect(parseBlocks('```\nplain\n```')).toEqual([
      { kind: 'code', language: null, content: 'plain' },
    ]);
  });

  it('keeps blank lines inside a code block', () => {
    const [block] = parseBlocks('```\na\n\nb\n```');
    expect(block).toEqual({ kind: 'code', language: null, content: 'a\n\nb' });
  });

  it('reads headings', () => {
    expect(parseBlocks('## Title\n### Sub')).toEqual([
      { kind: 'heading', level: 2, content: 'Title' },
      { kind: 'heading', level: 3, content: 'Sub' },
    ]);
  });

  it('groups bullet items into one list', () => {
    expect(parseBlocks('- one\n- two')).toEqual([
      { kind: 'list', ordered: false, items: ['one', 'two'] },
    ]);
  });

  it('groups ordered items separately from bullets', () => {
    expect(parseBlocks('- one\n1. two')).toEqual([
      { kind: 'list', ordered: false, items: ['one'] },
      { kind: 'list', ordered: true, items: ['two'] },
    ]);
  });

  it('separates a list from following prose', () => {
    expect(parseBlocks('- one\ntail')).toEqual([
      { kind: 'list', ordered: false, items: ['one'] },
      { kind: 'paragraph', content: 'tail' },
    ]);
  });

  it('handles a mixed document', () => {
    const blocks = parseBlocks('## Head\n\nintro\n\n- a\n- b\n\n```js\nx()\n```\n\nend');
    expect(blocks.map((block) => block.kind)).toEqual([
      'heading',
      'paragraph',
      'list',
      'code',
      'paragraph',
    ]);
  });

  it('returns nothing for empty input', () => {
    expect(parseBlocks('')).toEqual([]);
  });
});
