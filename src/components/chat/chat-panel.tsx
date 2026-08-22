'use client';

import {
  ArrowLeftIcon,
  ArrowUpIcon,
  SparklesIcon,
  SquareIcon,
  Loader2Icon,
  ShieldCheckIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { RichText } from '@/components/chat/rich-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SUGGESTED_PROMPTS } from '@/lib/chat-replies';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  grounded?: boolean;
  llmUsed?: boolean;
  notice?: string | null;
  errored?: boolean;
};

type StreamLine =
  | { type: 'metadata'; grounded?: boolean; llm_used?: boolean; notice?: string | null }
  | { type: 'chunk'; content: string }
  | { type: 'error'; content: string };

function ThinkingDots() {
  return (
    <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Loader2Icon className="size-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">Thinking...</span>
      </div>
    </div>
  );
}

/**
 * Reads a fetch Response body as NDJSON: newline-delimited JSON objects,
 * possibly split across chunk boundaries by the underlying transport.
 * Calls `onLine` for every complete JSON object as soon as it's available.
 */
async function readNdjsonStream(
  response: Response,
  onLine: (line: StreamLine) => void,
  signal: AbortSignal,
) {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      if (signal.aborted) {
        await reader.cancel();
        return;
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Only split on *complete* lines; keep any trailing partial line in
      // the buffer so a chunk boundary mid-JSON-object doesn't break parsing.
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) continue;
        try {
          onLine(JSON.parse(trimmed) as StreamLine);
        } catch {
          // Skip malformed lines rather than killing the whole stream.
          console.warn('Skipping malformed NDJSON line:', trimmed);
        }
      }
    }

    // Flush any trailing content left in the buffer after the stream ends.
    const trailing = buffer.trim();
    if (trailing) {
      try {
        onLine(JSON.parse(trailing) as StreamLine);
      } catch {
        console.warn('Skipping malformed trailing NDJSON line:', trailing);
      }
    }
  } finally {
    reader.releaseLock?.();
  }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);

  const inputId = useId();
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, streaming]);

  const send = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || streaming) return;

      const stamp = Date.now();
      const assistantId = `a-${stamp}`;

      setDraft('');
      setStreaming(true);

      setMessages((current) => [
        ...current,
        { id: `u-${stamp}`, role: 'user', content: trimmed },
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      const patchAssistant = (patch: Partial<Message>) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, ...patch } : message,
          ),
        );
      };

      try {
        const history = messages.map(({ role, content }) => ({ role, content }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmed, history }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        let accumulated = '';

        await readNdjsonStream(
          response,
          (line) => {
            if (line.type === 'metadata') {
              patchAssistant({
                grounded: line.grounded,
                llmUsed: line.llm_used,
                notice: line.notice ?? null,
              });
            } else if (line.type === 'chunk') {
              accumulated += line.content;
              // Functional update so we always append to the latest state,
              // even across many rapid chunks.
              patchAssistant({ content: accumulated });
            } else if (line.type === 'error') {
              patchAssistant({ errored: true, content: accumulated || line.content });
            }
          },
          controller.signal,
        );

        if (!accumulated && !controller.signal.aborted) {
          patchAssistant({
            content: 'Sorry, I could not generate a response.',
            errored: true,
          });
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          // User stopped generation; leave whatever content has streamed so far.
        } else {
          console.error('Chat error:', error);
          patchAssistant({
            content: 'An error occurred while fetching the response.',
            errored: true,
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [streaming, messages],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const empty = messages.length === 0;

  return (
    <div className="flex h-dvh w-full flex-col px-4">
      <header className="flex items-center gap-3 py-4">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/" />}
          aria-label="Back to models"
        >
          <ArrowLeftIcon />
        </Button>
        <h1 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <SparklesIcon className="size-4 text-primary" />
          Assistant
        </h1>
        <Badge
          variant="secondary"
          className="ml-auto font-mono text-[0.7rem] font-normal"
        >
          live
        </Badge>
      </header>

      <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto pb-6">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="space-y-2">
              <div className="gradient-ring mx-auto size-12 rounded-full">
                <div className="grid size-full place-items-center rounded-full bg-card">
                  <SparklesIcon className="size-5 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                Ask about this repository
              </h2>
              <p className="text-sm text-muted-foreground">
                Streaming answers from the concierge service.
              </p>
            </div>

            <ul className="grid w-full gap-2 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => send(prompt)}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent/50"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="space-y-5">
            {messages.map((message) => (
              <li
                key={message.id}
                className={cn(
                  'flex animate-rise-in gap-3',
                  message.role === 'user' && 'justify-end',
                )}
              >
                {message.role === 'assistant' ? (
                  <span className="gradient-ring mt-0.5 size-7 shrink-0 rounded-full">
                    <span className="grid size-full place-items-center rounded-full bg-card">
                      <SparklesIcon className="size-3.5 text-primary" />
                    </span>
                  </span>
                ) : null}

                <div
                  className={cn(
                    'min-w-0',
                    message.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm whitespace-pre-wrap text-primary-foreground'
                      : 'flex-1 space-y-2',
                  )}
                >
                  {message.role === 'assistant' && message.grounded ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheckIcon className="size-3" />
                      Verified Data
                    </span>
                  ) : null}

                  {message.role === 'user' ? (
                    message.content
                  ) : message.content === '' ? (
                    <ThinkingDots />
                  ) : (
                    <RichText source={message.content} />
                  )}

                  {message.role === 'assistant' && message.notice ? (
                    <p className="text-xs text-muted-foreground">{message.notice}</p>
                  ) : null}
                </div>
              </li>
            ))}
            <div ref={endRef} />
          </ul>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl pb-5">
        <div className="group gradient-ring focus-within:[animation-duration:2.5s]">
          <span
            className="gradient-ring-glow group-focus-within:opacity-70"
            aria-hidden="true"
          />
          <div className="flex items-end gap-2 rounded-[calc(var(--radius)*1.8-1.5px)] bg-card p-2">
            <label htmlFor={inputId} className="sr-only">
              Message the assistant
            </label>
            <Textarea
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              placeholder="Ask anything about this repo…"
              className="max-h-40 min-h-9 resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />

            {streaming ? (
              <Button
                type="button"
                size="icon"
                onClick={stop}
                aria-label="Stop generating"
              >
                <SquareIcon className="fill-current" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                onClick={() => send(draft)}
                disabled={draft.trim() === ''}
                aria-label="Send message"
              >
                <ArrowUpIcon />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
          Enter to send, Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
