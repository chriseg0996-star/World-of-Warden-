#!/usr/bin/env node
/** Start Vite for `tauri dev` only when :5173 is not already serving. */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEV_URL = 'http://localhost:5173/';

async function viteReady() {
  try {
    const res = await fetch(DEV_URL, { signal: AbortSignal.timeout(800) });
    return res.ok;
  } catch {
    return false;
  }
}

if (await viteReady()) {
  console.log('Vite already running on :5173 — reusing for Tauri dev');
  process.exit(0);
}

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  detached: true,
});
child.unref();

for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 250));
  if (await viteReady()) process.exit(0);
}
console.error('Timed out waiting for Vite on :5173');
process.exit(1);
