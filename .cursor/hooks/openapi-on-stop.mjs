import fs from 'node:fs';
import path from 'node:path';

const input = JSON.parse(await readStdin());
const root = process.env.CURSOR_PROJECT_DIR ?? process.cwd();
const marker = path.join(root, '.cursor', 'hooks', 'state', 'dto-changed');

if (input.status !== 'completed' || !fs.existsSync(marker)) {
  process.stdout.write('{}\n');
  process.exit(0);
}

fs.unlinkSync(marker);

process.stdout.write(
  JSON.stringify({
    followup_message:
      'Обновлены DTO. Выполни `npm run openapi:generate` и кратко подтверди, что `openapi.json` обновлён.',
  }) + '\n',
);

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8') || '{}';
}