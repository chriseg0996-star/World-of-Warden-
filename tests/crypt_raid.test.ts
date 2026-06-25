// Headless five-player Forgotten Crypt raid — mirrors scripts/crypt_raid.mjs without
// Postgres or a live server (Docker unavailable in some dev environments).
import { describe, expect, it, vi } from 'vitest';

vi.mock('../server/db', () => ({
  pool: { query: vi.fn(async () => ({ rows: [] })) },
  saveCharacterState: vi.fn(async () => {}),
  openPlaySession: vi.fn(async () => 1),
  closePlaySession: vi.fn(async () => {}),
  insertChatLogs: vi.fn(async () => {}),
}));

import { GameServer, type ClientSession } from '../server/game';
import { Sim } from '../src/sim/sim';
import { abilitiesKnownAt, instanceOrigin } from '../src/sim/data';
import { emptyMoveInput, type Entity, type PlayerClass } from '../src/sim/types';
import { groundHeight } from '../src/sim/world';

const ELITE_MOBS = new Set(['bone_guardian', 'cult_adept', 'crypt_warden']);
const RAID_ROSTER: { name: string; cls: PlayerClass }[] = [
  { name: 'Tankrik', cls: 'warrior' },
  { name: 'Lumen', cls: 'paladin' },
  { name: 'Vessa', cls: 'priest' },
  { name: 'Pyrra', cls: 'mage' },
  { name: 'Fletch', cls: 'hunter' },
];

function makeWorld() {
  return new Sim({ seed: 42, playerClass: 'warrior', noPlayer: true });
}

function teleport(sim: Sim, pid: number, x: number, z: number) {
  const e = sim.entities.get(pid)!;
  e.pos.x = x;
  e.pos.z = z;
  e.pos.y = groundHeight(x, z, sim.cfg.seed);
  e.prevPos = { ...e.pos };
}

function setMove(sim: Sim, pid: number, forward: boolean, facing: number) {
  const meta = sim.meta(pid)!;
  meta.moveInput = { ...emptyMoveInput(), forward };
  sim.entities.get(pid)!.facing = facing;
}

function stopMove(sim: Sim, pid: number) {
  sim.meta(pid)!.moveInput = emptyMoveInput();
}

function dist(sim: Sim, pid: number, pos: { x: number; z: number }) {
  const e = sim.entities.get(pid)!;
  return Math.hypot(pos.x - e.pos.x, pos.z - e.pos.z);
}

function faceTo(sim: Sim, pid: number, pos: { x: number; z: number }) {
  const e = sim.entities.get(pid)!;
  e.facing = Math.atan2(pos.x - e.pos.x, pos.z - e.pos.z);
}

function knows(sim: Sim, pid: number, abilityId: string) {
  const meta = sim.meta(pid)!;
  const e = sim.entities.get(pid)!;
  return abilitiesKnownAt(meta.cls, e.level, meta.talentMods).some((k) => k.def.id === abilityId);
}

function mobsNear(sim: Sim, anchorPid: number, range: number): Entity[] {
  const anchor = sim.entities.get(anchorPid)!;
  return [...sim.entities.values()].filter((e) => {
    if (e.kind !== 'mob' || e.dead || !e.hostile) return false;
    return Math.hypot(e.pos.x - anchor.pos.x, e.pos.z - anchor.pos.z) < range;
  });
}

