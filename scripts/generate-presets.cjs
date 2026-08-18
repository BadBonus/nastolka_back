// Генератор пресетов для imgproxy в docker-compose.yml

const fs = require('node:fs');
const path = require('node:path');

const presets = {
  avatar: 'resizing_type:fill/width:64/height:64/format:webp',
  profile_avatar: 'resizing_type:fill/width:200/height:200/format:webp',
};

const dockerString = Object.entries(presets)
  .map(([name, params]) => `${name}=${params}`)
  .join(',');

const envPath = path.resolve(process.cwd(), '.env');

let envLines = [];
if (fs.existsSync(envPath)) {
  envLines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
}

let keyFound = false;
const updatedLines = envLines.map((line) => {
  if (line.trim().startsWith('IMGPROXY_PRESETS=')) {
    keyFound = true;
    return `IMGPROXY_PRESETS="${dockerString}"`;
  }
  return line;
});

if (!keyFound) {
  updatedLines.push(`IMGPROXY_PRESETS="${dockerString}"`);
}

fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8');

const typesDir = path.resolve(process.cwd(), './src/common/types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

const tsContent = `export type TImgproxyPreset = ${Object.keys(presets)
  .map((k) => `'${k}'`)
  .join(' | ')};\n`;
fs.writeFileSync(path.join(typesDir, 'imgproxy-presets.ts'), tsContent);
