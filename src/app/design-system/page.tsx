'use client';
import React, { useState } from 'react';
import { Check, Copy, ChevronDown, Search, Mail, type LucideProps } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * DESIGN SYSTEM REFERENCE
 * Every value on this page is read from the CSS custom properties already
 * defined in your globals.css — background, foreground, card, popover,
 * primary, secondary, muted, accent, destructive, border, input, ring,
 * chart-1..5, sidebar-*, font-sans/mono, the --radius scale, and the
 * --shadow scale. Nothing is introduced that isn't already in your config.
 */

// ---------- shared bits ----------

const Section = ({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 border-b border-border py-14">
    <div className="mb-8">
      <p className="mb-2 font-mono text-[11px] tracking-[0.15em] text-primary uppercase">
        {kicker}
      </p>
      <h2 className="text-2xl text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

const Swatch = ({
  name,
  varName,
  bgClass,
  textClass = 'text-foreground',
}: {
  name: string;
  varName: string;
  bgClass: string;
  textClass?: string;
}) => (
  <div className="flex flex-col overflow-hidden rounded-lg border border-border">
    <div className={`flex h-16 items-end p-2.5 ${bgClass}`}>
      <span className={`font-mono text-[10px] opacity-80 ${textClass}`}>{varName}</span>
    </div>
    <div className="bg-card px-2.5 py-2">
      <p className="text-xs font-medium text-card-foreground">{name}</p>
    </div>
  </div>
);

const CopyChip = ({ label }: { label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(label);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {label}
    </button>
  );
};

// ---------- badge ----------

const badgeTones = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'bg-transparent text-foreground border border-border',
  destructive: 'bg-destructive/15 text-destructive',
  muted: 'bg-muted text-muted-foreground',
};

const Badge = ({
  tone = 'secondary',
  children,
}: {
  tone?: keyof typeof badgeTones;
  children: React.ReactNode;
}) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-1 font-mono text-[11px] font-medium tracking-wide ${badgeTones[tone]}`}
  >
    {children}
  </span>
);

// ---------- card ----------

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-xl border border-border bg-card p-5 text-card-foreground ${className}`}
  >
    {children}
  </div>
);

// ---------- form controls ----------

const Input = ({
  placeholder,
  icon: Icon,
}: {
  placeholder: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
}) => (
  <div className="relative">
    {Icon && (
      <Icon
        size={16}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
    )}
    <input
      placeholder={placeholder}
      className={`h-10 w-full ${Icon ? 'pl-9' : 'pl-3'} rounded-lg border border-input bg-background pr-3 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring`}
    />
  </div>
);

const Toggle = ({ defaultOn = false }: { defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative h-6 w-10 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-input'}`}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform"
        style={{ transform: on ? 'translateX(16px)' : 'translateX(2px)' }}
      />
    </button>
  );
};

// ---------- token data (mirrors globals.css exactly) ----------

const baseColors = [
  { name: 'background', varName: '--background', bgClass: 'bg-background' },
  {
    name: 'foreground',
    varName: '--foreground',
    bgClass: 'bg-foreground',
    textClass: 'text-background',
  },
  { name: 'card', varName: '--card', bgClass: 'bg-card' },
  { name: 'popover', varName: '--popover', bgClass: 'bg-popover' },
  { name: 'border', varName: '--border', bgClass: 'bg-border' },
  { name: 'input', varName: '--input', bgClass: 'bg-input' },
  { name: 'ring', varName: '--ring', bgClass: 'bg-ring', textClass: 'text-background' },
];

const roleColors = [
  {
    name: 'primary',
    varName: '--primary',
    bgClass: 'bg-primary',
    textClass: 'text-primary-foreground',
  },
  {
    name: 'secondary',
    varName: '--secondary',
    bgClass: 'bg-secondary',
    textClass: 'text-secondary-foreground',
  },
  {
    name: 'muted',
    varName: '--muted',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
  },
  {
    name: 'accent',
    varName: '--accent',
    bgClass: 'bg-accent',
    textClass: 'text-accent-foreground',
  },
  {
    name: 'destructive',
    varName: '--destructive',
    bgClass: 'bg-destructive',
    textClass: 'text-destructive-foreground',
  },
];

const chartColors = [1, 2, 3, 4, 5].map((n) => ({
  name: `chart-${n}`,
  varName: `--chart-${n}`,
  bgClass: `bg-chart-${n}`,
  textClass: 'text-white',
}));

const sidebarColors = [
  { name: 'sidebar', varName: '--sidebar', bgClass: 'bg-sidebar' },
  {
    name: 'sidebar-primary',
    varName: '--sidebar-primary',
    bgClass: 'bg-sidebar-primary',
    textClass: 'text-sidebar-primary-foreground',
  },
  {
    name: 'sidebar-accent',
    varName: '--sidebar-accent',
    bgClass: 'bg-sidebar-accent',
    textClass: 'text-sidebar-accent-foreground',
  },
  { name: 'sidebar-border', varName: '--sidebar-border', bgClass: 'bg-sidebar-border' },
];

const radiusScale = [
  ['sm', 'rounded-sm', 'calc(var(--radius) * 0.6)'],
  ['md', 'rounded-md', 'calc(var(--radius) * 0.8)'],
  ['lg', 'rounded-lg', 'var(--radius)'],
  ['xl', 'rounded-xl', 'calc(var(--radius) * 1.4)'],
  ['2xl', 'rounded-2xl', 'calc(var(--radius) * 1.8)'],
  ['3xl', 'rounded-3xl', 'calc(var(--radius) * 2.2)'],
  ['4xl', 'rounded-4xl', 'calc(var(--radius) * 2.6)'],
] as const;