function raidStep(sim: Sim, roster: { pid: number; cls: PlayerClass }[], tankPid: number) {
  const tank = sim.entities.get(tankPid)!;
  const healers = new Set(
    roster.filter((r) => r.cls === 'priest' || r.cls === 'paladin').map((r) => r.pid),
  );

  for (const { pid, cls } of roster) {
    const self = sim.entities.get(pid)!;
    if (self.dead) continue;

    if (healers.has(pid)) {
      const party = sim.partyOf(pid);
      const hurt = (party?.members ?? [])
        .map((mpid) => sim.entities.get(mpid)!)
        .filter((e) => !e.dead && e.hp / e.maxHp < 0.85)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (hurt && self.gcdRemaining <= 0 && !self.castingAbility) {
        sim.targetEntity(hurt.id, pid);
        const heal = cls === 'priest' ? 'lesser_heal' : 'holy_light';
        if (knows(sim, pid, heal)) sim.castAbility(heal, pid);
        stopMove(sim, pid);
        continue;
      }
      if (cls === 'priest' && tank && !tank.dead && tank.hp / tank.maxHp < 0.9
        && self.gcdRemaining <= 0 && !self.castingAbility
        && knows(sim, pid, 'power_word_shield')) {
        sim.targetEntity(tankPid, pid);
        sim.castAbility('power_word_shield', pid);
        stopMove(sim, pid);
        continue;
      }
    }

    if (cls === 'paladin' && !(self.auras ?? []).some((a) => a.kind === 'imbue')
      && knows(sim, pid, 'seal_of_righteousness')) {
      sim.castAbility('seal_of_righteousness', pid);
    }
    if (cls === 'hunter' && !self.auras?.some((a) => a.id === 'aspect_of_the_hawk')
      && knows(sim, pid, 'aspect_of_the_hawk')) {
      sim.castAbility('aspect_of_the_hawk', pid);
    }

    const anchor = tank.dead ? self : tank;
    const candidates = mobsNear(sim, anchor.id, 30).sort((a, b) => {
      const aBoss = a.templateId === 'crypt_warden' ? 1 : 0;
      const bBoss = b.templateId === 'crypt_warden' ? 1 : 0;
      return aBoss - bBoss || a.id - b.id;
    });
    const target = candidates[0];
    if (target) {
      const d = dist(sim, pid, target.pos);
      const facing = Math.atan2(target.pos.x - self.pos.x, target.pos.z - self.pos.z);
      faceTo(sim, pid, target.pos);
      const meleeRange = cls === 'warrior' || cls === 'paladin' ? 4 : 26;
      if (d > meleeRange) {
        setMove(sim, pid, true, facing);
      } else {
        stopMove(sim, pid);
        sim.targetEntity(target.id, pid);
        sim.startAutoAttack(pid);
        if (self.gcdRemaining <= 0 && !self.castingAbility) {
          if (cls === 'warrior' && (self.resource ?? 0) >= 15 && knows(sim, pid, 'heroic_strike')) {
            sim.castAbility('heroic_strike', pid);
          } else if (cls === 'paladin' && (self.resource ?? 0) >= 30 && knows(sim, pid, 'judgement')) {
            sim.castAbility('judgement', pid);
          } else if (cls === 'mage' && (self.resource ?? 0) >= 30 && knows(sim, pid, 'fireball')) {
            sim.castAbility('fireball', pid);
          } else if (cls === 'hunter' && (self.resource ?? 0) >= 25 && knows(sim, pid, 'arcane_shot')) {
            sim.castAbility('arcane_shot', pid);
          }
        }
      }
      continue;
    }

    if (pid === tankPid) {
      const goal = { x: anchor.pos.x, z: anchor.pos.z + 8 };
      setMove(sim, pid, true, Math.atan2(goal.x - self.pos.x, goal.z - self.pos.z));
    } else {
      const d = dist(sim, pid, tank.pos);
      if (d > 10) setMove(sim, pid, true, Math.atan2(tank.pos.x - self.pos.x, tank.pos.z - self.pos.z));
      else stopMove(sim, pid);
    }
  }
}

