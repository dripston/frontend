'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, type Path } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { uploadModelAction } from '@/app/seller-upload-model/actions';
import { modelUploadSchema } from '@/zod-schema/upload-model-schema';

type UploadFormValues = {
  basicInfo: {
    name: string;
    description: string;
    category:
      | 'llm'
      | 'computer-vision'
      | 'audio'
      | 'multimodal'
      | 'embedding'
      | 'image-generation'
      | 'speech'
      | 'classification'
      | 'other';
    endpoint_url: string;
    declared_niche: string;
    task: string;
    tags: string;
    version: string;
  };
  files: {
    modelFiles: Array<{ name: string; size: string; path: string; type: string }>;
    modelFormat:
      'safetensors' | 'pytorch' | 'onnx' | 'gguf' | 'tensorflow' | 'checkpoint' | 'other';
    totalSize: string;
  };
  technical: {
    framework:
      | 'pytorch'
      | 'tensorflow'
      | 'jax'
      | 'transformers'
      | 'diffusers'
      | 'onnx'
      | 'timm'
      | 'other';
    architecture: string;
    parameters: string;
    precision: 'fp32' | 'fp16' | 'bf16' | 'int8' | 'int4' | 'mixed' | 'other';
    contextLength: string;
    vramRequirement: string;
    ramRequirement: string;
    gpuRequired: boolean;
    supportedHardware: string;
    supportedPlatforms: Array<'linux' | 'windows' | 'macos' | 'docker' | 'other'>;
  };
  training: {
    baseModel: string;
    trainingMethod:
      | 'pretraining'
      | 'fine-tuning'
      | 'lora'
      | 'qlora'
      | 'distillation'
      | 'reinforcement-learning'
      | 'other';
    datasetName: string;
    datasetSize: string;
    datasetSource: string;
    trainingEpochs: string;
    learningRate: string;
    batchSize: string;
    trainingHardware: string;
    trainingTime: string;
  };
  evaluation: {
    benchmarks: Array<{ name: string; score: string; metric: string; dataset: string }>;
    latency: string;
    throughput: string;
    evaluationNotes: string;
  };
  usage: {
    installationInstructions: string;
    inferenceExample: string;
    inputFormat: string;
    outputFormat: string;
    dependencies: string;
    pythonVersion: string;
    frameworkVersion: string;
  };
  license: {
    modelLicense: string;
    datasetLicense: string;
    commercialUse: boolean;
    redistributionAllowed: boolean;
    attributionRequired: boolean;
    licenseNotes: string;
    ownershipConfirmation: boolean;
  };
  pricing: {
    type: 'free' | 'one-time' | 'subscription' | 'usage-based';
    price: string;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR';
    refundPolicy: string;
  };
  modelCard: {
    overview: string;
    intendedUse: string;
    limitations: string;
    safetyNotes: string;
    biasNotes: string;
    citation: string;
  };
};

type SupportedPlatform = UploadFormValues['technical']['supportedPlatforms'][number];

const DEFAULT_VALUES: UploadFormValues = {
  basicInfo: {
    name: '',
    description: '',
    category: 'llm',
    endpoint_url: '',
    declared_niche: '',
    task: '',
    tags: '',
    version: '1.0.0',
  },
  files: {
    modelFiles: [{ name: '', size: '', path: '', type: '' }],
    modelFormat: 'safetensors',
    totalSize: '',
  },
  technical: {
    framework: 'pytorch',
    architecture: '',
    parameters: '',
    precision: 'fp16',
    contextLength: '',
    vramRequirement: '',
    ramRequirement: '',
    gpuRequired: false,
    supportedHardware: '',
    supportedPlatforms: [],
  },
  training: {
    baseModel: '',
    trainingMethod: 'fine-tuning',
    datasetName: '',
    datasetSize: '',
    datasetSource: '',
    trainingEpochs: '',
    learningRate: '',
    batchSize: '',
    trainingHardware: '',
    trainingTime: '',
  },
  evaluation: {
    benchmarks: [],
    latency: '',
    throughput: '',
    evaluationNotes: '',
  },
  usage: {
    installationInstructions: '',
    inferenceExample: '',
    inputFormat: '',
    outputFormat: '',
    dependencies: '',
    pythonVersion: '',
    frameworkVersion: '',
  },
  license: {
    modelLicense: '',
    datasetLicense: '',
    commercialUse: false,
    redistributionAllowed: false,
    attributionRequired: false,
    licenseNotes: '',
    ownershipConfirmation: false,
  },
  pricing: {
    type: 'free',
    price: '',
    currency: 'USD',
    refundPolicy: '',
  },
  modelCard: {
    overview: '',
    intendedUse: '',
    limitations: '',
    safetyNotes: '',
    biasNotes: '',
    citation: '',
  },
};

