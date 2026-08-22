import { z } from 'zod';

export const modelUploadSchema = z.object({
  basicInfo: z.object({
    name: z
      .string()
      .min(3, 'Model name must be at least 3 characters')
      .max(100, 'Model name cannot exceed 100 characters'),

    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description cannot exceed 5000 characters'),

    category: z.enum([
      'llm',
      'computer-vision',
      'audio',
      'multimodal',
      'embedding',
      'image-generation',
      'speech',
      'classification',
      'other',
    ]),
    endpoint_url: z.url(),
    declared_niche: z.string().min(1, 'Declared niche is required'),
    task: z.string().min(1, 'Task is required'),

    tags: z
      .array(z.string().min(1))
      .min(1, 'Add at least one tag')
      .max(20, 'Maximum 20 tags'),

    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g. 1.0.0)'),
  }),
  files: z.object({
    modelFiles: z
      .array(
        z.object({
          name: z.string().min(1),
          size: z.number().positive(),
          path: z.string().min(1),
          type: z.string().optional(),
        }),
      )
      .min(1, 'At least one model file is required'),

    modelFormat: z.enum([
      'safetensors',
      'pytorch',
      'onnx',
      'gguf',
      'tensorflow',
      'checkpoint',
      'other',
    ]),

    totalSize: z.number().positive('Model size must be greater than 0'),
  }),
  technical: z.object({
    framework: z.enum([
      'pytorch',
      'tensorflow',
      'jax',
      'transformers',
      'diffusers',
      'onnx',
      'timm',
      'other',
    ]),

    architecture: z.string().min(1, 'Architecture is required'),

    parameters: z.string().min(1, 'Parameter count is required'),

    precision: z.enum(['fp32', 'fp16', 'bf16', 'int8', 'int4', 'mixed', 'other']),

    contextLength: z.number().int().positive().optional(),

    vramRequirement: z.number().positive().optional(),

    ramRequirement: z.number().positive().optional(),

    gpuRequired: z.boolean(),

    supportedHardware: z
      .array(z.string())
      .min(1, 'Specify at least one supported hardware'),

    supportedPlatforms: z
      .array(z.enum(['linux', 'windows', 'macos', 'docker', 'other']))
      .min(1),
  }),
  training: z.object({
    baseModel: z.string().optional(),

    trainingMethod: z.enum([
      'pretraining',
      'fine-tuning',
      'lora',
      'qlora',
      'distillation',
      'reinforcement-learning',
      'other',
    ]),

    datasetName: z.string().optional(),

    datasetSize: z.string().optional(),

    datasetSource: z.string().url().optional(),

    trainingEpochs: z.number().positive().optional(),

    learningRate: z.number().positive().optional(),

    batchSize: z.number().int().positive().optional(),

    trainingHardware: z.string().optional(),

    trainingTime: z.string().optional(),
  }),
  evaluation: z.object({
    benchmarks: z
      .array(
        z.object({
          name: z.string().min(1),
          score: z.number(),
          metric: z.string().min(1),
          dataset: z.string().optional(),
        }),
      )
      .optional(),

    latency: z.number().positive().optional(),

    throughput: z.number().positive().optional(),

    evaluationNotes: z.string().max(5000).optional(),
  }),
  usage: z.object({
    installationInstructions: z.string().max(10000).optional(),

    inferenceExample: z.string().max(20000).optional(),

    inputFormat: z.string().optional(),

    outputFormat: z.string().optional(),

    dependencies: z.array(z.string()).optional(),

    pythonVersion: z.string().optional(),

    frameworkVersion: z.string().optional(),
  }),
  license: z.object({
    modelLicense: z.string().min(1, 'Model license is required'),

    datasetLicense: z.string().optional(),

    commercialUse: z.boolean(),

    redistributionAllowed: z.boolean(),

    attributionRequired: z.boolean(),

    licenseNotes: z.string().max(5000).optional(),

    ownershipConfirmation: z.boolean().refine((value) => value === true, {
      message: 'You must confirm that you have the right to distribute this model',
    }),
  }),
  pricing: z.object({
    type: z.enum(['free', 'hourly', 'subscription', 'usage-based']),

    price: z.number().min(0).optional(),

    currency: z.enum(['USD', 'EUR', 'GBP', 'INR']),

    refundPolicy: z.string().optional(),
  }),
  modelCard: z.object({
    overview: z.string().min(20),

    intendedUse: z.string().min(20),

    limitations: z.string().min(10),

    safetyNotes: z.string().optional(),

    biasNotes: z.string().optional(),

    citation: z.string().optional(),
  }),
});

export type ModelUpload = z.infer<typeof modelUploadSchema>;
export type ModelBasicInfo = ModelUpload['basicInfo'];
export type ModelFilesInfo = ModelUpload['files'];
export type ModelTechnical = ModelUpload['technical'];
export type ModelTraining = ModelUpload['training'];
export type ModelEvaluation = ModelUpload['evaluation'];
export type ModelUsage = ModelUpload['usage'];
export type ModelLicense = ModelUpload['license'];
export type ModelPricing = ModelUpload['pricing'];
export type ModelCardContent = ModelUpload['modelCard'];
export type ModelCategory = ModelBasicInfo['category'];
export type ModelFormat = ModelFilesInfo['modelFormat'];
export type ModelFramework = ModelTechnical['framework'];
export type ModelPrecision = ModelTechnical['precision'];
export type ModelPlatform = ModelTechnical['supportedPlatforms'][number];
export type ModelTrainingMethod = ModelTraining['trainingMethod'];
export type ModelBenchmark = NonNullable<ModelEvaluation['benchmarks']>[number];
