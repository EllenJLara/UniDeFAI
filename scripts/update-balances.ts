import { updateUserBalances } from '@/cron/balance-updater';

async function main() {
  await updateUserBalances();
  console.log('Balances updated');
}

main();