const SUPPORTED_PLATFORM_OPTIONS: Array<{ value: SupportedPlatform; label: string }> = [
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'docker', label: 'Docker' },
  { value: 'other', label: 'Other' },
];

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${className ?? ''}`}
      {...props}
    >
      {children}
    </select>
  );
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRequiredNumber(value: string): number {
  return Number(value.trim());
}

function toArray(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function findMessage(errors: unknown, path: string): string | undefined {
  const target = path.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, errors);
  if (!target || typeof target !== 'object') return undefined;
  const message = (target as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function FormField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      <ErrorText message={error} />
    </div>
  );
}

export function ModelUploadForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UploadFormValues>({ defaultValues: DEFAULT_VALUES });

  const modelFiles = useFieldArray({ control, name: 'files.modelFiles' });
  const benchmarks = useFieldArray({ control, name: 'evaluation.benchmarks' });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    const payload = {
      basicInfo: {
        name: values.basicInfo.name,
        description: values.basicInfo.description,
        category: values.basicInfo.category,
        endpoint_url: values.basicInfo.endpoint_url,
        declared_niche: values.basicInfo.declared_niche,
        task: values.basicInfo.task,
        tags: toArray(values.basicInfo.tags),
        version: values.basicInfo.version,
      },
      files: {
        modelFiles: values.files.modelFiles.map((file) => ({
          name: file.name,
          size: parseRequiredNumber(file.size),
          path: file.path,
          type: file.type || undefined,
        })),
        modelFormat: values.files.modelFormat,
        totalSize: parseRequiredNumber(values.files.totalSize),
      },
      technical: {
        framework: values.technical.framework,
        architecture: values.technical.architecture,
        parameters: values.technical.parameters,
        precision: values.technical.precision,
        contextLength: parseOptionalNumber(values.technical.contextLength),
        vramRequirement: parseOptionalNumber(values.technical.vramRequirement),
        ramRequirement: parseOptionalNumber(values.technical.ramRequirement),
        gpuRequired: values.technical.gpuRequired,
        supportedHardware: toArray(values.technical.supportedHardware),
        supportedPlatforms: values.technical.supportedPlatforms,
      },
      training: {
        baseModel: values.training.baseModel || undefined,
        trainingMethod: values.training.trainingMethod,
        datasetName: values.training.datasetName || undefined,
        datasetSize: values.training.datasetSize || undefined,
        datasetSource: values.training.datasetSource || undefined,
        trainingEpochs: parseOptionalNumber(values.training.trainingEpochs),
        learningRate: parseOptionalNumber(values.training.learningRate),
        batchSize: parseOptionalNumber(values.training.batchSize),
        trainingHardware: values.training.trainingHardware || undefined,
        trainingTime: values.training.trainingTime || undefined,
      },
      evaluation: {
        benchmarks:
          values.evaluation.benchmarks.length > 0
            ? values.evaluation.benchmarks.map((benchmark) => ({
                name: benchmark.name,
                score: parseRequiredNumber(benchmark.score),
                metric: benchmark.metric,
                dataset: benchmark.dataset || undefined,
              }))
            : undefined,
        latency: parseOptionalNumber(values.evaluation.latency),
        throughput: parseOptionalNumber(values.evaluation.throughput),
        evaluationNotes: values.evaluation.evaluationNotes || undefined,
      },
      usage: {
        installationInstructions: values.usage.installationInstructions || undefined,
        inferenceExample: values.usage.inferenceExample || undefined,
        inputFormat: values.usage.inputFormat || undefined,
        outputFormat: values.usage.outputFormat || undefined,
        dependencies: values.usage.dependencies
          ? toArray(values.usage.dependencies)
          : undefined,
        pythonVersion: values.usage.pythonVersion || undefined,
        frameworkVersion: values.usage.frameworkVersion || undefined,
      },
      license: {
        modelLicense: values.license.modelLicense,
        datasetLicense: values.license.datasetLicense || undefined,
        commercialUse: values.license.commercialUse,
        redistributionAllowed: values.license.redistributionAllowed,
        attributionRequired: values.license.attributionRequired,
        licenseNotes: values.license.licenseNotes || undefined,
        ownershipConfirmation: values.license.ownershipConfirmation,
      },
      pricing: {
        type: values.pricing.type,
        price: parseOptionalNumber(values.pricing.price),
        currency: values.pricing.currency,
        refundPolicy: values.pricing.refundPolicy || undefined,
      },
      modelCard: {
        overview: values.modelCard.overview,
        intendedUse: values.modelCard.intendedUse,
        limitations: values.modelCard.limitations,
        safetyNotes: values.modelCard.safetyNotes || undefined,
        biasNotes: values.modelCard.biasNotes || undefined,
        citation: values.modelCard.citation || undefined,
      },
    };

    const parsed = modelUploadSchema.safeParse(payload);

    if (!parsed.success) {
      setSubmitted(false);
      const seen = new Set<string>();
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.');
        if (seen.has(path)) continue;
        seen.add(path);
        setError(path as Path<UploadFormValues>, { message: issue.message });
      }
      return;
    }

    try {
      const response = await uploadModelAction(parsed.data);
      if (response.success) {
        setSubmitted(true);
        toast.success('Model uploaded successfully!');
      } else {
        toast.error(response.error || 'Failed to upload model');
        console.error(response.error, response.details);
        setSubmitted(false);
      }
    } catch (e) {
      toast.error('An unexpected error occurred');
      console.error('Action failed:', e);
      setSubmitted(false);
    }
  });

  const error = (path: string) => findMessage(errors, path);

  return (
    <form className="grid gap-6 lg:grid-cols-2" onSubmit={onSubmit} noValidate>
      <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Submit is enabled after you enter at least one field.
          </p>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !isDirty}
          >
            Submit model
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Core information for your model listing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Model name" error={error('basicInfo.name')}>
            <Input
              {...register('basicInfo.name')}
              placeholder="Example: Falcon 8B Instruct"
            />
          </FormField>
          <FormField label="Endpoint URL" error={error('basicInfo.endpoint_url')}>
            <Input
              {...register('basicInfo.endpoint_url')}
              placeholder="https://api.example.com"
            />
          </FormField>
          <FormField label="Declared Niche" error={error('basicInfo.declared_niche')}>
            <Input
              {...register('basicInfo.declared_niche')}
              placeholder="e.g., Text Generation"
            />
          </FormField>
          <FormField label="Version" error={error('basicInfo.version')}>
            <Input {...register('basicInfo.version')} placeholder="1.0.0" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description" error={error('basicInfo.description')}>
              <Textarea
                {...register('basicInfo.description')}
                className="min-h-28"
                placeholder="Describe capabilities, strengths, and expected use cases."
              />
            </FormField>
          </div>
          <FormField label="Category" error={error('basicInfo.category')}>
            <Select {...register('basicInfo.category')}>
              <option value="llm">LLM</option>
              <option value="computer-vision">Computer vision</option>
              <option value="audio">Audio</option>
              <option value="multimodal">Multimodal</option>
              <option value="embedding">Embedding</option>
              <option value="image-generation">Image generation</option>
              <option value="speech">Speech</option>
              <option value="classification">Classification</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Task" error={error('basicInfo.task')}>
            <Input {...register('basicInfo.task')} placeholder="Text generation" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Tags (comma-separated)" error={error('basicInfo.tags')}>
              <Input
                {...register('basicInfo.tags')}
                placeholder="chat, reasoning, instruction"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model files</CardTitle>
          <CardDescription>
            Upload metadata for all distributed artifacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Model format" error={error('files.modelFormat')}>
              <Select {...register('files.modelFormat')}>
                <option value="safetensors">Safetensors</option>
                <option value="pytorch">PyTorch</option>
                <option value="onnx">ONNX</option>
                <option value="gguf">GGUF</option>
                <option value="tensorflow">TensorFlow</option>
                <option value="checkpoint">Checkpoint</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="Total size" error={error('files.totalSize')}>
              <Input {...register('files.totalSize')} placeholder="13.4" />
            </FormField>
          </div>

          <div className="space-y-3">
            {modelFiles.fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">File {index + 1}</p>
                  {modelFiles.fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => modelFiles.remove(index)}
                    >
                      <Trash2Icon />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Name" error={error(`files.modelFiles.${index}.name`)}>
                    <Input
                      {...register(`files.modelFiles.${index}.name`)}
                      placeholder="model.safetensors"
                    />
                  </FormField>
                  <FormField label="Size" error={error(`files.modelFiles.${index}.size`)}>
                    <Input
                      {...register(`files.modelFiles.${index}.size`)}
                      placeholder="4.8"
                    />
                  </FormField>
                  <FormField label="Path" error={error(`files.modelFiles.${index}.path`)}>
                    <Input
                      {...register(`files.modelFiles.${index}.path`)}
                      placeholder="/models/falcon/model.safetensors"
                    />
                  </FormField>
                  <FormField label="Type" error={error(`files.modelFiles.${index}.type`)}>
                    <Input
                      {...register(`files.modelFiles.${index}.type`)}
                      placeholder="weights"
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => modelFiles.append({ name: '', size: '', path: '', type: '' })}
          >
            <PlusIcon />
            Add model file
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical details</CardTitle>
          <CardDescription>Runtime and compatibility requirements.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Framework" error={error('technical.framework')}>
            <Select {...register('technical.framework')}>
              <option value="pytorch">PyTorch</option>
              <option value="tensorflow">TensorFlow</option>
              <option value="jax">JAX</option>
              <option value="transformers">Transformers</option>
              <option value="diffusers">Diffusers</option>
              <option value="onnx">ONNX</option>
              <option value="timm">timm</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Precision" error={error('technical.precision')}>
            <Select {...register('technical.precision')}>
              <option value="fp32">FP32</option>
              <option value="fp16">FP16</option>
              <option value="bf16">BF16</option>
              <option value="int8">INT8</option>
              <option value="int4">INT4</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Architecture" error={error('technical.architecture')}>
            <Input
              {...register('technical.architecture')}
              placeholder="Transformer decoder"
            />
          </FormField>
          <FormField label="Parameters" error={error('technical.parameters')}>
            <Input {...register('technical.parameters')} placeholder="8B" />
          </FormField>
          <FormField label="Context length" error={error('technical.contextLength')}>
            <Input {...register('technical.contextLength')} placeholder="8192" />
          </FormField>
          <FormField label="VRAM requirement" error={error('technical.vramRequirement')}>
            <Input {...register('technical.vramRequirement')} placeholder="16" />
          </FormField>
          <FormField label="RAM requirement" error={error('technical.ramRequirement')}>
            <Input {...register('technical.ramRequirement')} placeholder="32" />
          </FormField>
          <div className="space-y-1.5">
            <Label>GPU required</Label>
            <Controller
              control={control}
              name="technical.gpuRequired"
              render={({ field }) => (
                <div className="flex h-8 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                </div>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Supported hardware (comma-separated)"
              error={error('technical.supportedHardware')}
            >
              <Input
                {...register('technical.supportedHardware')}
                placeholder="NVIDIA A100, RTX 4090"
              />
            </FormField>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Supported platforms</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SUPPORTED_PLATFORM_OPTIONS.map((platform) => (
                <Controller
                  key={platform.value}
                  control={control}
                  name="technical.supportedPlatforms"
                  render={({ field }) => {
                    const platformValue = platform.value as SupportedPlatform;
                    const checked = field.value.includes(platformValue);
                    return (
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) => {
                            if (next) {
                              field.onChange([...field.value, platformValue]);
                              return;
                            }
                            field.onChange(
                              field.value.filter((value) => value !== platformValue),
                            );
                          }}
                        />
                        {platform.label}
                      </label>
                    );
                  }}
                />
              ))}
            </div>
            <ErrorText message={error('technical.supportedPlatforms')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training information</CardTitle>
          <CardDescription>Provenance and training setup details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Base model" error={error('training.baseModel')}>
            <Input {...register('training.baseModel')} placeholder="llama-3-8b" />
          </FormField>
          <FormField label="Training method" error={error('training.trainingMethod')}>
            <Select {...register('training.trainingMethod')}>
              <option value="pretraining">Pretraining</option>
              <option value="fine-tuning">Fine-tuning</option>
              <option value="lora">LoRA</option>
              <option value="qlora">QLoRA</option>
              <option value="distillation">Distillation</option>
              <option value="reinforcement-learning">Reinforcement learning</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Dataset name" error={error('training.datasetName')}>
            <Input {...register('training.datasetName')} />
          </FormField>
          <FormField label="Dataset size" error={error('training.datasetSize')}>
            <Input {...register('training.datasetSize')} placeholder="500k samples" />
          </FormField>
          <FormField label="Dataset source URL" error={error('training.datasetSource')}>
            <Input {...register('training.datasetSource')} placeholder="https://..." />
          </FormField>
          <FormField label="Training epochs" error={error('training.trainingEpochs')}>
            <Input {...register('training.trainingEpochs')} placeholder="3" />
          </FormField>
          <FormField label="Learning rate" error={error('training.learningRate')}>
            <Input {...register('training.learningRate')} placeholder="0.0002" />
          </FormField>
          <FormField label="Batch size" error={error('training.batchSize')}>
            <Input {...register('training.batchSize')} placeholder="64" />
          </FormField>
          <FormField label="Training hardware" error={error('training.trainingHardware')}>
            <Input
              {...register('training.trainingHardware')}
              placeholder="8x A100 80GB"
            />
          </FormField>
          <FormField label="Training time" error={error('training.trainingTime')}>
            <Input {...register('training.trainingTime')} placeholder="18 hours" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation</CardTitle>
          <CardDescription>Benchmarks and runtime quality signals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Latency" error={error('evaluation.latency')}>
              <Input {...register('evaluation.latency')} placeholder="120" />
            </FormField>
            <FormField label="Throughput" error={error('evaluation.throughput')}>
              <Input {...register('evaluation.throughput')} placeholder="45" />
            </FormField>
          </div>

          <div className="space-y-3">
            {benchmarks.fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Benchmark {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => benchmarks.remove(index)}
                  >
                    <Trash2Icon />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    label="Name"
                    error={error(`evaluation.benchmarks.${index}.name`)}
                  >
                    <Input
                      {...register(`evaluation.benchmarks.${index}.name`)}
                      placeholder="MMLU"
                    />
                  </FormField>
                  <FormField
                    label="Score"
                    error={error(`evaluation.benchmarks.${index}.score`)}
                  >
                    <Input
                      {...register(`evaluation.benchmarks.${index}.score`)}
                      placeholder="78.4"
                    />
                  </FormField>
                  <FormField
                    label="Metric"
                    error={error(`evaluation.benchmarks.${index}.metric`)}
                  >
                    <Input
                      {...register(`evaluation.benchmarks.${index}.metric`)}
                      placeholder="accuracy"
                    />
                  </FormField>
                  <FormField
                    label="Dataset"
                    error={error(`evaluation.benchmarks.${index}.dataset`)}
                  >
                    <Input
                      {...register(`evaluation.benchmarks.${index}.dataset`)}
                      placeholder="MMLU v1"
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              benchmarks.append({ name: '', score: '', metric: '', dataset: '' })
            }
          >
            <PlusIcon />
            Add benchmark
          </Button>

          <FormField label="Evaluation notes" error={error('evaluation.evaluationNotes')}>
            <Textarea {...register('evaluation.evaluationNotes')} className="min-h-24" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Installation and inference guidance for users.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label="Installation instructions"
              error={error('usage.installationInstructions')}
            >
              <Textarea
                {...register('usage.installationInstructions')}
                className="min-h-24"
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Inference example" error={error('usage.inferenceExample')}>
              <Textarea {...register('usage.inferenceExample')} className="min-h-32" />
            </FormField>
          </div>
          <FormField label="Input format" error={error('usage.inputFormat')}>
            <Input {...register('usage.inputFormat')} placeholder="JSON prompt" />
          </FormField>
          <FormField label="Output format" error={error('usage.outputFormat')}>
            <Input {...register('usage.outputFormat')} placeholder="Text" />
          </FormField>
          <div className="md:col-span-2">
            <FormField
              label="Dependencies (comma-separated)"
              error={error('usage.dependencies')}
            >
              <Input
                {...register('usage.dependencies')}
                placeholder="transformers, torch"
              />
            </FormField>
          </div>
          <FormField label="Python version" error={error('usage.pythonVersion')}>
            <Input {...register('usage.pythonVersion')} placeholder="3.11" />
          </FormField>
          <FormField label="Framework version" error={error('usage.frameworkVersion')}>
            <Input
              {...register('usage.frameworkVersion')}
              placeholder="transformers 5.x"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License</CardTitle>
          <CardDescription>Legal and distribution declarations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Model license" error={error('license.modelLicense')}>
            <Input {...register('license.modelLicense')} placeholder="Apache-2.0" />
          </FormField>
          <FormField label="Dataset license" error={error('license.datasetLicense')}>
            <Input {...register('license.datasetLicense')} placeholder="CC-BY-4.0" />
          </FormField>
          <div className="space-y-1.5">
            <Label>Commercial use allowed</Label>
            <Controller
              control={control}
              name="license.commercialUse"
              render={({ field }) => (
                <div className="flex h-8 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                </div>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Redistribution allowed</Label>
            <Controller
              control={control}
              name="license.redistributionAllowed"
              render={({ field }) => (
                <div className="flex h-8 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                </div>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Attribution required</Label>
            <Controller
              control={control}
              name="license.attributionRequired"
              render={({ field }) => (
                <div className="flex h-8 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                </div>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField label="License notes" error={error('license.licenseNotes')}>
              <Textarea {...register('license.licenseNotes')} className="min-h-20" />
            </FormField>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="flex items-start gap-2 text-sm">
              <Controller
                control={control}
                name="license.ownershipConfirmation"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    className="mt-0.5"
                  />
                )}
              />
              I confirm I have rights to distribute this model.
            </label>
            <ErrorText message={error('license.ownershipConfirmation')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Business model and policy details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Pricing type" error={error('pricing.type')}>
            <Select {...register('pricing.type')}>
              <option value="free">Free</option>
              <option value="one-time">One-time</option>
              <option value="subscription">Subscription</option>
              <option value="usage-based">Usage-based</option>
            </Select>
          </FormField>
          <FormField label="Currency" error={error('pricing.currency')}>
            <Select {...register('pricing.currency')}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </Select>
          </FormField>
          <FormField label="Price" error={error('pricing.price')}>
            <Input {...register('pricing.price')} placeholder="0" />
          </FormField>
          <FormField label="Refund policy" error={error('pricing.refundPolicy')}>
            <Input
              {...register('pricing.refundPolicy')}
              placeholder="No refund after download"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model card</CardTitle>
          <CardDescription>
            Responsible AI and model documentation details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField label="Overview" error={error('modelCard.overview')}>
              <Textarea {...register('modelCard.overview')} className="min-h-24" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Intended use" error={error('modelCard.intendedUse')}>
              <Textarea {...register('modelCard.intendedUse')} className="min-h-24" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Limitations" error={error('modelCard.limitations')}>
              <Textarea {...register('modelCard.limitations')} className="min-h-20" />
            </FormField>
          </div>
          <FormField label="Safety notes" error={error('modelCard.safetyNotes')}>
            <Textarea {...register('modelCard.safetyNotes')} className="min-h-20" />
          </FormField>
          <FormField label="Bias notes" error={error('modelCard.biasNotes')}>
            <Textarea {...register('modelCard.biasNotes')} className="min-h-20" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Citation" error={error('modelCard.citation')}>
              <Textarea {...register('modelCard.citation')} className="min-h-20" />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
        {submitted ? (
          <p className="mt-2 text-sm font-medium text-green-600">
            Model submitted successfully!
          </p>
        ) : null}
      </div>
    </form>
  );
}
