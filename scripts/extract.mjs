import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

function candidatePorts() {
  const ports = [];
  if (process.env.PORT) {
    ports.push(String(process.env.PORT));
  }
  if (!ports.includes('4000')) {
    ports.push('4000');
  }
  return ports;
}

async function fetchDocs(port) {
  const response = await fetch(`http://127.0.0.1:${port}/api/docs-json`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on :${port}`);
  }
  return response.json();
}

async function extract() {
  let lastError;
  for (const port of candidatePorts()) {
    try {
      const data = await fetchDocs(port);
      fs.writeFileSync('./openapi.json', JSON.stringify(data, null, 2));
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('docs-json unavailable');
}

extract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
