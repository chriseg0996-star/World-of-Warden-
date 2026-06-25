// Forgotten Crypt offline E2E: enter at the Fallen Chapel, reach the ritual
// chamber, kill Bone Guardian + Crypt Warden, verify quest credit, leave.
// Needs `npm run dev` on :5173.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

import { BROWSER_PATH as EDGE } from './browser_path.mjs';

const URL = process.env.GAME_URL ?? 'http://localhost:5173';
fs.mkdirSync('tmp', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--window-size=1600,900', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1600, height: 900 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
});

let pass = 0;
let fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`OK   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ` ${extra}` : ''}`); }
}

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
await page.click('#btn-offline');
await new Promise((r) => setTimeout(r, 200));
await page.type('#char-name', 'CryptRunner');
await page.click('#offline-select .mini-class[data-class="warrior"]');
await page.click('#btn-start-offline');

async function waitForGame(ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const ready = await page.evaluate(() => Boolean(window.__game?.sim?.player));
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}
check('game booted', await waitForGame());

const setup = await page.evaluate(() => {
  const sim = window.__game.sim;
  const p = sim.player;
  const pid = sim.playerId;
  sim.setPlayerLevel(10);
  sim.chat('/dev tp -14 -10');
  sim.acceptQuest('q_fc_enter');
  sim.chat('/dev tp 80 90');
  sim.enterCrypt();
  if (sim.questState('q_fc_enter') === 'ready') {
    sim.chat('/dev tp -14 -10');
    sim.turnInQuest('q_fc_enter');
    sim.acceptQuest('q_fc_guardian');
    sim.chat('/dev tp 80 90');
    sim.enterCrypt();
  }
  if (!sim.meta(pid).questLog.has('q_fc_guardian')) {
    sim.meta(pid).questLog.set('q_fc_guardian', { questId: 'q_fc_guardian', counts: [0], state: 'active' });
  }
  const inside = p.pos.x > 600;
  let guardian = null;
  let warden = null;
  for (const e of sim.entities.values()) {
    if (e.kind !== 'mob' || e.dead) continue;
    if (e.templateId === 'bone_guardian') guardian = e.id;
    if (e.templateId === 'crypt_warden') warden = e.id;
  }
  return { inside, guardian, warden, x: p.pos.x, z: p.pos.z };
});
check('entered hollow_crypt instance', setup.inside, JSON.stringify(setup));
check('bone_guardian spawned', setup.guardian !== null);
check('crypt_warden spawned', setup.warden !== null);

await page.screenshot({ path: 'tmp/crypt_01_entry.png' });

const guardianKill = await page.evaluate((guardianId) => {
  const sim = window.__game.sim;
  const p = sim.player;
  const mob = sim.entities.get(guardianId);
  if (!mob) return { ok: false, reason: 'missing' };
  p.pos.x = mob.pos.x;
  p.pos.z = mob.pos.z + 3;
  p.prevPos = { ...p.pos };
  sim.dealDamage(p, mob, mob.hp + 5000, false, 'physical', 'smoke', 'hit', true);
  sim.tick();
  const qp = sim.meta(sim.playerId).questLog.get('q_fc_guardian');
  return { ok: mob.dead, quest: qp?.counts?.[0] ?? 0 };
}, setup.guardian);
check('bone_guardian killed', guardianKill.ok, JSON.stringify(guardianKill));
check('bone_guardian quest credited', guardianKill.quest === 1);

await page.evaluate(() => {
  const sim = window.__game.sim;
  const pid = sim.playerId;
  if (sim.meta(pid).questLog.get('q_fc_guardian')?.state === 'ready') {
    sim.chat('/dev tp -14 -10');
    sim.turnInQuest('q_fc_guardian');
    sim.acceptQuest('q_fc_warden');
    sim.chat('/dev tp 80 90');
    sim.enterCrypt();
  }
  if (!sim.meta(pid).questLog.has('q_fc_warden')) {
    sim.meta(pid).questLog.set('q_fc_warden', { questId: 'q_fc_warden', counts: [0], state: 'active' });
  }
});

await page.evaluate((wardenId) => {
  const sim = window.__game.sim;
  const p = sim.player;
  const mob = sim.entities.get(wardenId);
  if (!mob) return;
  p.pos.x = mob.pos.x;
  p.pos.z = mob.pos.z + 3;
  p.prevPos = { ...p.pos };
  sim.targetEntity(wardenId);
}, setup.warden);
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: 'tmp/crypt_02_warden.png' });

const wardenKill = await page.evaluate((wardenId) => {
  const sim = window.__game.sim;
  const p = sim.player;
  const mob = sim.entities.get(wardenId);
  if (!mob) return { ok: false, reason: 'missing' };
  sim.dealDamage(p, mob, mob.hp + 5000, false, 'physical', 'smoke', 'hit', true);
  sim.tick();
  const qp = sim.meta(sim.playerId).questLog.get('q_fc_warden');
  return { ok: mob.dead, quest: qp?.counts?.[0] ?? 0, lootable: mob.lootable };
}, setup.warden);
check('crypt_warden killed', wardenKill.ok, JSON.stringify(wardenKill));
check('crypt_warden quest credited', wardenKill.quest === 1);
check('crypt_warden corpse lootable', wardenKill.lootable === true);

const exit = await page.evaluate(() => {
  const sim = window.__game.sim;
  const p = sim.player;
  sim.leaveCrypt();
  return {
    x: p.pos.x,
    z: p.pos.z,
    doorDist: Math.hypot(p.pos.x - 80, p.pos.z - 86),
  };
});
check('left crypt to overworld', exit.x < 200, JSON.stringify(exit));
check('spawned near chapel door', exit.doorDist < 8, JSON.stringify(exit));

await page.screenshot({ path: 'tmp/crypt_03_exit.png' });

console.log(errors.length ? 'PAGE ERRORS:\n' + errors.slice(0, 8).join('\n') : 'no page errors');
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
