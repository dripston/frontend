export const SUGGESTED_PROMPTS = [
  'How is this repo structured?',
  'Show me the model card component',
  'What does the CSP allow?',
  'How do I add a shadcn component?',
] as const;

const REPLIES: { match: RegExp; body: string }[] = [
  {
    match: /structure|repo|folder|architecture/i,
    body: `## Repository layout

The app follows the App Router conventions with a thin, testable core.

- \`src/app\` — routes, layouts and error boundaries
- \`src/components/ui\` — shadcn primitives, owned in-repo
- \`src/lib\` — pure logic: formatters, data and helpers
- \`src/env.ts\` — Zod-validated environment

Pure logic lives in \`src/lib\`, so routes and components stay thin.`,
  },
  {
    match: /model ?card|card component/i,
    body: `The card lives at \`src/components/models/model-card.tsx\` and takes a single prop:

\`\`\`tsx
<ModelCard model={model} />
\`\`\`

It renders the org avatar, the \`org/name\` heading, a metadata row and the model **id** badge. The avatar colour is derived from the org name with \`hueFromString\`, so no image assets are needed.`,
  },
  {
    match: /csp|security|header/i,
    body: `## Content Security Policy

The policy is a static header in \`next.config.ts\`:

\`\`\`
default-src 'self'
script-src 'self' 'unsafe-inline'
object-src 'none'
frame-ancestors 'none'
\`\`\`

It allows inline script because the pages are statically prerendered, and a nonce can only be issued per request. See **SECURITY.md** for the full reasoning and how to switch to a nonce policy.`,
  },
  {
    match: /shadcn|add (a |an )?component|install/i,
    body: `Run the CLI and the component is written straight into \`src/components/ui\`:

\`\`\`bash
pnpm dlx shadcn@latest add dialog
\`\`\`

The components are **yours** once generated — edit them directly. This project is built on Base UI, so composition uses a \`render\` prop:

\`\`\`tsx
<Button nativeButton={false} render={<Link href="/chat" />}>Open chat</Button>
\`\`\``,
  },
];

const FALLBACK = `I am a demo assistant wired to canned responses, so I can only cover a few topics right now.

Try asking about:

1. The repository structure
2. The model card component
3. The Content Security Policy
4. Adding a shadcn component

To make this real, replace \`replyTo\` in \`src/lib/chat-replies.ts\` with a call to a route handler that talks to your model provider.`;

export function replyTo(prompt: string): string {
  return REPLIES.find((reply) => reply.match.test(prompt))?.body ?? FALLBACK;
}
