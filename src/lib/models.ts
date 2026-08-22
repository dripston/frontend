import type {
  ModelCategory,
  ModelFormat,
  ModelFramework,
  ModelPrecision,
  ModelPlatform,
  ModelPricing,
  ModelTrainingMethod,
} from '@/zod-schema/upload-model-schema';

export const MODEL_CATEGORIES = [
  'llm',
  'multimodal',
  'computer-vision',
  'image-generation',
  'audio',
  'speech',
  'embedding',
  'classification',
  'other',
] as const satisfies readonly ModelCategory[];

export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  llm: 'LLM',
  multimodal: 'Multimodal',
  'computer-vision': 'Computer vision',
  'image-generation': 'Image generation',
  audio: 'Audio',
  speech: 'Speech',
  embedding: 'Embedding',
  classification: 'Classification',
  other: 'Other',
};

export const FORMAT_LABELS: Record<ModelFormat, string> = {
  safetensors: 'Safetensors',
  pytorch: 'PyTorch',
  onnx: 'ONNX',
  gguf: 'GGUF',
  tensorflow: 'TensorFlow',
  checkpoint: 'Checkpoint',
  other: 'Other',
};

export const FRAMEWORK_LABELS: Record<ModelFramework, string> = {
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  jax: 'JAX',
  transformers: 'Transformers',
  diffusers: 'Diffusers',
  onnx: 'ONNX Runtime',
  timm: 'timm',
  other: 'Other',
};

export const PRECISION_LABELS: Record<ModelPrecision, string> = {
  fp32: 'FP32',
  fp16: 'FP16',
  bf16: 'BF16',
  int8: 'INT8',
  int4: 'INT4',
  mixed: 'Mixed',
  other: 'Other',
};

export const TRAINING_METHOD_LABELS: Record<ModelTrainingMethod, string> = {
  pretraining: 'Pretraining',
  'fine-tuning': 'Fine-tuning',
  lora: 'LoRA',
  qlora: 'QLoRA',
  distillation: 'Distillation',
  'reinforcement-learning': 'Reinforcement learning',
  other: 'Other',
};

export const PRICING_TYPE_LABELS = {
  free: 'Free',
  'hourly': 'Hourly',
  subscription: 'Monthly subscription',
  'usage-based': 'Usage-based',
};

export const PLATFORM_LABELS: Record<ModelPlatform, string> = {
  linux: 'Linux',
  windows: 'Windows',
  macos: 'macOS',
  docker: 'Docker',
  other: 'Other',
};

export type ModelSummary = {
  id: string;
  org: string;
  name: string;
  task: string;
  category: ModelCategory;
  niche: string;
  parameters: string;
  format: ModelFormat;
  license: string;
  pricing: ModelPricing;
  updatedAt: string;
  downloads: number;
  likes: number;
  inference: boolean;
  base: boolean;
  verified: boolean;
};

export const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'downloads', label: 'Most downloads' },
  { value: 'likes', label: 'Most likes' },
  { value: 'name', label: 'Name A–Z' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export function priceLabel(pricing: ModelPricing): string {
  if (pricing.type === 'free' || !pricing.price) return 'Free';

  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pricing.currency,
    maximumFractionDigits: pricing.price < 1 ? 4 : 2,
  }).format(pricing.price);

  return `${amount} · ${PRICING_TYPE_LABELS[pricing.type].toLowerCase()}`;
}

const sizeFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function dataSize(gigabytes: number): string {
  if (gigabytes >= 1) return `${sizeFormatter.format(gigabytes)} GB`;
  if (gigabytes >= 1 / 1024) return `${sizeFormatter.format(gigabytes * 1024)} MB`;
  return `${sizeFormatter.format(Math.max(gigabytes * 1024 * 1024, 0.01))} KB`;
}

export function tokenCount(value: number): string {
  if (value >= 1000) {
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value / 1000)}k tokens`;
  }
  return `${value} tokens`;
}
