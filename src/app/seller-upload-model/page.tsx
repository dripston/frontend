import type { Metadata } from 'next';

import { ModelUploadForm } from '@/components/models/model-upload-form';

export const metadata: Metadata = {
  title: 'Upload model',
  description: 'Submit a model listing with technical and licensing details.',
};

export default function SellerUploadModelPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Upload model</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Fill out the complete model profile below. All required fields are validated
          with the current upload schema.
        </p>
      </header>

      <ModelUploadForm />
    </main>
  );
}
