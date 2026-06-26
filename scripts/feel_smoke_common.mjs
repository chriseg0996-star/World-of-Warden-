// Shared helpers for offline and online browser feel smoke scripts.
import puppeteer from 'puppeteer-core';

import { BROWSER_PATH } from './browser_path.mjs';

export const BASE_URL = process.env.GAME_URL ?? 'http://localhost:5173';
export const STEP_MS = Number(process.env.FEEL_STEP_MS ?? 180);
export const SETTLE_MS = Number(process.env.FEEL_SETTLE_MS ?? 120);
export const BOOT_TIMEOUT_MS = Number(process.env.FEEL_BOOT_TIMEOUT_MS ?? 120000);
export const TICK_TIMEOUT_MS = Number(process.env.FEEL_TICK_TIMEOUT_MS ?? 60000);

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function gameUrl() {
  const url = new URL(BASE_URL);
  url.searchParams.set('perf', '');
  return url.toString();
}

export function finite(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export async function launchFeelBrowser() {
  return puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: [
      '--window-size=1280,720',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  });
}

export function attachPageDiagnostics(page, errors) {
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('/api/project-stats') || text.includes('project stats') || text.includes('502')) return;
    errors.push(`CONSOLE: ${text}`);
  });
}

export async function waitForFrames(page, count = 2, timeout = 15000) {
  const start = await page.evaluate(() => window.__game.perf.report().frames);
  await page.waitForFunction(
    ({ start, count }) => window.__game.perf.report().frames >= start + count,
    { timeout, polling: 50 },
    { start, count },
  );
}

export async function waitForTicks(page, count = 1, timeout = TICK_TIMEOUT_MS) {
  const start = await page.evaluate(() => window.__game.sim.tickCount);
  await page.waitForFunction(
    ({ start, count }) => window.__game.sim.tickCount >= start + count,
    { timeout, polling: 50 },
    { start, count },
  );
}

export async function setMove(page, move) {
  await page.evaluate((move) => window.__game.input.setTouchMove(move), move);
}

export async function clearMove(page) {
  await page.evaluate(() => window.__game.input.clearTouchMove());
}

export async function setMouselookYaw(page, yaw) {
  await page.evaluate((yaw) => {
    window.__game.input.camYaw = yaw;
    window.__game.input.setTouchLook(true);
    window.__game.input.setTouchLookVector({ x: 0, y: 0 });
  }, yaw);
}

export async function runCheck(name, fn, checks) {
  try {
    const result = await fn();
    const failures = checks(result).filter(Boolean);
    return {
      name,
      ok: failures.length === 0,
      failures,
      result,
    };
  } catch (err) {
    return {
      name,
      ok: false,
      failures: [err instanceof Error ? err.message : String(err)],
      result: null,
    };
  }
}

export async function serverReachable(baseUrl = BASE_URL) {
  try {
    const origin = new URL(baseUrl).origin;
    const res = await fetch(`${origin}/api/status`, { signal: AbortSignal.timeout(8000) });
    const body = await res.json().catch(() => ({}));
    return res.ok && body.ok;
  } catch {
    return false;
  }
}

export async function setNetworkLatency(page, latencyMs) {
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  const latency = Math.max(0, latencyMs);
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: latency > 0 ? (1.5 * 1024 * 1024) / 8 : -1,
    uploadThroughput: latency > 0 ? (750 * 1024) / 8 : -1,
    latency,
  });
  return cdp;
}
