import { existsSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const standalone = join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('postbuild: .next/standalone missing — is output: "standalone" set?');
  process.exit(1);
}

const assets = [
  { from: join(root, 'public'), to: join(standalone, 'public') },
  { from: join(root, '.next', 'static'), to: join(standalone, '.next', 'static') },
];

for (const { from, to } of assets) {
  if (existsSync(from)) {
    await cp(from, to, { recursive: true });
  }
}

console.log('postbuild: copied public/ and .next/static into .next/standalone');
