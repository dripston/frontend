'use client';

import {
  SwordsIcon,
  TrophyIcon,
  BarChart3Icon,
  SparklesIcon,
  RotateCcwIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { avatarGradient, compactNumber, initials } from '@/lib/format';
import { cn } from '@/lib/utils';

type ArenaPhase = 'setup' | 'battle' | 'results';

type DummyModel = {
  id: string;
  org: string;
  name: string;
  category: string;
  parameters: string;
  downloads: number;
};

type BattleMetric = {
  label: string;
  left: number;
  right: number;
};

type BattleResult = {
  leftScore: number;
  rightScore: number;
  metrics: BattleMetric[];
  leftResponse: string;
  rightResponse: string;
  winner: 'left' | 'right' | 'tie';
  reasoning: string;
};

const DUMMY_MODELS: DummyModel[] = [
  {
    id: 'openai/gpt-4o',
    org: 'openai',
    name: 'gpt-4o',
    category: 'LLM',
    parameters: '200B',
    downloads: 124000,
  },
  {
    id: 'anthropic/claude-3',
    org: 'anthropic',
    name: 'claude-3-opus',
    category: 'LLM',
    parameters: '175B',
    downloads: 98500,
  },
  {
    id: 'meta/llama-3',
    org: 'meta',
    name: 'llama-3-70b',
    category: 'LLM',
    parameters: '70B',
    downloads: 210000,
  },
  {
    id: 'google/gemini-pro',
    org: 'google',
    name: 'gemini-pro',
    category: 'Multimodal',
    parameters: '180B',
    downloads: 87000,
  },
  {
    id: 'stability/sdxl',
    org: 'stability',
    name: 'sdxl-turbo',
    category: 'Image gen',
    parameters: '3.5B',
    downloads: 156000,
  },
  {
    id: 'mistral/mixtral',
    org: 'mistral',
    name: 'mixtral-8x7b',
    category: 'LLM',
    parameters: '46.7B',
    downloads: 134000,
  },
  {
    id: 'deepseek/coder',
    org: 'deepseek',
    name: 'coder-v2',
    category: 'LLM',
    parameters: '236B',
    downloads: 72000,
  },
  {
    id: 'cohere/command',
    org: 'cohere',
    name: 'command-r-plus',
    category: 'LLM',
    parameters: '104B',
    downloads: 45000,
  },
  {
    id: 'qwen/qwen2',
    org: 'qwen',
    name: 'qwen2-72b',
    category: 'LLM',
    parameters: '72B',
    downloads: 63000,
  },
  {
    id: 'nvidia/nemotron',
    org: 'nvidia',
    name: 'nemotron-4-340b',
    category: 'LLM',
    parameters: '340B',
    downloads: 38000,
  },
];

const DUMMY_USE_CASES = [
  'Build a chatbot that handles customer support queries with high accuracy',
  'Classify medical documents into diagnostic categories',
  'Generate photorealistic product images for an e-commerce catalog',
  'Translate legal contracts between English and French',
  'Summarize long financial reports into key bullet points',
  'Write unit tests for a complex TypeScript codebase',
  'Analyze sentiment in social media posts about a brand',
  'Extract structured data from unstructured invoices',
];

const DUMMY_RESPONSES = [
  `I'll help you with that request. Here's my analysis:\n\n**Key Points:**\n1. The input has been processed through multiple reasoning layers\n2. Contextual understanding was applied to disambiguate ambiguous terms\n3. A structured response was generated based on the most relevant training patterns\n\nThe response demonstrates strong comprehension of the domain-specific terminology and provides actionable insights.`,
  `Let me address your query step by step.\n\n**Analysis:**\n- Identified the core intent behind the request\n- Applied chain-of-thought reasoning to break down complex elements\n- Generated a response that balances detail with clarity\n\n**Result:** The output maintains factual accuracy while being concise and well-organized for the intended audience.`,
  `Processing your request through the inference pipeline.\n\n**Steps completed:**\n1. Input tokenization and embedding\n2. Contextual encoding with attention mechanism\n3. Decoding with temperature sampling (t=0.7)\n4. Output formatting and quality check\n\n**Results:**\n- Processing time: 142ms\n- Token efficiency: 0.89\n- Relevance score: 92%\n\nThe model successfully handled the query with strong performance across all evaluation dimensions.`,
  `Task execution summary:\n\n**Pipeline:**\n- Pre-processing: input normalized and validated\n- Core inference: 6-layer transformer with cross-attention\n- Post-processing: output structured and verified\n\n**Performance:**\n- Latency: 98ms\n- Throughput: 1,247 tokens/sec\n- Accuracy: 94.2% on held-out benchmark\n\nOutput generated successfully with high confidence.`,
  `Here's what I found:\n\n**Response Quality:**\n- Coherence score: 91%\n- Factual accuracy: 87%\n- Readability: Grade 10 level\n\n**Strengths:**\n- Excellent handling of domain-specific terminology\n- Clear and structured output format\n- Appropriate level of detail for the use case\n\nOverall, a solid response that addresses the core requirements effectively.`,
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateBattleResult(
  left: DummyModel,
  right: DummyModel,
  useCase: string,
): BattleResult {
  const seed =
    useCase.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) +
    left.id.length * 31 +
    right.id.length * 17;
  const rand = seededRandom(seed);

  const metricLabels = ['Relevance', 'Accuracy', 'Clarity', 'Completeness', 'Speed'];
  const metrics: BattleMetric[] = metricLabels.map((label) => ({
    label,
    left: Math.round(70 + rand() * 28),
    right: Math.round(70 + rand() * 28),
  }));

  const leftAvg = metrics.reduce((sum, m) => sum + m.left, 0) / metrics.length;
  const rightAvg = metrics.reduce((sum, m) => sum + m.right, 0) / metrics.length;

  const leftIdx = Math.floor(rand() * DUMMY_RESPONSES.length);
  const rightIdx = Math.floor(rand() * DUMMY_RESPONSES.length);
  const leftResponse = DUMMY_RESPONSES[leftIdx] ?? '';
  const rightResponse = DUMMY_RESPONSES[rightIdx] ?? '';

  const diff = Math.abs(leftAvg - rightAvg);
  let winner: 'left' | 'right' | 'tie';
  let reasoning: string;

  if (diff < 2) {
    winner = 'tie';
    reasoning = `Both models performed nearly identically across all metrics. Neither demonstrated a clear advantage for this use case.`;
  } else if (leftAvg > rightAvg) {
    winner = 'left';
    const strengths = metrics
      .filter((m) => m.left > m.right)
      .map((m) => m.label.toLowerCase())
      .slice(0, 2)
      .join(' and ');
    reasoning = `${left.name} scored higher overall, particularly in ${strengths}. It handled the use case with greater precision.`;
  } else {
    winner = 'right';
    const strengths = metrics
      .filter((m) => m.right > m.left)
      .map((m) => m.label.toLowerCase())
      .slice(0, 2)
      .join(' and ');
    reasoning = `${right.name} showed stronger performance, especially in ${strengths}. Its approach was better suited for this task.`;
  }

  return {
    leftScore: leftAvg,
    rightScore: rightAvg,
    metrics,
    leftResponse,
    rightResponse,
    winner,
    reasoning,
  };
}

function pickOpponents(): [DummyModel, DummyModel] {
  const shuffled = [...DUMMY_MODELS].sort(() => Math.random() - 0.5);
  const a = shuffled[0];
  const b = shuffled[1];
  if (!a || !b) throw new Error('Not enough models');
  return [a, b];
}

function ModelAvatar({ model }: { model: DummyModel }) {
  const [from, to] = avatarGradient(model.org);
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-lg text-[0.65rem] font-semibold text-white"
      style={{ backgroundImage: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      {initials(model.org)}
    </span>
  );
}

function ScoreBar({
  left,
  right,
  label,
  animate,
}: {
  left: number;
  right: number;
  label: string;
  animate: boolean;
}) {
  const total = left + right;
  const leftPct = total > 0 ? (left / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-primary tabular-nums">{left}</span>
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="text-primary tabular-nums">{right}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700',
            animate ? 'opacity-100' : 'opacity-0',
          )}
          style={{ width: animate ? `${leftPct}%` : '50%' }}
        />
      </div>
    </div>
  );
}

