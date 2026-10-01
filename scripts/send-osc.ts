import dgram from 'node:dgram';
import process from 'node:process';
import { createOscMessage } from '../shared/osc';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: bun scripts/send-osc.ts <address> [args...]');
  console.log('Examples:');
  console.log('  bun scripts/send-osc.ts /altama/column 1');
  console.log('  bun scripts/send-osc.ts /altama/column 2');
  console.log('  bun scripts/send-osc.ts /altama/subItem 2 tekiro');
  console.log('  bun scripts/send-osc.ts /altama/next 2');
  console.log('  bun scripts/send-osc.ts /altama/lang en');
  console.log('  bun scripts/send-osc.ts /altama/reset');
  process.exit(0);
}

const address = args[0]!;
const oscArgs: (number | string)[] = args.slice(1).map((val) => {
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
});

const OSC_PORT = Number.parseInt(process.env.OSC_PORT || '9000', 10);
const OSC_HOST = process.env.OSC_HOST || '127.0.0.1';

const packet = createOscMessage(address, oscArgs);
const client = dgram.createSocket('udp4');

client.send(packet, OSC_PORT, OSC_HOST, (err) => {
  if (err) {
    console.error('Failed to send OSC packet:', err);
  }
  else {
    console.log(`✓ Sent OSC: ${address} ${JSON.stringify(oscArgs)} to ${OSC_HOST}:${OSC_PORT}`);
  }
  client.close();
});
