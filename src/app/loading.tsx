export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center"
    >
      <span className="sr-only">Loading</span>
      <div
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"
      />
    </div>
  );
}
