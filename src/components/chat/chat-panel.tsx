'use client';

import { ArrowLeftIcon, ArrowUpIcon, SparklesIcon, SquareIcon } from 'lucide-react';
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
};

const STREAM_STEPS = 24;

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 py-1" role="status" aria-label="Thinking">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 rounded-full bg-muted-foreground"
          style={{
            animation: 'thinking-bounce 1.2s ease-in-out infinite',
            animationDelay: `${dot * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

export function ChatPanel({ streamMs = 500 }: { streamMs?: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);

  const inputId = useId();
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, streaming]);

  const send = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || streaming) return;

      const stamp = Date.now();

      setDraft('');
      setStreaming(true);

      // Update UI with user message immediately
      setMessages((current) => [
        ...current,
        { id: `u-${stamp}`, role: 'user', content: trimmed },
        { id: `a-${stamp}`, role: 'assistant', content: '' },
      ]);

      try {
        const history = messages.map(({ role, content }) => ({ role, content }));
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmed, history }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        const answer = data.reply || 'Sorry, I could not generate a response.';

        // Simulate streaming for the response
        const step = Math.max(1, Math.ceil(answer.length / STREAM_STEPS));
        for (let index = 1; index <= STREAM_STEPS; index += 1) {
          const timer = setTimeout(
            () => {
              const slice = answer.slice(0, index * step);
              setMessages((current) =>
                current.map((message) =>
                  message.id === `a-${stamp}` ? { ...message, content: slice } : message,
                ),
              );
              if (index === STREAM_STEPS) setStreaming(false);
            },
            (streamMs / STREAM_STEPS) * index,
          );
          timers.current.push(timer);
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((current) =>
          current.map((message) =>
            message.id === `a-${stamp}`
              ? { ...message, content: 'An error occurred while fetching the response.' }
              : message,
          ),
        );
        setStreaming(false);
      }
    },
    [streaming, streamMs, messages],
  );

  const stop = useCallback(() => {
    clearTimers();
    setStreaming(false);
    setMessages((current) =>
      current.map((message, index) =>
        index === current.length - 1 && message.content === ''
          ? { ...message, content: 'Stopped.' }
          : message,
      ),
    );
  }, [clearTimers]);

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
          demo
        </Badge>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
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
                Canned answers for now — swap in your model provider when you are ready.
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
                      : 'flex-1',
                  )}
                >
                  {message.role === 'user' ? (
                    message.content
                  ) : message.content === '' ? (
                    <ThinkingDots />
                  ) : (
                    <RichText source={message.content} />
                  )}
                </div>
              </li>
            ))}
            <div ref={endRef} />
          </ul>
        )}
      </div>

      <div className="pb-5">
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
