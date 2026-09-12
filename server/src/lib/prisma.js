import { PrismaClient } from '@prisma/client';
import dns from 'node:dns/promises';

let databaseUrl = process.env.DATABASE_URL;

// On Windows, Neon dual-stack hostnames return IPv6 first, which can cause connection
// timeouts on networks without IPv6 routing. Resolve to IPv4 dynamically with endpoint SNI.
if (databaseUrl && databaseUrl.includes('neon.tech')) {
  try {
    const parsed = new URL(databaseUrl);
    const hostname = parsed.hostname;
    if (hostname.includes('neon.tech')) {
      const endpoint = hostname.split('.')[0];
      const { address } = await dns.lookup(hostname, { family: 4 });
      parsed.hostname = address;
      if (!parsed.searchParams.has('options')) {
        parsed.searchParams.set('options', `endpoint=${endpoint}`);
      }
      databaseUrl = parsed.toString();
    }
  } catch (err) {
    console.warn('[Prisma] IPv4 resolution fallback warning:', err.message);
  }
}

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
