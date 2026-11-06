import fs from 'node:fs';
import path from 'node:path';

const input = JSON.parse(await readStdin());
const filePath = input.file_path ?? '';

if (!/\.dto\.[cm]?[jt]s$/i.test(filePath)) {
  process.exit(0);
}

const root = process.env.CURSOR_PROJECT_DIR ?? process.cwd();
const stateDir = path.join(root, '.cursor', 'hooks', 'state');
fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(path.join(stateDir, 'dto-changed'), `${filePath}\n`, {
  flag: 'a',
});

process.exit(0);

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8') || '{}';
}