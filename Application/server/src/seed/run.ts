import { connect, disconnect } from '../db';
import { seed } from './seed';

(async () => {
  await connect();
  const r = await seed();
  console.log(`Seeded ${r.users} users and ${r.listings} listings into the database.`);
  console.log('Demo logins (password: anilink123): farmer@anilink.demo, buyer@anilink.demo');
  await disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
