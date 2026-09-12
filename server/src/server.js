import dns from 'node:dns';
// Prioritize IPv4 to avoid Windows DNS IPv6 connection timeouts to external APIs
dns.setDefaultResultOrder('ipv4first');

import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎬 Movie Discovery API Server running`);
  console.log(`🌐 Listening on http://localhost:${PORT}`);
  console.log(`🛠️  Environment: ${config.nodeEnv}`);
  console.log(`=========================================`);
});