function ResponseCard({
  model,
  response,
  score,
  isWinner,
  show,
}: {
  model: DummyModel;
  response: string;
  score: number;
  isWinner: boolean;
  show: boolean;
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-500',
        isWinner && show ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border',
      )}
    >
      {isWinner && show && (
        <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <TrophyIcon className="size-3" />
          Winner
        </div>
      )}
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2.5">
          <ModelAvatar model={model} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-medium">
              <span className="text-muted-foreground">{model.org}/</span>
              {model.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[10px]">
                {model.category}
              </Badge>
              <span>{model.parameters}</span>
              <span aria-hidden="true">·</span>
              <span>{compactNumber(model.downloads)} downloads</span>
            </div>
          </div>
          {show && (
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {score.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground">/ 100</p>
            </div>
          )}
        </div>

        <Separator />

        {show ? (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Model response
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-card-foreground">
              {response}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoaderDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-primary"
          style={{
            animation: 'thinking-bounce 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ArenaArena() {
  const [useCase, setUseCase] = useState('');
  const [phase, setPhase] = useState<ArenaPhase>('setup');
  const [opponents, setOpponents] = useState<[DummyModel, DummyModel] | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [showResponses, setShowResponses] = useState(false);
  const [metricsRevealed, setMetricsRevealed] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startBattle = useCallback(() => {
    const pair = pickOpponents();
    setOpponents(pair);
    setResult(null);
    setShowResponses(false);
    setMetricsRevealed(0);
    setShowScores(false);
    setElapsed(0);
    setPhase('battle');

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const battleResult = generateBattleResult(
      pair[0],
      pair[1],
      useCase || 'default task',
    );

    setTimeout(() => {
      setResult(battleResult);

      let step = 0;
      const revealInterval = setInterval(() => {
        step += 1;
        setMetricsRevealed(step);
        if (step >= battleResult.metrics.length) {
          clearInterval(revealInterval);
          setTimeout(() => {
            setShowScores(true);
            setTimeout(() => {
              setShowResponses(true);
              setPhase('results');
              if (timerRef.current) clearInterval(timerRef.current);
            }, 800);
          }, 400);
        }
      }, 350);
    }, 1500);
  }, [useCase]);

  const reset = useCallback(() => {
    setPhase('setup');
    setOpponents(null);
    setResult(null);
    setShowResponses(false);
    setMetricsRevealed(0);
    setShowScores(false);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const randomUseCase = useCallback(() => {
    const pick =
      DUMMY_USE_CASES[Math.floor(Math.random() * DUMMY_USE_CASES.length)] ?? '';
    setUseCase(pick);
  }, []);

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {phase === 'setup' && (
        <Card className="border-border">
          <CardContent className="space-y-5 p-5">
            <div className="space-y-2">
              <Label htmlFor="use-case" className="text-sm font-medium">
                Describe your use case
              </Label>
              <Textarea
                id="use-case"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g. Build a customer support chatbot that handles product returns and FAQ queries..."
                className="min-h-24"
              />
              <button
                type="button"
                onClick={randomUseCase}
                className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
              >
                <SparklesIcon className="size-3" />
                Try a random use case
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <BarChart3Icon className="size-3.5" />
                {DUMMY_MODELS.length} models ready to compete
              </span>
              <Button onClick={startBattle}>
                <SwordsIcon className="size-4" />
                Start Arena
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase !== 'setup' && opponents && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
                <SwordsIcon className="size-4 text-primary" />
                <span className="text-sm font-medium">
                  {phase === 'results' ? 'Battle complete' : 'Battle in progress'}
                </span>
              </div>
              {phase === 'results' && (
                <Badge variant="secondary" className="rounded-md font-mono">
                  {formatElapsed(elapsed)}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcwIcon className="size-3.5" />
              New battle
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Use case
            </p>
            <p className="text-sm text-card-foreground">
              {useCase || 'General purpose evaluation'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <ResponseCard
                model={opponents[0]}
                response={result?.leftResponse ?? ''}
                score={result?.leftScore ?? 0}
                isWinner={result?.winner === 'left'}
                show={showResponses}
              />
            </div>
            <div>
              <ResponseCard
                model={opponents[1]}
                response={result?.rightResponse ?? ''}
                score={result?.rightScore ?? 0}
                isWinner={result?.winner === 'right'}
                show={showResponses}
              />
            </div>
          </div>

          {!result && (
            <div className="flex justify-center py-4">
              <LoaderDots />
            </div>
          )}

          {metricsRevealed > 0 && result && (
            <Card className="animate-rise-in border-border">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <BarChart3Icon className="size-4 text-primary" />
                  <h3 className="text-sm font-medium">Score breakdown</h3>
                </div>

                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                  <span className="font-mono font-medium">{opponents[0].name}</span>
                  <span className="font-mono font-medium">{opponents[1].name}</span>
                </div>

                <div className="space-y-3">
                  {result.metrics.slice(0, metricsRevealed).map((metric) => (
                    <ScoreBar
                      key={metric.label}
                      left={metric.left}
                      right={metric.right}
                      label={metric.label}
                      animate={showScores}
                    />
                  ))}
                </div>

                {metricsRevealed < result.metrics.length && (
                  <div className="flex justify-center py-2">
                    <LoaderDots />
                  </div>
                )}

                {showScores && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground tabular-nums">
                          {result.leftScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">avg score</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={cn(
                            'flex size-10 items-center justify-center rounded-full transition-all duration-500',
                            result.winner === 'tie'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary',
                          )}
                        >
                          {result.winner === 'tie' ? (
                            <span className="text-lg">🤝</span>
                          ) : (
                            <TrophyIcon className="size-5" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {result.winner === 'tie' ? 'Tie' : 'Winner'}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground tabular-nums">
                          {result.rightScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">avg score</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showResponses && result && (
            <Card className="animate-rise-in border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-2">
                  <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Judge verdict</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {result.reasoning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
