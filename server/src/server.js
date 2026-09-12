import dns from 'node:dns';
// Prioritize IPv4 to avoid Windows DNS IPv6 connection timeouts to external APIs
dns.setDefaultResultOrder('ipv4first');

import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🎬 MoviesMetro API Server running`);
  console.log(`🌐 Local:   http://localhost:${PORT}`);
  console.log(`📡 Network: http://0.0.0.0:${PORT} (LAN accessible)`);
  console.log(`🛠️  Environment: ${config.nodeEnv}`);
  console.log(`=========================================`);
});
