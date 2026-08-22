export type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'link'; value: string; href: string };

export type Block =
  | { kind: 'code'; language: string | null; content: string }
  | { kind: 'heading'; level: 2 | 3; content: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'paragraph'; content: string };

const INLINE_PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^\s)]+)\)/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index;
    if (index > cursor) {
      tokens.push({ kind: 'text', value: text.slice(cursor, index) });
    }

    const [full, code, strong, linkText, href] = match;
    if (code !== undefined) {
      tokens.push({ kind: 'code', value: code });
    } else if (strong !== undefined) {
      tokens.push({ kind: 'strong', value: strong });
    } else if (linkText !== undefined && href !== undefined) {
      tokens.push({ kind: 'link', value: linkText, href });
    }

    cursor = index + full.length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'text', value: text.slice(cursor) });
  }

  return tokens;
}

const FENCE = /^```(\w+)?\s*$/;
const BULLET = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+\.\s+(.*)$/;
const HEADING = /^(#{2,3})\s+(.*)$/;

export function parseBlocks(source: string): Block[] {
  const lines = source.split('\n');
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', content: paragraph.join(' ').trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push({ kind: 'list', ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const fence = FENCE.exec(line);

    if (fence) {
      flushAll();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE.test(lines[index] ?? '')) {
        body.push(lines[index] ?? '');
        index += 1;
      }
      blocks.push({
        kind: 'code',
        language: fence[1] ?? null,
        content: body.join('\n'),
      });
      continue;
    }

    if (line.trim() === '') {
      flushAll();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushAll();
      blocks.push({
        kind: 'heading',
        level: heading[1]?.length === 2 ? 2 : 3,
        content: heading[2] ?? '',
      });
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    if (bullet || ordered) {
      flushParagraph();
      const item = (bullet?.[1] ?? ordered?.[1]) as string;
      const isOrdered = Boolean(ordered);
      if (list && list.ordered === isOrdered) {
        list.items.push(item);
      } else {
        flushList();
        list = { ordered: isOrdered, items: [item] };
      }
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushAll();
  return blocks;
}
