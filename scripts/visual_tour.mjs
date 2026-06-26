// Visual tour: screenshots of the overhauled game for inspection.
// VISUAL_VIEWPORT=desktop|mobile|both (default desktop)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

import { BROWSER_PATH as EDGE } from './browser_path.mjs';

const URL = process.env.GAME_URL ?? 'http://localhost:5173';
const CLASS = process.env.GAME_CLASS ?? 'warrior';
const VIEWPORT_MODE = process.argv.includes('--mobile') ? 'mobile'
  : process.argv.includes('--both') ? 'both'
  : (process.env.VISUAL_VIEWPORT ?? 'desktop').toLowerCase();

const VIEWPORTS = {
  desktop: {
    label: 'desktop',
    width: 1600,
    height: 900,
    isMobile: false,
    hasTouch: false,
    prefix: 't',
    windowSize: '1600,900',
  },
  mobile: {
    label: 'mobile',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    prefix: 'm',
    windowSize: '390,844',
  },
};

function selectedViewports() {
  if (VIEWPORT_MODE === 'both') return [VIEWPORTS.desktop, VIEWPORTS.mobile];
  const vp = VIEWPORTS[VIEWPORT_MODE];
  if (!vp) throw new Error(`Unknown VISUAL_VIEWPORT=${VIEWPORT_MODE}; use desktop, mobile, or both.`);
  return [vp];
}

fs.mkdirSync('tmp', { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const tap = (page, sel) => page.evaluate((s) => document.querySelector(s)?.click(), sel);

async function enableCoarsePointer(page) {
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }] });
}

