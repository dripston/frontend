import { existsSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
} else if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const sql = neon(process.env.DATABASE_URL);

const models = [
  {
    slug: 'aegis-legal-8b',
    name: 'Aegis-Legal-8B',
    niche: 'legal',
    category: 'llm',
    task: 'Text Generation',
    version: '1.4.0',
    endpointUrl: 'https://api.aegislabs.dev/v1/aegis-legal-8b/chat',
    downloads: 128400,
    likes: 1840,
    description:
      'Instruction-tuned 8B model for contract review, clause classification and litigation summarisation. Trained on public court filings and openly licensed contract corpora, with a retrieval-friendly 128k context window.',
    tags: ['legal', 'contracts', 'summarisation', 'rag', 'english'],
    files: {
      modelFormat: 'safetensors',
      totalSize: 16.1,
      modelFiles: [
        {
          name: 'model-00001-of-00002.safetensors',
          size: 9.8,
          path: 'weights/model-00001-of-00002.safetensors',
          type: 'safetensors',
        },
        {
          name: 'model-00002-of-00002.safetensors',
          size: 6.2,
          path: 'weights/model-00002-of-00002.safetensors',
          type: 'safetensors',
        },
        {
          name: 'tokenizer.json',
          size: 0.011,
          path: 'weights/tokenizer.json',
          type: 'json',
        },
        {
          name: 'config.json',
          size: 0.000002,
          path: 'weights/config.json',
          type: 'json',
        },
      ],
    },
    technical: {
      framework: 'transformers',
      architecture: 'LlamaForCausalLM',
      parameters: '8B',
      precision: 'bf16',
      contextLength: 131072,
      vramRequirement: 20,
      ramRequirement: 32,
      gpuRequired: true,
      supportedHardware: ['A100 40GB', 'L40S', 'RTX 4090'],
      supportedPlatforms: ['linux', 'docker'],
    },
    training: {
      baseModel: 'meta-llama/Llama-3.1-8B',
      trainingMethod: 'fine-tuning',
      datasetName: 'CUAD + CourtListener opinions',
      datasetSize: '4.2B tokens',
      datasetSource: 'https://www.atticusprojectai.org/cuad',
      trainingEpochs: 3,
      learningRate: 0.00002,
      batchSize: 128,
      trainingHardware: '8x H100 80GB',
      trainingTime: '61 hours',
    },
    evaluation: {
      latency: 640,
      throughput: 48,
      evaluationNotes:
        'Scores are reported on held-out splits. Clause classification uses the CUAD label set; summarisation is judged with GPT-4o as a reference grader on 300 sampled opinions.',
      benchmarks: [
        { name: 'CUAD', score: 81.4, metric: 'F1', dataset: 'clause extraction' },
        {
          name: 'LegalBench',
          score: 68.2,
          metric: 'accuracy %',
          dataset: 'rule application',
        },
        { name: 'BillSum', score: 42.7, metric: 'ROUGE-L', dataset: 'us-bills' },
        { name: 'MMLU', score: 63.9, metric: 'accuracy %', dataset: 'professional law' },
      ],
    },
    usage: {
      installationInstructions:
        'Install the client and export your key.\n\n```bash\npip install aegis-client==1.4.0\nexport AEGIS_API_KEY=sk-...\n```',
      inferenceExample:
        'from aegis import Aegis\n\nclient = Aegis(model="aegis-legal-8b")\n\nresponse = client.complete(\n    system="You are a contract analyst.",\n    prompt="Summarise the indemnity clause and flag uncapped liability.",\n    max_tokens=512,\n)\n\nprint(response.text)',
      inputFormat: 'OpenAI-compatible chat messages (JSON)',
      outputFormat: 'JSON with text, usage and clause spans',
      dependencies: ['transformers>=4.44', 'torch>=2.4', 'accelerate'],
      pythonVersion: '3.10 - 3.12',
      frameworkVersion: 'transformers 4.44',
    },
    license: {
      modelLicense: 'llama3.1',
      datasetLicense: 'cc-by-4.0',
      commercialUse: true,
      redistributionAllowed: true,
      attributionRequired: true,
      licenseNotes:
        'Outputs are not legal advice. Downstream deployments in regulated practice must keep a qualified reviewer in the loop.',
      ownershipConfirmation: true,
    },
    pricing: {
      type: 'usage-based',
      price: 0.0008,
      currency: 'USD',
      refundPolicy: 'Credits refunded for failed requests within 7 days.',
    },
    modelCard: {
      overview:
        'Aegis-Legal-8B is a domain-adapted Llama 3.1 checkpoint for legal document work. It keeps the base model general reasoning while adding clause taxonomy, citation formatting and statute-aware summarisation.',
      intendedUse:
        'Contract review assistants, clause search over a document store, first-pass litigation summaries and internal legal knowledge bases. It is designed to run behind a human reviewer, not to replace one.',
      limitations:
        'Coverage is strongest for US and EU commercial contracts in English. It hallucinates citations for jurisdictions outside the training data and should not be used for filings without verification.',
      safetyNotes:
        'Refuses to draft filings that assert facts it cannot ground in the supplied context. Personally identifying information in prompts is not stored by the hosted endpoint.',
      biasNotes:
        'The court-opinion corpus over-represents federal appellate matters, so the model is more confident on appellate reasoning than on small-claims or family law.',
      citation:
        '@misc{aegis2026legal, title={Aegis-Legal-8B}, author={Aegis Labs}, year={2026}}',
    },
  },
  {
    slug: 'clario-support-3b',
    name: 'Clario-Support-3B',
    niche: 'customer_support',
    category: 'llm',
    task: 'Text Generation',
    version: '2.0.1',
    endpointUrl: 'https://inference.clario.ai/v1/clario-support-3b',
    downloads: 54200,
    likes: 612,
    description:
      'Small, quantised support agent tuned for ticket triage, refund policy reasoning and multi-turn deflection. Runs on a single consumer GPU or CPU with 8 GB of RAM.',
    tags: ['support', 'ticketing', 'gguf', 'on-prem', 'quantised'],
    files: {
      modelFormat: 'gguf',
      totalSize: 2.1,
      modelFiles: [
        {
          name: 'clario-support-3b-q4_k_m.gguf',
          size: 2.1,
          path: 'gguf/clario-support-3b-q4_k_m.gguf',
          type: 'gguf',
        },
        {
          name: 'prompt-template.jinja',
          size: 0.000004,
          path: 'gguf/prompt-template.jinja',
          type: 'jinja',
        },
      ],
    },
    technical: {
      framework: 'other',
      architecture: 'Qwen2ForCausalLM',
      parameters: '3B',
      precision: 'int4',
      contextLength: 32768,
      vramRequirement: 4,
      ramRequirement: 8,
      gpuRequired: false,
      supportedHardware: ['RTX 3060', 'Apple M2', 'CPU (AVX2)'],
      supportedPlatforms: ['linux', 'macos', 'windows', 'docker'],
    },
    training: {
      baseModel: 'Qwen/Qwen2.5-3B-Instruct',
      trainingMethod: 'qlora',
      datasetName: 'Anonymised helpdesk transcripts',
      datasetSize: '410k conversations',
      trainingEpochs: 2,
      learningRate: 0.0001,
      batchSize: 32,
      trainingHardware: '2x A6000',
      trainingTime: '9 hours',
    },
    evaluation: {
      latency: 210,
      throughput: 92,
      evaluationNotes:
        'Measured on a 4-bit build with llama.cpp on an RTX 3060. Deflection rate is the share of tickets resolved without escalation in a 1,000-ticket replay.',
      benchmarks: [
        {
          name: 'Ticket triage',
          score: 91.3,
          metric: 'accuracy %',
          dataset: 'internal replay',
        },
        {
          name: 'Deflection rate',
          score: 62.5,
          metric: '%',
          dataset: '1k ticket replay',
        },
        { name: 'MT-Bench', score: 7.1, metric: 'score /10', dataset: 'multi-turn' },
      ],
    },
    usage: {
      installationInstructions:
        'Pull the GGUF build and serve it with llama.cpp.\n\n```bash\nhuggingface-cli download clario/clario-support-3b\nllama-server -m clario-support-3b-q4_k_m.gguf -c 32768\n```',
      inferenceExample:
        'import requests\n\nresponse = requests.post(\n    "http://localhost:8080/v1/chat/completions",\n    json={\n        "model": "clario-support-3b",\n        "messages": [\n            {"role": "system", "content": "You are a support agent for a hardware store."},\n            {"role": "user", "content": "My order arrived damaged, what are my options?"},\n        ],\n    },\n    timeout=30,\n)\n\nprint(response.json()["choices"][0]["message"]["content"])',
      inputFormat: 'OpenAI-compatible chat messages',
      outputFormat: 'Chat completion with optional tool calls',
      dependencies: ['llama-cpp-python>=0.3'],
      pythonVersion: '3.9+',
    },
    license: {
      modelLicense: 'apache-2.0',
      commercialUse: true,
      redistributionAllowed: true,
      attributionRequired: false,
      ownershipConfirmation: true,
    },
    pricing: {
      type: 'one-time',
      price: 249,
      currency: 'USD',
      refundPolicy: '30-day refund if the weights are not deployed.',
    },
    modelCard: {
      overview:
        'Clario-Support-3B is a compact support model built for teams that must keep customer conversations on their own hardware. It ships as a single 4-bit GGUF file and holds a full policy document in context.',
      intendedUse:
        'First-line ticket triage, macro suggestion, refund and warranty policy Q&A, and drafting replies for a human agent to approve.',
      limitations:
        'English only. Long reasoning chains degrade below 4-bit, and it will follow a stated policy literally even when the policy itself is wrong.',
      safetyNotes:
        'Does not promise refunds or discounts unless the policy text in context grants them. Escalation is the default when confidence is low.',
      citation: 'Clario AI, Clario-Support-3B, 2026.',
    },
  },
  {
    slug: 'vitalscan-ct-triage',
    name: 'VitalScan-CT-Triage',
    niche: 'healthcare',
    category: 'computer-vision',
    task: 'Image Classification',
    version: '0.9.2',
    endpointUrl: 'https://api.vitalscan.health/v1/ct-triage/predict',
    downloads: 8900,
    likes: 274,
    description:
      'Chest CT triage classifier that flags studies with suspected pulmonary embolism, pneumothorax or pleural effusion so radiology worklists can be reordered by urgency.',
    tags: ['medical-imaging', 'ct', 'triage', 'onnx', 'radiology'],
    files: {
      modelFormat: 'onnx',
      totalSize: 1.3,
      modelFiles: [
        {
          name: 'vitalscan-ct-triage.onnx',
          size: 1.28,
          path: 'onnx/vitalscan-ct-triage.onnx',
          type: 'onnx',
        },
        {
          name: 'preprocessing.json',
          size: 0.00001,
          path: 'onnx/preprocessing.json',
          type: 'json',
        },
        { name: 'labels.txt', size: 0.000001, path: 'onnx/labels.txt', type: 'text' },
      ],
    },
    technical: {
      framework: 'onnx',
      architecture: 'ConvNeXt-Base 3D',
      parameters: '340M',
      precision: 'fp16',
      vramRequirement: 8,
      ramRequirement: 16,
      gpuRequired: true,
      supportedHardware: ['T4', 'A10G', 'RTX 3090'],
      supportedPlatforms: ['linux', 'docker'],
    },
    training: {
      baseModel: 'facebook/convnext-base',
      trainingMethod: 'fine-tuning',
      datasetName: 'RSNA PE detection + institutional CT archive',
      datasetSize: '92k studies',
      datasetSource:
        'https://www.rsna.org/education/ai-resources-and-training/ai-image-challenge',
      trainingEpochs: 40,
      learningRate: 0.0003,
      batchSize: 8,
      trainingHardware: '4x A100 80GB',
      trainingTime: '11 days',
    },
    evaluation: {
      latency: 1450,
      evaluationNotes:
        'Evaluated on a 6,400-study held-out set from two hospitals not present in training. Operating point is chosen for high sensitivity because the model reorders a worklist rather than making a diagnosis.',
      benchmarks: [
        {
          name: 'PE detection',
          score: 0.94,
          metric: 'AUROC',
          dataset: 'held-out site A',
        },
        {
          name: 'PE detection',
          score: 0.91,
          metric: 'AUROC',
          dataset: 'held-out site B',
        },
        {
          name: 'Pneumothorax',
          score: 0.96,
          metric: 'AUROC',
          dataset: 'held-out site A',
        },
        {
          name: 'Sensitivity at 90% specificity',
          score: 88.5,
          metric: '%',
          dataset: 'combined',
        },
      ],
    },
    usage: {
      installationInstructions:
        'Run the ONNX graph with GPU execution providers.\n\n```bash\npip install onnxruntime-gpu pydicom numpy\n```',
      inferenceExample:
        'import numpy as np\nimport onnxruntime as ort\n\nsession = ort.InferenceSession(\n    "vitalscan-ct-triage.onnx",\n    providers=["CUDAExecutionProvider"],\n)\n\nvolume = np.load("study_0001.npy").astype("float16")\nlogits = session.run(None, {"volume": volume[None]})[0]\n\nprint(dict(zip(["pe", "pneumothorax", "effusion"], logits[0])))',
      inputFormat: 'Resampled CT volume, 1x256x256x256 float16',
      outputFormat: 'Three independent sigmoid scores',
      dependencies: ['onnxruntime-gpu>=1.19', 'pydicom>=2.4', 'numpy'],
      pythonVersion: '3.10+',
    },
    license: {
      modelLicense: 'cc-by-nc-4.0',
      datasetLicense: 'research-use-only',
      commercialUse: false,
      redistributionAllowed: false,
      attributionRequired: true,
      licenseNotes:
        'Research use only. Not cleared by the FDA, CE or any other regulator, and must not be used as a diagnostic device.',
      ownershipConfirmation: true,
    },
    pricing: {
      type: 'subscription',
      price: 1200,
      currency: 'USD',
      refundPolicy: 'Cancel any time; the current month is not refunded.',
    },
    modelCard: {
      overview:
        'VitalScan-CT-Triage scores a chest CT volume for three time-critical findings and returns calibrated probabilities intended for worklist ordering.',
      intendedUse:
        'Prioritising unread studies in a radiology queue, and flagging studies for a second read. A qualified radiologist reads every study regardless of the score.',
      limitations:
        'Trained on adult chest CT with contrast. Performance drops on paediatric studies, non-contrast scans and slice thickness above 3 mm.',
      safetyNotes:
        'The model never returns a diagnosis or a recommendation, only ranked probabilities. Failure modes skew toward false positives by design.',
      biasNotes:
        'Both contributing sites are urban teaching hospitals in the same country; performance on other populations and scanner vendors is unverified.',
      citation: 'VitalScan Research, VitalScan-CT-Triage 0.9.2, 2026.',
    },
  },
  {
    slug: 'fin-embed-v2',
    name: 'Fin-Embed-v2',
    niche: 'finance',
    category: 'embedding',
    task: 'Feature Extraction',
    version: '2.1.0',
    endpointUrl: 'https://api.finembed.io/v2/embed',
    downloads: 412000,
    likes: 3110,
    description:
      'Text embedding model tuned on filings, earnings calls and analyst notes. Produces 768-dimension vectors that separate financial entities, sentiment and instrument types far better than general-purpose encoders.',
    tags: ['embeddings', 'finance', 'retrieval', 'rag', 'sentence-transformers'],
    files: {
      modelFormat: 'safetensors',
      totalSize: 0.67,
      modelFiles: [
        {
          name: 'model.safetensors',
          size: 0.66,
          path: 'weights/model.safetensors',
          type: 'safetensors',
        },
        {
          name: 'tokenizer.json',
          size: 0.009,
          path: 'weights/tokenizer.json',
          type: 'json',
        },
        {
          name: 'modules.json',
          size: 0.000001,
          path: 'weights/modules.json',
          type: 'json',
        },
      ],
    },
    technical: {
      framework: 'transformers',
      architecture: 'BertModel',
      parameters: '335M',
      precision: 'fp32',
      contextLength: 8192,
      vramRequirement: 2,
      ramRequirement: 4,
      gpuRequired: false,
      supportedHardware: ['CPU', 'T4', 'Apple M1'],
      supportedPlatforms: ['linux', 'macos', 'windows', 'docker'],
    },
    training: {
      baseModel: 'BAAI/bge-large-en-v1.5',
      trainingMethod: 'fine-tuning',
      datasetName: 'SEC EDGAR filings + earnings call transcripts',
      datasetSize: '19M passage pairs',
      datasetSource: 'https://www.sec.gov/edgar',
      trainingEpochs: 1,
      learningRate: 0.00001,
      batchSize: 1024,
      trainingHardware: '8x A100 40GB',
      trainingTime: '32 hours',
    },
    evaluation: {
      latency: 18,
      throughput: 1800,
      benchmarks: [
        { name: 'FiQA-2018', score: 47.8, metric: 'nDCG@10', dataset: 'BEIR' },
        {
          name: 'FinanceBench retrieval',
          score: 71.2,
          metric: 'recall@5',
          dataset: 'internal',
        },
        { name: 'MTEB (English)', score: 64.1, metric: 'average', dataset: '56 tasks' },
      ],
      evaluationNotes:
        'MTEB average is reported for transparency: the model trades a little general-domain quality for a large gain on financial retrieval.',
    },
    usage: {
      installationInstructions: '```bash\npip install sentence-transformers\n```',
      inferenceExample:
        'from sentence_transformers import SentenceTransformer\n\nmodel = SentenceTransformer("finembed/fin-embed-v2")\n\nvectors = model.encode([\n    "Operating margin contracted 240 bps year over year.",\n    "Guidance was raised on stronger subscription renewals.",\n])\n\nprint(vectors.shape)',
      inputFormat: 'List of strings, up to 8192 tokens each',
      outputFormat: '768-dimension float32 vectors, L2 normalised',
      dependencies: ['sentence-transformers>=3.0', 'torch>=2.2'],
      pythonVersion: '3.9+',
      frameworkVersion: 'sentence-transformers 3.0',
    },
    license: {
      modelLicense: 'mit',
      datasetLicense: 'public-domain',
      commercialUse: true,
      redistributionAllowed: true,
      attributionRequired: false,
      ownershipConfirmation: true,
    },
    pricing: { type: 'free', currency: 'USD' },
    modelCard: {
      overview:
        'Fin-Embed-v2 is a retrieval encoder for financial text. It is a drop-in replacement for general embedding models in RAG pipelines over filings, transcripts and research notes.',
      intendedUse:
        'Semantic search over financial documents, deduplicating research notes, clustering earnings commentary and reranking candidates before an LLM reads them.',
      limitations:
        'English text only, and tuned for prose rather than tables. Numeric reasoning is not preserved in the vector space, so figures still need to be read from the source document.',
      biasNotes:
        'Coverage skews to US large-cap issuers because EDGAR dominates the training mix; small-cap and non-US filings retrieve less reliably.',
      citation: '@misc{finembed2026, title={Fin-Embed-v2}, year={2026}}',
    },
  },
  {
    slug: 'echoscribe-speech-1',
    name: 'EchoScribe-Speech-1',
    niche: 'generic',
    category: 'speech',
    task: 'Automatic Speech Recognition',
    version: '1.1.3',
    endpointUrl: 'https://api.echoscribe.dev/v1/transcribe',
    downloads: 76500,
    likes: 1490,
    description:
      'Streaming speech-to-text model with word-level timestamps and speaker turns. Tuned for meeting audio, call-centre recordings and podcasts across 12 languages.',
    tags: ['asr', 'speech-to-text', 'streaming', 'diarisation', 'multilingual'],
    files: {
      modelFormat: 'pytorch',
      totalSize: 3.2,
      modelFiles: [
        {
          name: 'encoder.pt',
          size: 2.4,
          path: 'checkpoints/encoder.pt',
          type: 'pytorch',
        },
        {
          name: 'decoder.pt',
          size: 0.79,
          path: 'checkpoints/decoder.pt',
          type: 'pytorch',
        },
        { name: 'vocab.json', size: 0.002, path: 'checkpoints/vocab.json', type: 'json' },
      ],
    },
    technical: {
      framework: 'pytorch',
      architecture: 'Conformer encoder + RNN-T decoder',
      parameters: '1.5B',
      precision: 'fp16',
      vramRequirement: 6,
      ramRequirement: 16,
      gpuRequired: true,
      supportedHardware: ['T4', 'L4', 'RTX 4070'],
      supportedPlatforms: ['linux', 'docker'],
    },
    training: {
      baseModel: 'openai/whisper-large-v3',
      trainingMethod: 'distillation',
      datasetName: 'Common Voice 17 + licensed meeting corpus',
      datasetSize: '68k hours',
      datasetSource: 'https://commonvoice.mozilla.org/en/datasets',
      trainingEpochs: 6,
      learningRate: 0.00005,
      batchSize: 64,
      trainingHardware: '16x A100 80GB',
      trainingTime: '8 days',
    },
    evaluation: {
      latency: 320,
      throughput: 34,
      evaluationNotes:
        'Word error rate is reported without a language model or custom vocabulary. Real-time factor of 0.08 was measured on an L4 with 16 concurrent streams.',
      benchmarks: [
        {
          name: 'LibriSpeech test-clean',
          score: 2.4,
          metric: 'WER %',
          dataset: 'test-clean',
        },
        {
          name: 'LibriSpeech test-other',
          score: 5.1,
          metric: 'WER %',
          dataset: 'test-other',
        },
        { name: 'AMI meetings', score: 11.8, metric: 'WER %', dataset: 'ihm' },
        { name: 'Common Voice (12 langs)', score: 9.6, metric: 'WER %', dataset: 'v17' },
      ],
    },
    usage: {
      installationInstructions:
        '```bash\npip install echoscribe torchaudio\nexport ECHOSCRIBE_API_KEY=es-...\n```',
      inferenceExample:
        'from echoscribe import Transcriber\n\ntranscriber = Transcriber(model="echoscribe-speech-1", diarise=True)\n\nfor segment in transcriber.stream("standup.wav"):\n    print(f"[{segment.start:.2f}s] {segment.speaker}: {segment.text}")',
      inputFormat: '16 kHz mono PCM, WAV or FLAC, streamed in 320 ms frames',
      outputFormat: 'Segments with text, speaker label and word timestamps',
      dependencies: ['torch>=2.3', 'torchaudio>=2.3', 'echoscribe>=1.1'],
      pythonVersion: '3.10+',
      frameworkVersion: 'torch 2.3',
    },
    license: {
      modelLicense: 'apache-2.0',
      datasetLicense: 'cc0-1.0',
      commercialUse: true,
      redistributionAllowed: true,
      attributionRequired: true,
      licenseNotes:
        'Attribution required in any product that surfaces transcripts to end users.',
      ownershipConfirmation: true,
    },
    pricing: {
      type: 'usage-based',
      price: 0.006,
      currency: 'USD',
      refundPolicy: 'Failed jobs are not billed.',
    },
    modelCard: {
      overview:
        'EchoScribe-Speech-1 is a distilled Conformer RNN-T that transcribes streaming audio with speaker turns and word-level timing.',
      intendedUse:
        'Live meeting captions, call-centre quality review, podcast transcription and any pipeline that needs timestamps for search or alignment.',
      limitations:
        'Accuracy degrades below 8 kHz audio, with more than four overlapping speakers, or on heavy code-switching within a sentence.',
      safetyNotes:
        'Recording consent is the deployer responsibility. The hosted endpoint discards audio after the job completes and retains no transcripts.',
      biasNotes:
        'Error rates are higher for strongly accented English than for the North American and British accents that dominate the meeting corpus.',
      citation: 'EchoScribe, EchoScribe-Speech-1, 2026.',
    },
  },
];

