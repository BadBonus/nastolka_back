import fs from 'node:fs';

async function extract() {
  try {
    const response = await fetch('http://localhost:4000/api/docs-json');
    const data = await response.json();
    fs.writeFileSync('./openapi.json', JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

extract();
