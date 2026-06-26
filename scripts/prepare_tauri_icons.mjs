#!/usr/bin/env node
/** Generate src-tauri/icons from app-icon.png (512×512+) when missing. */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tauriDir = join(root, 'src-tauri');
const appIcon = join(tauriDir, 'app-icon.png');
const iconsDir = join(tauriDir, 'icons');
const marker = join(iconsDir, 'icon.ico');

if (existsSync(marker)) {
  console.log('Tauri icons already present');
  process.exit(0);
}

if (!existsSync(appIcon)) {
  mkdirSync(tauriDir, { recursive: true });
  if (process.platform === 'win32') {
    execSync(
      `powershell -NoProfile -Command "Add-Type -AssemblyName System.Drawing; `
      + `$b = New-Object System.Drawing.Bitmap 512,512; `
      + `$g = [System.Drawing.Graphics]::FromImage($b); `
      + `$g.Clear([System.Drawing.Color]::FromArgb(201,148,26)); `
      + `$g.Dispose(); `
      + `$b.Save('${appIcon.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png); `
      + `$b.Dispose()"`,
      { stdio: 'inherit' },
    );
  } else {
    console.error('Missing src-tauri/app-icon.png — add a 512×512 PNG or run on Windows to auto-generate.');
    process.exit(1);
  }
}

mkdirSync(iconsDir, { recursive: true });
execSync(`npx tauri icon "${appIcon}"`, { cwd: root, stdio: 'inherit' });
console.log('Generated Tauri icon set');
