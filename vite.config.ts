import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8')) as { version?: string };

function env(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function gitSha(): string | undefined {
  try {
    return execSync('git rev-parse --short=12 HEAD', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
}

const appVersion = env(['APP_VERSION', 'npm_package_version']) ?? pkg.version ?? '0.0.0';
const appBuildDate = env(['APP_BUILD_DATE', 'BUILD_DATE']) ?? new Date().toISOString();
const desktopShell = process.env.DESKTOP_SHELL === '1' || !!process.env.TAURI_ENV_PLATFORM;
const desktopRealmOrigin = env(['DESKTOP_REALM_ORIGIN', 'WARDENFALL_REALM_ORIGIN']) ?? 'http://127.0.0.1:8787';
const appBuildId = env([
  'APP_BUILD_ID',
  'APP_BUILD_NUMBER',
  'BUILD_NUMBER',
  'GITHUB_RUN_NUMBER',
  'RENDER_BUILD_ID',
  'RENDER_GIT_COMMIT',
  'VERCEL_GIT_COMMIT_SHA',
  'CF_PAGES_COMMIT_SHA',
]) ?? gitSha() ?? appBuildDate.replace(/[-:TZ.]/g, '').slice(0, 12);

export default defineConfig({
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_ID__: JSON.stringify(appBuildId.slice(0, 12)),
    __APP_BUILD_DATE__: JSON.stringify(appBuildDate),
    __DESKTOP_SHELL__: JSON.stringify(desktopShell),
    __DESKTOP_REALM_ORIGIN__: JSON.stringify(desktopRealmOrigin),
  },
  // Parent dir has a postcss.config.js with Tailwind — ignore it; this project has no CSS pipeline.
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/admin/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/ws': { target: 'ws://127.0.0.1:8787', ws: true },
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        admin: fileURLToPath(new URL('admin.html', import.meta.url)),
      },
      output: {
        // Split the formerly-monolithic client bundle into cacheable chunks so no single
        // chunk trips the size warning and third-party code caches across app deploys.
        // Only third-party packages are grouped here — app code (src/) is left to Rollup's
        // default graphing to avoid cross-chunk circular-init hazards.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('/three/') || id.includes('/three-')) return 'three';
            return 'vendor';
          }
          // The deterministic sim core never imports render/ui/game/net/i18n (sim-purity
          // invariant), so it has no back-edges into app chunks and is safe to isolate.
          if (id.includes('/src/sim/')) return 'sim';
          // The locale tables are large data leaves (i18n.ts only imports its sibling
          // phase9_i18n), so they isolate cleanly.
          if (id.includes('/src/ui/i18n.ts') || id.includes('/src/ui/phase9_i18n')) return 'i18n';
          return undefined;
        },
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
  },
});
