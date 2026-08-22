import { hueFromString } from '@/lib/format';
import type { Model } from '@/lib/models';

export type ModelFile = {
  name: string;
  size: string;
  lfs: boolean;
};

export type EvalResult = {
  suite: string;
  dataset: string | null;
  score: number;
};

export type ModelDetail = {
  library: string;
  format: string;
  architecture: string;
  license: string;
  tensorType: string;
  followers: number;
  contextLength: string;
  card: string;
  files: ModelFile[];
  tree: { adapters: number; finetunes: number; merges: number; quantizations: number };
  spaces: string[];
  evals: EvalResult[];
  downloadTrend: number[];
};

const LIBRARIES = ['Transformers', 'Diffusers', 'MLX', 'llama.cpp'];
const FORMATS = ['Safetensors', 'GGUF', 'MLX'];
const LICENSES = ['apache-2.0', 'mit', 'llama3.1', 'cc-by-nc-4.0'];
const TENSOR_TYPES = ['BF16', 'FP8', 'F32', 'Q4_K_M'];

const EVAL_SUITES = [
  { suite: 'Idavidrein/gpqa', dataset: 'Diamond' },
  { suite: 'ScaleAI/SWE-bench_Pro', dataset: 'SWE Bench Pro' },
  { suite: 'datacurve/deep-swe', dataset: 'Deep Swe' },
  { suite: 'internlm/WildClawBench', dataset: null },
  { suite: 'cais/hle', dataset: 'Hle' },
  { suite: 'claw-eval/Claw-Eval', dataset: 'Multimodal' },
];

function seeded(seed: number, index: number, span: number): number {
  return (seed * 9301 + index * 49297 + 233280) % span;
}

function downloadWalk(seed: number, length: number): number[] {
  let state = (Math.imul(seed + 1, 2654435761) + 1) >>> 0;
  let level = 30 + (seed % 25);
  const points: number[] = [];

  for (let index = 0; index < length; index += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const drift = (state / 4294967296 - 0.42) * 16;
    level = Math.min(95, Math.max(6, level + drift));
    points.push(Math.round(level));
  }

  return points;
}

function architectureFor(model: Model): string {
  const base = model.name.split('-')[0] ?? model.name;
  return `${base.toLowerCase().replace(/[^a-z0-9]/g, '_')}_arch`;
}

function cardFor(model: Model, detail: Omit<ModelDetail, 'card'>): string {
  const full = `${model.org}/${model.name}`;

  return `This repository contains model weights and configuration files for **${full}**, published in the ${detail.library} format.

## Model overview

- Task: ${model.task}
- Parameters: ${model.params ?? 'not published'}
- Tensor type: ${detail.tensorType}
- Context length: ${detail.contextLength}
- License: ${detail.license}

## Usage

Load the model with the ${detail.library} library:

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("${full}")
tokenizer = AutoTokenizer.from_pretrained("${full}")
\`\`\`

## Serving

For production workloads use a dedicated serving engine rather than the reference implementation:

1. vLLM for high-throughput batched inference
2. SGLang for structured generation
3. TokenSpeed for low-latency single-stream decoding

Sampling defaults are \`temperature=0.7\`, \`top_p=0.8\` and \`top_k=20\`. Support for individual sampling parameters varies by framework.

## Notes

This description is placeholder content generated from the model record. Replace it with the card returned by the backend once the API is wired up.`;
}

export function buildModelDetail(model: Model): ModelDetail {
  const seed = hueFromString(model.id);
  const pick = <T>(list: T[], index: number): T =>
    list[seeded(seed, index, list.length)] as T;

  const partial: Omit<ModelDetail, 'card'> = {
    library: pick(LIBRARIES, 1),
    format: pick(FORMATS, 2),
    architecture: architectureFor(model),
    license: pick(LICENSES, 3),
    tensorType: pick(TENSOR_TYPES, 4),
    followers: 1_000 + seeded(seed, 5, 99_000),
    contextLength: `${[8, 32, 128, 262][seeded(seed, 6, 4)]}k tokens`,
    files: [
      { name: 'config.json', size: '1.4 kB', lfs: false },
      { name: 'model.safetensors', size: `${1 + seeded(seed, 7, 40)}.2 GB`, lfs: true },
      { name: 'tokenizer.json', size: '11.4 MB', lfs: true },
      { name: 'tokenizer_config.json', size: '7.3 kB', lfs: false },
      { name: 'README.md', size: '9.1 kB', lfs: false },
    ],
    tree: {
      adapters: seeded(seed, 8, 60),
      finetunes: seeded(seed, 9, 200),
      merges: seeded(seed, 10, 12),
      quantizations: seeded(seed, 11, 800),
    },
    spaces: [
      `${model.org.toLowerCase()}/${model.name}-demo`,
      `community/${model.name}-playground`,
      `evals/${model.name}-benchmark`,
    ],
    evals: EVAL_SUITES.map((entry, index) => ({
      ...entry,
      score: Math.round((20 + seeded(seed, 12 + index, 700) / 10) * 10) / 10,
    })),
    downloadTrend: downloadWalk(seed, 24),
  };

  return { ...partial, card: cardFor(model, partial) };
}
