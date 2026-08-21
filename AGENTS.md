<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Agent rules

Stack: Next.js 16 (App Router) · React · TypeScript strict · Tailwind · shadcn-style primitives in `src/components/ui` · zod-validated env in `src/env.ts` · Playwright in `e2e/` · pnpm workspace.

## 1. Zero comments

Ship code with **no comments at all**.

Forbidden: `//`, `/* */`, JSDoc/TSDoc, `#` in config files, section-divider banners, `TODO` / `FIXME` / `NOTE` / `HACK`, commented-out code, "explain the obvious" lines, and file-header blocks.

Allowed, because they are functional rather than explanatory:

- `"use client"`, `"use server"`, `"server-only"`, `"client-only"` directives (these are not comments)
- `@ts-expect-error` and `eslint-disable-next-line` — only when the alternative is worse, and never a bare `@ts-ignore`
- The `nextjs-agent-rules` block above
- License headers that a dependency legally requires

When you edit an existing file, delete every comment in the parts you touch. When explicitly asked to strip comments, strip them repo-wide, including in JSON/YAML/config where the format permits.

Because there are no comments, meaning must live in the code:

- Names carry intent. `isStale`, not `flag`. `revalidateInvoiceList`, not `handler2`.
- Extract a named function or a named const instead of writing a comment that explains a block.
- Encode constraints in types: unions, branded types, `satisfies`, zod schemas. A type that makes the invalid state unrepresentable replaces the comment that warned about it.
- Anything that genuinely needs prose goes in `README.md`, `.env.example`, or the PR body — not in source.

## 2. Token discipline

Optimise for output tokens spent per unit of working code.

**Editing**

- Make surgical edits. Never re-emit an entire file to change a few lines.
- Never print a file back to the user after writing it. They can open it.
- Read only what you need: search for the symbol, open the range. Don't read a directory to "get oriented."
- Batch independent reads and searches into one round instead of serialising them.
- Don't re-read a file you just wrote.

**Talking**

- No preamble ("Great question!", "I'll start by…"), no postamble ("Let me know if…").
- No summary of what you did unless asked. The diff is the summary.
- No restating the request back.
- No emoji, no decorative headers, no congratulating yourself.
- Answer in the fewest words that are still complete. One line is a valid answer.
- When you must explain, explain the _why_ that isn't visible in the diff, and stop.

**Working**

- Ask at most one clarifying question, and only when a wrong guess is expensive. Otherwise pick the reasonable default and note the assumption in one line.
- Don't add dependencies, abstractions, config, or "future-proofing" nobody asked for.
- Stop when the task is done. Don't volunteer adjacent refactors.
- Fix root causes, not symptoms. A retry loop over a race condition costs more tokens forever.

## 3. Rendering architecture

The default is a Server Component. `"use client"` is an opt-out that must be justified.

**Reach for `"use client"` only when the component needs**: `useState`/`useReducer`, `useEffect`, event handlers, browser APIs, refs to DOM nodes, or a client-only library.

**Boundary rules**

- Push `"use client"` to the leaves. A client component's entire import graph ships to the browser — a client wrapper at the layout level makes the whole page client-rendered.
- Keep server subtrees inside client components by passing them as `children` or props. A client component can render server-rendered children it receives; it just cannot import them.
- Props crossing the boundary must be serialisable. No functions, class instances, `Date` in dubious shapes, or fat objects. Pass IDs and the minimum fields the UI renders.
- `src/lib/logger.ts`, DB clients, and anything reading `serverSchema` from `src/env.ts` are server-only. Guard them with the `server-only` import so a mistaken client import fails at build time, not at runtime.
- Client code may read `NEXT_PUBLIC_*` values only, and only through the `clientSchema` export.

**Choosing a strategy per route**

| Content                                           | Strategy                                                   |
| ------------------------------------------------- | ---------------------------------------------------------- |
| Same for every visitor, changes rarely            | Static, prerendered at build                               |
| Same for everyone, changes on a schedule or event | Static + revalidation, invalidated by tag                  |
| Static shell, small per-request region            | Stream the dynamic region inside `Suspense`                |
| Per-user or per-request throughout                | Dynamic render                                             |
| Depends on device state after hydration           | Server-render a stable shell, hydrate the interactive part |

