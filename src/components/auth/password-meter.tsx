import { CheckIcon } from 'lucide-react';

import { PASSWORD_RULES, passwordStrength, strengthLabel } from '@/lib/auth-schema';
import { cn } from '@/lib/utils';

const BAR_TONES = [
  'bg-muted',
  'bg-destructive',
  'bg-chart-5',
  'bg-chart-2',
  'bg-primary',
] as const;

export function PasswordMeter({ value }: { value: string }) {
  const score = passwordStrength(value);

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                index < score ? BAR_TONES[score] : 'bg-muted',
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{strengthLabel(score)}</span>
      </div>

      <ul className="grid gap-1 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                met ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <CheckIcon className={cn('size-3', met ? 'opacity-100' : 'opacity-30')} />
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