const [owner] = await sql`select id, name from "user" order by created_at limit 1`;

if (!owner) {
  console.error('No user rows found. Sign up once, then re-run this script.');
  process.exit(1);
}

const ownerSlug = owner.name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const ids = models.map((entry) => `${ownerSlug}/${entry.slug}`);

if (process.argv.includes('--clear')) {
  await sql`delete from model where id = any(${ids})`;
  console.log(`Removed ${ids.length} seeded models.`);
  process.exit(0);
}

for (const [index, entry] of models.entries()) {
  const id = ids[index];
  const basicInfo = {
    name: entry.name,
    description: entry.description,
    category: entry.category,
    endpoint_url: entry.endpointUrl,
    declared_niche: entry.niche,
    task: entry.task,
    tags: entry.tags,
    version: entry.version,
  };

  await sql`
    insert into model (
      id, user_id, name, niche, category, task, version, endpoint_url, downloads, likes,
      basic_info, files, technical, training, evaluation, usage, license, pricing, model_card,
      created_at, updated_at
    ) values (
      ${id}, ${owner.id}, ${entry.name}, ${entry.niche}, ${entry.category}, ${entry.task},
      ${entry.version}, ${entry.endpointUrl}, ${entry.downloads}, ${entry.likes},
      ${JSON.stringify(basicInfo)}, ${JSON.stringify(entry.files)}, ${JSON.stringify(entry.technical)},
      ${JSON.stringify(entry.training)}, ${JSON.stringify(entry.evaluation)}, ${JSON.stringify(entry.usage)},
      ${JSON.stringify(entry.license)}, ${JSON.stringify(entry.pricing)}, ${JSON.stringify(entry.modelCard)},
      now(), now() - (${index} * interval '19 hours')
    )
    on conflict (id) do update set
      name = excluded.name, niche = excluded.niche, category = excluded.category,
      task = excluded.task, version = excluded.version, endpoint_url = excluded.endpoint_url,
      downloads = excluded.downloads, likes = excluded.likes, basic_info = excluded.basic_info,
      files = excluded.files, technical = excluded.technical, training = excluded.training,
      evaluation = excluded.evaluation, usage = excluded.usage, license = excluded.license,
      pricing = excluded.pricing, model_card = excluded.model_card, updated_at = excluded.updated_at
  `;

  console.log(`seeded ${id}`);
}

console.log(`Done. Run with --clear to remove these ${ids.length} rows.`);
