import { env } from '@/env';
import { Client } from '@upstash/qstash';

const client = new Client({
  baseUrl: env.QSTASH_URL,
  token: env.QSTASH_TOKEN,
});

export { client as qstashClient };