describe('Forgotten Crypt party raid (headless)', () => {
  it('a five-player party clears the Crypt Warden with focus-fire raid AI', { timeout: 30_000 }, () => {
    const sim = makeWorld();
    const pids: number[] = [];
    for (const { name, cls } of RAID_ROSTER) pids.push(sim.addPlayer(cls, name));
    const [tank, ...rest] = pids;
    for (const pid of rest) {
      sim.partyInvite(pid, tank);
      sim.partyAccept(pid);
    }
    expect(sim.partyOf(tank)?.members.length).toBe(5);

    for (const pid of pids) sim.setPlayerLevel(10, pid);
    for (const pid of pids) teleport(sim, pid, 80, 88);
    for (const pid of pids) sim.enterCrypt(pid);

    const slots = pids.map((pid) => sim.instanceSlotAt(sim.entities.get(pid)!.pos));
    expect(new Set(slots).size).toBe(1);
    expect(pids.every((pid) => sim.entities.get(pid)!.pos.x > 600)).toBe(true);

    let sawElite = false;
    let sawPulse = false;
    let bossDead = false;
    const maxTicks = 20 * 600;

    for (let i = 0; i < maxTicks && !bossDead; i++) {
      raidStep(sim, RAID_ROSTER.map((r, idx) => ({ pid: pids[idx], cls: r.cls })), tank);
      const events = sim.tick();
      for (const ev of events) {
        if (ev.type === 'damage' && ev.ability === 'Ground Slam') sawPulse = true;
      }
      for (const e of sim.entities.values()) {
        if (e.kind === 'mob' && ELITE_MOBS.has(e.templateId ?? '')) sawElite = true;
        if (e.templateId === 'crypt_warden' && e.dead) bossDead = true;
      }
    }

    expect(sawElite).toBe(true);
    expect(bossDead).toBe(true);
    expect(sawPulse).toBe(true);
    expect(pids.filter((pid) => sim.entities.get(pid)!.dead).length).toBeLessThan(5);
  });

  it('party members share one hollow_crypt instance via the server enter_crypt command', () => {
    const prev = process.env.ALLOW_DEV_COMMANDS;
    process.env.ALLOW_DEV_COMMANDS = '1';
    try {
      const server = new GameServer();
      function fakeWs() {
        const sent: any[] = [];
        return { sent, ws: { readyState: 1, send: (p: string) => sent.push(JSON.parse(p)) } };
      }
      function join(
        fc: { ws: unknown },
        id: number,
        name: string,
        cls: PlayerClass,
      ): ClientSession {
        const s = server.join(fc.ws as never, id, id, name, cls, null);
        if ('error' in s) throw new Error(s.error);
        return s;
      }
      function cmd(session: ClientSession, payload: object) {
        server.handleMessage(session as never, JSON.stringify({ t: 'cmd', ...payload }));
      }
      function lastSnap(sent: any[]) {
        for (let i = sent.length - 1; i >= 0; i--) if (sent[i].t === 'snap') return sent[i];
        return null;
      }

      const clients = RAID_ROSTER.map((r, i) => {
        const fc = fakeWs();
        const session = join(fc, i + 1, r.name, r.cls);
        return { fc, session, cls: r.cls };
      });
      const [leader, ...followers] = clients;
      for (const c of followers) {
        cmd(leader.session, { cmd: 'pinvite', id: c.session.pid });
        cmd(c.session, { cmd: 'paccept' });
      }
      for (const c of clients) {
        cmd(c.session, { cmd: 'dev_level', level: 10 });
        cmd(c.session, { cmd: 'dev_teleport', x: 80, z: 86 });
        cmd(c.session, { cmd: 'enter_crypt' });
      }
      (server as unknown as { broadcastSnapshots(): void }).broadcastSnapshots();

      const xs = clients.map((c) => lastSnap(c.fc.sent)?.self?.x ?? 0);
      const zs = clients.map((c) => lastSnap(c.fc.sent)?.self?.z ?? 0);
      expect(xs.every((x) => x > 600)).toBe(true);
      expect(Math.max(...zs) - Math.min(...zs)).toBeLessThan(120);

      const slot = server.sim.instanceSlotAt({ x: xs[0], z: zs[0] });
      const origin = instanceOrigin(0, slot!);
      const boss = [...server.sim.entities.values()].find(
        (e) => e.kind === 'mob' && e.templateId === 'crypt_warden'
          && Math.hypot(e.pos.x - origin.x, e.pos.z - origin.z) < 120,
      );
      expect(boss).toBeTruthy();
    } finally {
      if (prev === undefined) delete process.env.ALLOW_DEV_COMMANDS;
      else process.env.ALLOW_DEV_COMMANDS = prev;
    }
  });
});
