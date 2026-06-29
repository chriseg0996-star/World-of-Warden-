#!/usr/bin/env node
/** Dev launcher: one desktop instance + shared Vite (avoids duplicate windows). */
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

execSync('node scripts/prepare_tauri_icons.mjs', { cwd: root, stdio: 'inherit' });

if (process.platform === 'win32') {
  try {
    execSync('taskkill /F /IM wardenfall-desktop.exe', { stdio: 'ignore' });
  } catch {
    // not running
  }
}

const tauri = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(tauri, ['tauri', 'dev'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