const shadowScale = ['2xs', 'xs', 'sm', 'DEFAULT', 'md', 'lg', 'xl', '2xl'] as const;

const navItems = [
  ['colors', 'Colors'],
  ['charts', 'Charts'],
  ['sidebar', 'Sidebar'],
  ['type', 'Typography'],
  ['radius', 'Radius'],
  ['shadow', 'Shadow'],
  ['buttons', 'Buttons'],
  ['forms', 'Forms'],
  ['cards', 'Cards'],
];

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight">Design system</span>
          <nav className="hidden items-center gap-5 md:flex">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <p className="mb-3 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
          Reference — reads live from globals.css
        </p>
        <h1 className="mb-3 max-w-xl text-4xl font-semibold tracking-tight">
          Your tokens
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Every swatch, radius, and shadow below is your configured value, not a stand-in.
        </p>
      </div>

      <main className="mx-auto max-w-5xl px-6">
        {/* COLORS */}
        <Section id="colors" kicker="01" title="Base & role colors">
          <p className="mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Base
          </p>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
            {baseColors.map((c) => (
              <Swatch key={c.varName} {...c} />
            ))}
          </div>
          <p className="mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Roles
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {roleColors.map((c) => (
              <Swatch key={c.varName} {...c} />
            ))}
          </div>
        </Section>

        {/* CHARTS */}
        <Section id="charts" kicker="02" title="Chart colors">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {chartColors.map((c) => (
              <Swatch key={c.varName} {...c} />
            ))}
          </div>
        </Section>

        {/* SIDEBAR */}
        <Section id="sidebar" kicker="03" title="Sidebar">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sidebarColors.map((c) => (
              <Swatch key={c.varName} {...c} />
            ))}
          </div>
        </Section>

        {/* TYPE */}
        <Section id="type" kicker="04" title="Typography">
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge tone="default">font-sans — Geist</Badge>
            <Badge tone="secondary">font-mono — Geist Mono</Badge>
          </div>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-[100px_1fr] items-baseline gap-6 py-4">
              <span className="font-mono text-[11px] text-muted-foreground">
                4xl / sans
              </span>
              <span className="font-sans text-4xl font-semibold">Design, precisely</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-baseline gap-6 py-4">
              <span className="font-mono text-[11px] text-muted-foreground">
                2xl / sans
              </span>
              <span className="font-sans text-2xl font-semibold">Design, precisely</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-baseline gap-6 py-4">
              <span className="font-mono text-[11px] text-muted-foreground">
                base / sans
              </span>
              <span className="font-sans text-base">The quick brown fox jumps.</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-baseline gap-6 py-4">
              <span className="font-mono text-[11px] text-muted-foreground">
                sm / sans
              </span>
              <span className="font-sans text-sm text-muted-foreground">
                The quick brown fox jumps.
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-baseline gap-6 py-4">
              <span className="font-mono text-[11px] text-muted-foreground">
                sm / mono
              </span>
              <span className="font-mono text-sm">const value = 1024;</span>
            </div>
          </div>
        </Section>

        {/* RADIUS */}
        <Section id="radius" kicker="05" title="Radius scale">
          <p className="mb-4 text-sm text-muted-foreground">
            Base{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              --radius: 0.5rem
            </code>
            , every step below is a multiple of it.
          </p>
          <div className="flex flex-wrap items-end gap-5">
            {radiusScale.map(([label, cls]) => (
              <div key={label} className="text-center">
                <div className={`h-14 w-14 bg-primary ${cls} mb-2`} />
                <span className="font-mono text-[11px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* SHADOW */}
        <Section id="shadow" kicker="06" title="Shadow scale">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {shadowScale.map((s) => (
              <div
                key={s}
                className="flex h-20 items-center justify-center rounded-lg border border-border bg-card"
                style={{ boxShadow: `var(--shadow-${s === 'DEFAULT' ? '' : s})` }}
              >
                <span className="font-mono text-[11px] text-muted-foreground">
                  {s === 'DEFAULT' ? 'shadow' : `shadow-${s}`}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* BUTTONS */}
        <Section id="buttons" kicker="07" title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Section>

        {/* FORMS */}
        <Section id="forms" kicker="08" title="Forms">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Input placeholder="Search…" icon={Search} />
              <Input placeholder="you@company.com" icon={Mail} />
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <span className="text-sm">Email notifications</span>
                <Toggle defaultOn />
              </div>
            </div>
            <div>
              <p className="mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Select
              </p>
              <button className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground">
                Production environment
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
              <p className="mt-6 mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Copy token
              </p>
              <CopyChip label="--primary" />
            </div>
          </div>
        </Section>

        {/* CARDS */}
        <Section id="cards" kicker="09" title="Cards">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <Badge tone="secondary">Live</Badge>
              <p className="mt-4 mb-1 text-lg font-semibold">2,481</p>
              <p className="text-sm text-muted-foreground">Active sessions</p>
            </Card>
            <Card>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                  <span className="font-mono text-xs font-medium text-secondary-foreground">
                    JD
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Jordan Diaz</p>
                  <p className="text-xs text-muted-foreground">Product design</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Reviewed the token audit and approved the changes.
              </p>
            </Card>
            <Card className="border-primary bg-primary text-primary-foreground">
              <p className="mb-1 text-lg font-semibold">Configure</p>
              <p className="text-sm opacity-80">Set defaults for your workspace.</p>
            </Card>
          </div>
        </Section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-mono text-[11px] text-muted-foreground">
          Design system — reads from globals.css
        </p>
      </footer>
    </div>
  );
}