Verify the exact caching and prerender APIs for this Next version in `node_modules/next/dist/docs/` before using them — the names and defaults moved in 16.

**Data**

- Fetch on the server, in the component that renders the data. Don't lift every fetch to the page and prop-drill.
- Never fetch initial data from a `useEffect`. That is a network waterfall plus a layout shift.
- Parallelise independent requests with `Promise.all`. Sequential `await`s are only for genuine dependencies.
- Wrap slow sections in `Suspense` so the shell streams immediately. Skeletons must match the real content's dimensions — a skeleton that causes CLS is worse than a spinner.
- Dedupe at the data layer, not by caching in React state.

**Mutations**

- Server Actions for writes. Route handlers only for webhooks, third-party callbacks, and non-browser clients.
- Validate every action input with zod inside the action. The client is untrusted, always.
- Authorise inside the action. Never rely on the UI having hidden the button.
- Invalidate precisely by tag or path, then let the server re-render. Don't hand-patch client caches.
- Use the framework's pending/optimistic hooks for feedback; no manual `isLoading` booleans that drift from reality.

## 4. Performance

Treat these as build-failing budgets, not aspirations:

- LCP < 2.0s, INP < 200ms, CLS < 0.1 on a mid-tier mobile device
- First-load JS per route ≤ 120 KB gzipped
- Zero layout shift from images, fonts, or async content

Rules that keep them true:

- Every image goes through `next/image` with intrinsic dimensions or `fill` + `sizes`. `priority` only on the LCP element — never more than one per route.
- Fonts through `next/font`, subset, self-hosted, `display: swap`. No font CDN links.
- Third-party scripts via `next/script` with a deferred strategy. Any analytics or widget that blocks the main thread gets challenged before it gets added.
- No barrel files (`index.ts` re-export hubs). They defeat tree-shaking and slow the compiler.
- Import per-symbol from large libraries. Prefer the platform: `Intl` over a date-formatting library, CSS over an animation runtime, `fetch` over a client wrapper.
- Dynamically import heavy client-only widgets (editors, charts, maps) at their point of use.
- Before adding any dependency: state what it costs in KB and why the platform can't do it.

## 5. Structure and conventions

```
src/
  app/           routes, layouts, loading, error, not-found, route handlers
  components/
    ui/          presentational primitives — no data fetching, no app imports
    *            shared feature components
  lib/           logger, site-config, utils, pure domain logic
  env.ts         zod-validated env, single source of truth
```

- Route-specific components live in the route folder. Promote to `src/components` only on the second real consumer.
- `src/components/ui` stays generic and dependency-light: it may import `cn` and Radix-style primitives, nothing from `app/` or `lib/logger`.
- Files and folders `kebab-case`. Components `PascalCase`. One exported component per file.
- Every route segment that can fail gets `error.tsx`; every segment with a slow boundary gets `loading.tsx`.
- Log through `src/lib/logger.ts`. `console.log` never lands in a commit.
- TypeScript: no `any`, no non-null `!` without a preceding guard, no `React.FC`. Type props explicitly, infer locals, use `satisfies` for config objects.
- Tailwind only, composed through `cn`. Use the design tokens defined in `globals.css` — no raw hex values, no arbitrary one-off spacing, no inline `style` except for genuinely computed values.
- Mobile-first breakpoints. Dark mode through the existing theme provider's class strategy.
- Accessibility is part of done: semantic elements before ARIA, every control keyboard-reachable, visible `focus-visible` state, labelled inputs, `prefers-reduced-motion` respected.
- UI copy: sentence case, active voice, plain verbs. A button's label matches the result it produces. Errors say what happened and what to do next.

## 6. Definition of done

Before you report finished:

1. `pnpm typecheck` clean
2. `pnpm lint` clean
3. `pnpm build` clean
4. No comments introduced anywhere in the diff
5. No new client boundaries that could have stayed on the server
6. No new dependency without a stated reason
7. Any version-specific API used was confirmed against `node_modules/next/dist/docs/`
