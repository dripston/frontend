import { describe, expect, it } from 'vitest';

import { SUGGESTED_PROMPTS, replyTo } from './chat-replies';

describe('replyTo', () => {
  it('answers a structure question', () => {
    expect(replyTo('how is this repo structured?')).toContain('Repository layout');
  });

  it('answers a component question', () => {
    expect(replyTo('show me the model card component')).toContain('model-card.tsx');
  });

  it('answers a security question', () => {
    expect(replyTo('what does the CSP allow?')).toContain('Content Security Policy');
  });

  it('answers a shadcn question', () => {
    expect(replyTo('how do I add a shadcn component?')).toContain('shadcn@latest add');
  });

  it('falls back for anything else', () => {
    expect(replyTo('what is the weather')).toContain('demo assistant');
  });

  it('has a reply for every suggested prompt', () => {
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(replyTo(prompt)).not.toContain('demo assistant');
    }
  });
});
