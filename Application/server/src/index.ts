import http from 'node:http';
import os from 'node:os';
import { createApp } from './app';
import { config } from './config';
import { connect } from './db';
import { attachSockets } from './sockets';

async function main() {
  await connect();
  const server = http.createServer(createApp());
  attachSockets(server);
  server.listen(config.PORT, '0.0.0.0', () => {
    console.log(`AniLink server listening on port ${config.PORT}`);
    for (const list of Object.values(os.networkInterfaces())) {
      for (const i of list ?? []) {
        if (i.family === 'IPv4' && !i.internal) console.log(`  LAN: http://${i.address}:${config.PORT}`);
      }
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
