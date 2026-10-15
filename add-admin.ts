import { db } from './src/lib/db'

async function main() {
  await db.adminWhitelist.upsert({
    where: { email: 'ratihcreativedev@gmail.com' },
    update: {},
    create: { email: 'ratihcreativedev@gmail.com' }
  });
  console.log('Successfully registered ratihcreativedev@gmail.com');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
