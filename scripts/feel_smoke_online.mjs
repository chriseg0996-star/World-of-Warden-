// Online browser feel smoke: movement and camera authority through the real
// server + WebSocket mirror (optionally with emulated network latency).
// Requires: npm run db:up, ALLOW_DEV_COMMANDS=1 npm run server, npm run dev
import fs from 'node:fs';
import path from 'node:path';

import {
  BASE_URL,
  BOOT_TIMEOUT_MS,
  SETTLE_MS,
  attachPageDiagnostics,
  clearMove,
  finite,
  gameUrl,
  launchFeelBrowser,
  runCheck,
  serverReachable,
  setMove,
  setNetworkLatency,
  sleep,
  waitForFrames,
} from './feel_smoke_common.mjs';

const OUTPUT = process.env.FEEL_OUT ?? path.join('tmp', `feel-smoke-online-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const LATENCY_MS = Number(process.env.FEEL_LATENCY_MS ?? 150);
const MAX_ECHO_MS = Number(process.env.FEEL_MAX_ECHO_MS ?? (LATENCY_MS > 0 ? 700 : 450));
const TELEPORT_SPOT = { x: 0, z: -40 };

const uniq = Date.now().toString(36).slice(-6);
const alpha = uniq.replace(/[0-9]/g, (d) => 'abcdefghij'[Number(d)]);
const USER = `feel_${alpha}`;
const PASS = 'hunter22';
const CHAR = `Fld${alpha}`;

async function bootOnline(page) {
  await page.bringToFront();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });
  await page.goto(gameUrl(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(600);
  await page.evaluate((user, pass, charName) => {
    document.querySelector('#btn-online').click();
    document.querySelector('#login-user').value = user;
    document.querySelector('#login-pass').value = pass;
    document.querySelector('#btn-register').click();
  }, USER, PASS, CHAR);
  await page.waitForFunction(
    () => document.querySelector('#charselect-panel')?.style.display === 'block',
    { timeout: 15000, polling: 200 },
  );
  await page.evaluate((charName) => {
    document.querySelector('#new-char-name').value = charName;
    document.querySelector('#charselect-panel .mini-class[data-class="warrior"]').click();
    document.querySelector('#btn-create-char').click();
  }, CHAR);
  await sleep(700);
  const entered = await page.evaluate((charName) => {
    const rows = [...document.querySelectorAll('.char-row')];
    const row = rows.find((r) => r.querySelector('.char-name')?.textContent === charName);
    if (!row) return false;
    row.querySelector('button').click();
    return true;
  }, CHAR);
  if (!entered) throw new Error(`could not enter world as ${CHAR}`);
  await page.waitForFunction(
    () => Boolean(window.__game?.online?.connected && window.__game?.world?.player && window.__game?.perf?.report),
    { timeout: BOOT_TIMEOUT_MS, polling: 200 },
  );
  await waitForFrames(page, 3, 15000);
  await page.evaluate((spot) => {
    const g = window.__game;
    try {
      g.online.cmd({ cmd: 'dev_teleport', x: spot.x, z: spot.z });
    } catch { /* dev commands off — test at spawn */ }
    g.input.camYaw = g.world.player.facing;
    g.input.camPitch = 0.32;
    g.renderer.camYaw = g.input.camYaw;
    g.renderer.camPitch = 0.32;
    window.__feelZ0 = g.world.player.pos.z;
  }, TELEPORT_SPOT);
  await sleep(SETTLE_MS + 250);
}

async function onlineState(page) {
  return page.evaluate(() => {
    const g = window.__game;
    const p = g.world.player;
    const r = g.perf.report();
    return {
      t: performance.now(),
      x: p.pos.x,
      z: p.pos.z,
      facing: p.facing,
      camYaw: g.input.camYaw,
      connected: g.online?.connected ?? false,
      snapInterval: g.online?.snapInterval ?? 0,
      inputEchoP95: r.input?.sendToEcho?.p95 ?? null,
      network: r.network ?? null,
      frames: r.frames,
    };
  });
}

async function resetOnlineInput(page) {
  await page.evaluate(() => {
    const g = window.__game;
    g.input.clearTouchMove();
    g.input.keys.clear();
    g.input.leftDown = false;
    g.input.rightDown = false;
    g.input.autorun = false;
    g.input.setTouchLook(false);
    g.hud.closeAll();
    window.__feelZ0 = g.world.player.pos.z;
  });
  await sleep(80);
}

async function waitForZDelta(page, minDz, timeout = 12000) {
  await page.evaluate(() => {
    window.__feelZ0 = window.__game.world.player.pos.z;
  });
  await page.waitForFunction(
    (minDz) => Math.abs(window.__game.world.player.pos.z - window.__feelZ0) >= minDz,
    { timeout, polling: 50 },
    minDz,
  );
}

async function runOnlineSuite(page, checks, { label, latencyMs }) {
  if (latencyMs > 0) await setNetworkLatency(page, latencyMs);
  await sleep(latencyMs > 0 ? 350 : 120);

  checks.push(await runCheck(`${label} connected with live snapshots`, async () => {
    const before = await onlineState(page);
    await waitForFrames(page, 4, 15000);
    const after = await onlineState(page);
    return {
      connected: after.connected,
      framesDelta: after.frames - before.frames,
      snapInterval: after.snapInterval,
    };
  }, ({ connected, framesDelta, snapInterval }) => [
    !connected ? 'not connected' : '',
    framesDelta < 3 ? `only ${framesDelta} frames advanced` : '',
    snapInterval <= 0 ? 'snapInterval not measured' : '',
  ]));

  checks.push(await runCheck(`${label} forward movement`, async () => {
    await resetOnlineInput(page);
    const before = await onlineState(page);
    await setMove(page, { forward: true, back: false, strafeLeft: false, strafeRight: false });
    await waitForZDelta(page, latencyMs > 0 ? 0.07 : 0.1);
    const after = await onlineState(page);
    await clearMove(page);
    return {
      dz: after.z - before.z,
      elapsedMs: after.t - before.t,
      echoP95: after.inputEchoP95,
    };
  }, ({ dz, elapsedMs, echoP95 }) => [
    dz <= (latencyMs > 0 ? 0.04 : 0.07)
      ? `forward dz ${dz.toFixed(3)} too small after ${finite(elapsedMs).toFixed(0)}ms`
      : '',
    echoP95 != null && echoP95 > MAX_ECHO_MS
      ? `input echo p95 ${echoP95.toFixed(0)}ms > ${MAX_ECHO_MS}ms`
      : '',
  ]));

  checks.push(await runCheck(`${label} snap-follow keyboard turn`, async () => {
    await resetOnlineInput(page);
    await page.evaluate(() => {
      const g = window.__game;
      g.input.camYaw = g.world.player.facing;
      g.renderer.camYaw = g.input.camYaw;
      window.__feelFacing0 = g.world.player.facing;
      g.input.keys.add('KeyA');
    });
    await page.waitForFunction(
      () => Math.abs(window.__game.world.player.facing - window.__feelFacing0) > 0.07,
      { timeout: 10000, polling: 50 },
    );
    return page.evaluate(() => {
      const g = window.__game;
      g.input.keys.delete('KeyA');
      const wrap = (d) => {
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return d;
      };
      return {
        facing: g.world.player.facing,
        yawDelta: Math.abs(wrap(g.input.camYaw - g.world.player.facing)),
      };
    });
  }, ({ facing, yawDelta }) => [
    Math.abs(facing) < 0.04 ? `facing barely changed ${facing.toFixed(3)}` : '',
    yawDelta > (latencyMs > 0 ? 0.38 : 0.3)
      ? `camYaw ${yawDelta.toFixed(3)}rad from server facing`
      : '',
  ]));

  checks.push(await runCheck(`${label} social panel opens with server data`, async () => {
    await resetOnlineInput(page);
    const result = await page.evaluate(() => {
      window.__game.hud.toggleSocial();
      const el = document.querySelector('#social-window');
      return {
        open: el?.classList.contains('open') ?? false,
        hasSocial: window.__game.world.socialInfo !== null,
        bodyLen: el?.textContent?.trim().length ?? 0,
      };
    });
    await sleep(200);
    await page.evaluate(() => window.__game.hud.toggleSocial());
    return result;
  }, ({ open, hasSocial, bodyLen }) => [
    !open ? 'social window not open' : '',
    !hasSocial ? 'socialInfo null while online' : '',
    bodyLen < 12 ? `social panel too empty (${bodyLen} chars)` : '',
  ]));

  checks.push(await runCheck(`${label} market panel opens near merchant`, async () => {
    await resetOnlineInput(page);
    await page.evaluate(() => {
      window.__game.online.cmd({ cmd: 'dev_teleport', x: 0, z: 5 });
    });
    await sleep(450);
    const result = await page.evaluate(() => {
      window.__game.hud.openMarket();
      const body = document.getElementById('market-body');
      return {
        open: window.__game.hud.marketWindowOpen,
        hasInfo: window.__game.world.marketInfo !== null,
        bodyLen: body?.innerHTML?.length ?? 0,
      };
    });
    await sleep(250);
    await page.evaluate(() => window.__game.hud.closeMarket());
    return result;
  }, ({ open, hasInfo, bodyLen }) => [
    !open ? 'market window not open' : '',
    !hasInfo ? 'marketInfo null while online' : '',
    bodyLen < 20 ? `market body too empty (${bodyLen} chars)` : '',
  ]));
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

if (!await serverReachable()) {
  console.error('Game server not reachable at /api/status.');
  console.error('Start Postgres (npm run db:up), then ALLOW_DEV_COMMANDS=1 npm run server and npm run dev.');
  process.exit(1);
}

const errors = [];
const browser = await launchFeelBrowser();
const page = await browser.newPage();
attachPageDiagnostics(page, errors);

const checks = [];
try {
  await bootOnline(page);
  await runOnlineSuite(page, checks, { label: 'online', latencyMs: 0 });
  if (LATENCY_MS > 0) {
    await runOnlineSuite(page, checks, { label: `online+${LATENCY_MS}ms`, latencyMs: LATENCY_MS });
  }
} finally {
  await browser.close();
}

const artifact = {
  generatedAt: new Date().toISOString(),
  mode: 'online',
  baseUrl: BASE_URL,
  url: gameUrl(),
  latencyMs: LATENCY_MS,
  maxEchoMs: MAX_ECHO_MS,
  character: CHAR,
  checks,
  errors,
};
fs.writeFileSync(OUTPUT, `${JSON.stringify(artifact, null, 2)}\n`);

for (const check of checks) {
  const status = check.ok ? 'OK' : 'FAIL';
  console.log(`${status} ${check.name}`);
  if (!check.ok) {
    for (const failure of check.failures) console.log(`  ${failure}`);
  }
}
console.log(`wrote ${OUTPUT}`);

const failures = [
  ...errors,
  ...checks.flatMap((check) => check.failures.map((failure) => `${check.name}: ${failure}`)),
];
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
