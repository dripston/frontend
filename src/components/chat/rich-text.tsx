import { parseBlocks, parseInline, type InlineToken } from '@/lib/chat-format';
import { cn } from '@/lib/utils';

function Inline({ tokens }: { tokens: InlineToken[] }) {
  return (
    <>
      {tokens.map((token, index) => {
        const key = `${token.kind}-${index}`;

        if (token.kind === 'code') {
          return (
            <code
              key={key}
              className="rounded-[0.3rem] bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {token.value}
            </code>
          );
        }

        if (token.kind === 'strong') {
          return (
            <strong key={key} className="font-semibold text-foreground">
              {token.value}
            </strong>
          );
        }

        if (token.kind === 'link') {
          return (
            <a
              key={key}
              href={token.href}
              className="text-primary underline underline-offset-4 hover:opacity-80"
            >
              {token.value}
            </a>
          );
        }

        return <span key={key}>{token.value}</span>;
      })}
    </>
  );
}

export function RichText({ source, className }: { source: string; className?: string }) {
  const blocks = parseBlocks(source);

  return (
    <div className={cn('space-y-3 text-sm leading-relaxed', className)}>
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`;

        if (block.kind === 'code') {
          return (
            <figure
              key={key}
              className="overflow-hidden rounded-xl border border-border bg-muted/60"
            >
              {block.language ? (
                <figcaption className="border-b border-border/70 px-3 py-1.5 font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                  {block.language}
                </figcaption>
              ) : null}
              <pre className="overflow-x-auto p-3">
                <code className="font-mono text-[0.8rem] leading-relaxed">
                  {block.content}
                </code>
              </pre>
            </figure>
          );
        }

        if (block.kind === 'heading') {
          const Tag = block.level === 2 ? 'h2' : 'h3';
          return (
            <Tag
              key={key}
              className={cn(
                'font-semibold tracking-tight text-foreground',
                block.level === 2 ? 'text-base' : 'text-sm',
              )}
            >
              <Inline tokens={parseInline(block.content)} />
            </Tag>
          );
        }

        if (block.kind === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul';
          return (
            <Tag
              key={key}
              className={cn(
                'space-y-1.5 pl-5',
                block.ordered ? 'list-decimal' : 'list-disc',
                'marker:text-muted-foreground',
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline tokens={parseInline(item)} />
                </li>
              ))}
            </Tag>
          );
        }

        return (
          <p key={key}>
            <Inline tokens={parseInline(block.content)} />
          </p>
        );
      })}
    </div>
  );
}
