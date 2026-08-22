import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';

import { Kicker } from '@/components/kicker';
import { ModeToggle } from '@/components/mode-toggle';
import { siteConfig } from '@/lib/site-config';

export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      {/* Visual Section - Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-zinc-950 p-10 relative overflow-hidden text-white dark:bg-background">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/30 rounded-full blur-[120px] animate-[aurora-drift_8s_ease-in-out_infinite_alternate]" />
          <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-accent/20 rounded-full blur-[100px] animate-[aurora-drift_10s_ease-in-out_infinite_alternate_reverse]" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-semibold tracking-tight text-white dark:text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <SparklesIcon className="size-5 text-blue-400" />
            </div>
            {siteConfig.name}
          </Link>
        </div>
        
        <div className="relative z-10 animate-rise-in max-w-md">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Build smarter, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">deploy faster.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Join thousands of developers using our next-generation platform to browse and deploy cutting-edge AI models.
          </p>
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex w-full lg:w-1/2 flex-col bg-background relative">
        <header className="absolute top-0 w-full flex items-center justify-between p-6 z-20">
          <Link
            href="/"
            className="flex lg:hidden items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <SparklesIcon className="size-4 text-primary" />
            </div>
            {siteConfig.name}
          </Link>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-6 sm:p-12 relative overflow-hidden">
          {/* Subtle background glow for right side */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="w-full max-w-[440px] animate-rise-in relative z-10">
            <div className="mb-10 text-center lg:text-left">
              <Kicker className="mb-4 inline-flex">{kicker}</Kicker>
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-primary/5 relative">
              {/* Form Content */}
              {children}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