async function runTour(page, viewport, errors) {
  const { prefix, width, height, isMobile, hasTouch } = viewport;
  const shot = (id) => `tmp/${prefix}${id}.png`;

  await page.setViewport({ width, height, isMobile, hasTouch, deviceScaleFactor: 1 });
  if (isMobile) await enableCoarsePointer(page);

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(isMobile ? 500 : 200);
  await tap(page, '#btn-offline');
  await wait(200);
  await page.screenshot({ path: shot('00_start.png') });

  if (isMobile) {
    await page.evaluate(() => {
      const n = document.querySelector('#char-name');
      if (n) {
        n.value = 'Thorgar';
        n.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  } else {
    await page.type('#char-name', 'Thorgar');
  }
  await tap(page, `#offline-select .mini-class[data-class="${CLASS}"]`);
  await tap(page, '#btn-start-offline');
  if (isMobile) {
    await page.waitForSelector('#mobile-preflight-continue', { timeout: 8000 }).catch(() => null);
    await tap(page, '#mobile-preflight-continue');
  }
  await page.waitForFunction(
    () => Boolean(window.__game?.sim?.player),
    { timeout: 30000, polling: 200 },
  );
  await wait(1500);
  await page.screenshot({ path: shot('01_town.png') });

  await page.evaluate(() => {
    const p = window.__game.sim.player;
    p.maxHp = 99999;
    p.hp = 99999;
  });

  const tp = async (x, z, yaw = 0) => {
    await page.evaluate((x, z, yaw) => {
      const g = window.__game;
      const p = g.sim.player;
      if (p.dead) g.sim.releaseSpirit();
      p.maxHp = 99999;
      p.hp = 99999;
      p.pos.x = x;
      p.pos.z = z;
      p.facing = yaw;
      g.input.camYaw = yaw;
    }, x, z, yaw);
    await wait(700);
  };

  if (isMobile) {
    await tap(page, '#mobile-more');
    await wait(400);
    await page.screenshot({ path: shot('02_more_tray.png') });
    await tap(page, '#mobile-more');
    await wait(200);
  } else {
    await tp(0, -22, 0);
    await page.screenshot({ path: shot('02_town_view.png') });
    await tp(-15, 45, 0.4);
    await page.screenshot({ path: shot('03_wolves.png') });
    await tp(-58, 50, -0.9);
    await page.screenshot({ path: shot('04_lake.png') });
    await tp(-72, -55, -2.4);
    await page.screenshot({ path: shot('05_mine.png') });
    await tp(55, -55, 2.4);
    await page.screenshot({ path: shot('06_bandits.png') });
    await tp(70, 68, 0.8);
    await page.screenshot({ path: shot('07_ruins.png') });
  }

  await page.evaluate(() => {
    const g = window.__game;
    const sim = g.sim;
    const p = sim.player;
    let wolf = null;
    let d = 1e9;
    for (const e of sim.entities.values()) {
      if (e.templateId === 'forest_wolf' && !e.dead) {
        const dd = Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z);
        if (dd < d) { d = dd; wolf = e; }
      }
    }
    if (!wolf) return;
    p.pos.x = wolf.pos.x + 3;
    p.pos.z = wolf.pos.z;
    p.facing = Math.atan2(wolf.pos.x - p.pos.x, wolf.pos.z - p.pos.z);
    g.input.camYaw = p.facing;
    sim.targetEntity(wolf.id);
    sim.startAutoAttack();
  });
  await wait(2500);
  await page.screenshot({ path: shot(isMobile ? '03_combat.png' : '08_combat.png') });

  if (isMobile) {
    await tap(page, '#mobile-char');
  } else {
    await page.keyboard.press('c');
  }
  await wait(350);
  await page.screenshot({ path: shot(isMobile ? '04_character.png' : '09_character.png') });
  if (isMobile) {
    await tap(page, '#mobile-char');
  } else {
    await page.keyboard.press('c');
    await page.keyboard.press('p');
    await wait(300);
    await page.screenshot({ path: shot('10_spellbook.png') });
    await page.keyboard.press('p');
  }

  if (!isMobile) {
    await page.evaluate(() => {
      window.__game.sim.player.pos.x = 4;
      window.__game.sim.player.pos.z = 3;
    });
    await wait(200);
    await page.keyboard.press('f');
    await wait(400);
    await page.screenshot({ path: shot('11_gossip.png') });
    await page.evaluate(() => {
      const items = [...document.querySelectorAll('#quest-dialog .qd-list-item')];
      if (items[0]) items[0].click();
    });
    await wait(300);
    await page.screenshot({ path: shot('12_quest_detail.png') });
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('#quest-dialog .btn')];
      const accept = btns.find((b) => b.textContent === 'Accept');
      if (accept) accept.click();
      document.querySelector('#quest-dialog [data-close]')?.click();
    });
    await page.keyboard.press('l');
    await wait(300);
    await page.screenshot({ path: shot('13_questlog.png') });
    await page.keyboard.press('l');

    await page.evaluate(() => {
      const g = window.__game;
      const wilkes = [...g.sim.entities.values()].find((e) => e.templateId === 'trader_wilkes');
      g.sim.player.pos.x = wilkes.pos.x + 2;
      g.sim.player.pos.z = wilkes.pos.z;
      g.sim.copper = 500;
      g.hud.openVendor(wilkes.id);
    });
    await wait(300);
    await page.screenshot({ path: shot('14_vendor.png') });
    await page.keyboard.press('Escape');
  }

  if (isMobile) {
    await tap(page, '#mobile-map');
  } else {
    await page.keyboard.press('m');
  }
  await wait(400);
  await page.screenshot({ path: shot(isMobile ? '05_map.png' : '15_map.png') });
  if (isMobile) {
    await tap(page, '#mobile-map');
  } else {
    await page.keyboard.press('m');
  }

  await page.keyboard.press('Escape');
  await wait(350);
  await page.screenshot({ path: shot(isMobile ? '06_options.png' : '16_options.png') });
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#options-menu .opt-btn')];
    const gfx = btns.find((b) => b.textContent?.includes('Graphic') || b.textContent?.includes('Gráfic'));
    if (gfx) gfx.click();
  });
  await wait(350);
  await page.screenshot({ path: shot(isMobile ? '07_graphics.png' : '17_graphics.png') });
  await page.keyboard.press('Escape');
  await wait(200);

  await page.evaluate(() => {
    const p = window.__game.sim.player;
    p.level = 10;
    p.maxHp = 99999;
    p.hp = 99999;
  });
  if (isMobile) {
    await tap(page, '#mobile-talents');
  } else {
    await page.keyboard.press('n');
  }
  await wait(400);
  await page.screenshot({ path: shot(isMobile ? '08_talents.png' : '18_talents.png') });
  if (isMobile) {
    await tap(page, '#mobile-talents');
  } else {
    await page.keyboard.press('n');
  }

  console.log(`[${viewport.label}] tour complete (${prefix}*.png)`);
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  defaultViewport: null,
});

const errors = [];
try {
  for (const viewport of selectedViewports()) {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push(`[${viewport.label}] PAGEERROR: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      errors.push(`[${viewport.label}] CONSOLE: ${m.text()}`);
    });
    await runTour(page, viewport, errors);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(errors.length ? 'ERRORS:\n' + errors.slice(0, 20).join('\n') : 'no page errors');
