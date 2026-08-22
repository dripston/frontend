import { cn } from '@/lib/utils';

export function Kicker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-mono text-[11px] tracking-[0.15em] text-primary uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}
