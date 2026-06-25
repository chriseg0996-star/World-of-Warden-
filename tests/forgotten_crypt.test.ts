// Forgotten Crypt (hollow_crypt): first dungeon vertical slice — entry quest,
// elite/boss kills, loot, and quest chain gating.
import { describe, expect, it } from 'vitest';
import { MOBS, instanceOrigin, DUNGEON_X_THRESHOLD } from '../src/sim/data';
import { emptyAllocation } from '../src/sim/content/talents';
import type { Entity, PlayerClass } from '../src/sim/types';
import { Sim } from '../src/sim/sim';
import { groundHeight } from '../src/sim/world';

function makeSim(level = 10, playerClass: PlayerClass = 'warrior') {
  const sim = new Sim({ seed: 42, playerClass, autoEquip: true });
  sim.setPlayerLevel(level);
  return sim;
}

function teleport(sim: Sim, x: number, z: number, pid?: number) {
  const e = pid ? sim.entities.get(pid)! : sim.player;
  e.pos.x = x;
  e.pos.z = z;
  e.pos.y = groundHeight(x, z, sim.cfg.seed);
  e.prevPos = { ...e.pos };
}

function nearestMob(sim: Sim, templateId: string, from: { x: number; z: number }): Entity | null {
  let best: Entity | null = null;
  let bestD = Infinity;
  for (const e of sim.entities.values()) {
    if (e.kind !== 'mob' || e.dead || e.templateId !== templateId) continue;
    const d = Math.hypot(e.pos.x - from.x, e.pos.z - from.z);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function killMob(sim: Sim, mobId: number, pid?: number) {
  const mob = sim.entities.get(mobId)!;
  (sim as any).dealDamage(pid ? sim.entities.get(pid)! : sim.player, mob, mob.hp + 5000, false, 'physical', 'test', 'hit', true);
  sim.tick();
}

function faceTarget(sim: Sim, target: Entity) {
  const p = sim.player;
  p.facing = Math.atan2(target.pos.x - p.pos.x, target.pos.z - p.pos.z);
}

function hasAura(e: Entity, auraId: string) {
  return (e.auras ?? []).some((a) => a.id === auraId);
}

function pullDist(mob: Entity) {
  // Ritual chamber back wall blocks LOS beyond ~16 yd north of the boss.
  return mob.templateId === 'crypt_warden' ? 16 : 22;
}

function prepDist(mob: Entity) {
  return mob.templateId === 'crypt_warden' ? 17 : pullDist(mob);
}

/** Fixed pull point north of the warden spawn — avoids drifting past the back wall when kiting. */
function wardenPullPos(mob: Entity) {
  return { x: mob.spawnPos.x, z: mob.spawnPos.z + pullDist(mob) };
}

function wardenPrepPos(mob: Entity) {
  return { x: mob.spawnPos.x, z: mob.spawnPos.z + prepDist(mob) };
}

function teleportPrep(sim: Sim, mob: Entity) {
  teleport(sim, mob.pos.x, mob.pos.z + prepDist(mob));
}

function teleportPull(sim: Sim, mob: Entity) {
  teleport(sim, mob.pos.x, mob.pos.z + pullDist(mob));
}

function teleportWardenPrep(sim: Sim, mob: Entity) {
  const p = wardenPrepPos(mob);
  teleport(sim, p.x, p.z);
}

function teleportWardenPull(sim: Sim, mob: Entity) {
  const p = wardenPullPos(mob);
  teleport(sim, p.x, p.z);
}

/** Step back to the anchored pull line when inside the Crypt Warden stomp (10 yd). */
function kiteCryptWarden(sim: Sim, mob: Entity, dist: number) {
  if (mob.templateId !== 'crypt_warden' || dist > 10) return;
  const pull = wardenPullPos(mob);
  teleport(sim, pull.x, pull.z);
  faceTarget(sim, mob);
}

function hostilesOn(sim: Sim, p: Entity, mobId: number) {
  return [...sim.entities.values()].filter((e) => {
    if (e.kind !== 'mob' || e.dead || e.aggroTargetId !== p.id || e.id === mobId) return false;
    if (e.spawnPos.x <= DUNGEON_X_THRESHOLD) return false;
    return Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) <= 25;
  });
}

/** Simple warrior rotation for solo viability checks (deterministic seed 42). */
function clearCryptExcept(sim: Sim, keepTemplateId: string) {
  for (const e of [...sim.entities.values()]) {
    if (e.kind !== 'mob' || e.dead || e.templateId === keepTemplateId) continue;
    killMob(sim, e.id);
  }
}

function fightMobWarrior(sim: Sim, mobId: number, maxTicks = 20 * 300): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 3);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  if (sim.known.some((k) => k.def.id === 'charge')) sim.castAbility('charge');
  sim.startAutoAttack();
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    if (p.gcdRemaining <= 0 && !p.castingAbility) {
      const hostiles = [...sim.entities.values()].filter((e) => {
        if (e.kind !== 'mob' || e.dead || e.aggroTargetId !== p.id) return false;
        if (e.spawnPos.x <= DUNGEON_X_THRESHOLD) return false;
        return Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) <= 25;
      });
      if (!hasAura(p, 'battle_shout')) sim.castAbility('battle_shout');
      else if (hostiles.length > 1 && sim.known.some((k) => k.def.id === 'thunder_clap')) sim.castAbility('thunder_clap');
      else if (!hasAura(m, 'rend') && sim.known.some((k) => k.def.id === 'rend')) sim.castAbility('rend');
      else if ((p.resource ?? 0) >= 30 && sim.known.some((k) => k.def.id === 'mortal_strike')) sim.castAbility('mortal_strike');
      else if ((p.resource ?? 0) >= 15) sim.castAbility('heroic_strike');
      else if ((p.resource ?? 0) < 10 && sim.known.some((k) => k.def.id === 'bloodrage')) sim.castAbility('bloodrage');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Frost mage rotation for solo viability checks. */
function fightMobMage(sim: Sim, mobId: number, maxTicks = 20 * 600): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  if (mob.templateId === 'crypt_warden') {
    teleportPrep(sim, mob);
    faceTarget(sim, mob);
    sim.targetEntity(p.id);
    if (sim.known.some((k) => k.def.id === 'frost_armor') && !hasAura(p, 'frost_armor')) sim.castAbility('frost_armor');
    if (sim.known.some((k) => k.def.id === 'arcane_intellect') && !hasAura(p, 'arcane_intellect')) sim.castAbility('arcane_intellect');
    for (let i = 0; i < 80 && (p.castingAbility || p.channeling); i++) sim.tick();
    teleportPull(sim, mob);
    faceTarget(sim, mob);
    sim.targetEntity(mobId);
    for (let i = 0; i < maxTicks; i++) {
      const m = sim.entities.get(mobId);
      if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
      if (!m || m.dead) return 'killed';
      faceTarget(sim, m);
      const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
      if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
        if (sim.known.some((k) => k.def.id === 'fireball') && (p.resource ?? 0) >= 45) sim.castAbility('fireball');
      }
      sim.tick();
    }
    return 'timeout';
  }
  teleportPrep(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  if (sim.known.some((k) => k.def.id === 'frost_armor') && !hasAura(p, 'frost_armor')) sim.castAbility('frost_armor');
  if (sim.known.some((k) => k.def.id === 'arcane_intellect') && !hasAura(p, 'arcane_intellect')) sim.castAbility('arcane_intellect');
  for (let i = 0; i < 80 && (p.castingAbility || p.channeling); i++) sim.tick();
  teleportPull(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
    if (!p.castingAbility && !p.channeling) kiteCryptWarden(sim, m, dist);
    if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
      const hostiles = hostilesOn(sim, p, mobId);
      if (hostiles.length > 0 && sim.known.some((k) => k.def.id === 'frost_nova') && dist <= 12) sim.castAbility('frost_nova');
      else if (hostiles.length > 0 && m.hp / m.maxHp < 0.35 && sim.known.some((k) => k.def.id === 'fire_blast') && dist <= 12) sim.castAbility('fire_blast');
      else if (sim.known.some((k) => k.def.id === 'fire_blast') && !p.cooldowns.has('fire_blast') && (p.resource ?? 0) >= 20) sim.castAbility('fire_blast');
      else if (dist <= 10 && sim.known.some((k) => k.def.id === 'frost_nova') && !(m.auras ?? []).some((a) => a.kind === 'root')) sim.castAbility('frost_nova');
      else if (dist <= 10 && sim.known.some((k) => k.def.id === 'fire_blast')) sim.castAbility('fire_blast');
      else if (sim.known.some((k) => k.def.id === 'fireball') && (p.resource ?? 0) >= 45) sim.castAbility('fireball');
      else if (sim.known.some((k) => k.def.id === 'frostbolt') && (p.resource ?? 0) >= 35) sim.castAbility('frostbolt');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Assassination rogue rotation for solo viability checks. */
function fightMobRogue(sim: Sim, mobId: number, maxTicks = 20 * 400): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 3);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  sim.startAutoAttack();
  if (sim.known.some((k) => k.def.id === 'sinister_strike')) sim.castAbility('sinister_strike');
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    if (p.gcdRemaining <= 0 && !p.castingAbility) {
      const hpPct = p.hp / p.maxHp;
      const hostiles = [...sim.entities.values()].filter((e) => {
        if (e.kind !== 'mob' || e.dead || e.aggroTargetId !== p.id) return false;
        if (e.spawnPos.x <= DUNGEON_X_THRESHOLD) return false;
        return Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) <= 25;
      });
      if (hostiles.length > 1 && sim.known.some((k) => k.def.id === 'evasion') && !hasAura(p, 'evasion') && hpPct < 0.9) sim.castAbility('evasion');
      else if (hpPct < 0.75 && sim.known.some((k) => k.def.id === 'evasion') && !hasAura(p, 'evasion')) sim.castAbility('evasion');
      else if ((p.comboPoints ?? 0) >= 3 && sim.known.some((k) => k.def.id === 'slice_and_dice') && !hasAura(p, 'slice_and_dice')) sim.castAbility('slice_and_dice');
      else if ((p.comboPoints ?? 0) >= 3 && (p.resource ?? 0) >= 35 && sim.known.some((k) => k.def.id === 'eviscerate')) sim.castAbility('eviscerate');
      else if ((p.resource ?? 0) >= 45 && sim.known.some((k) => k.def.id === 'sinister_strike')) sim.castAbility('sinister_strike');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Marksmanship hunter rotation for solo viability checks. */
function fightMobHunter(sim: Sim, mobId: number, maxTicks = 20 * 500): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 22);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  if (sim.known.some((k) => k.def.id === 'aspect_of_the_hawk') && !hasAura(p, 'aspect_of_the_hawk')) sim.castAbility('aspect_of_the_hawk');
  sim.startAutoAttack();
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
    if (p.gcdRemaining <= 0 && !p.castingAbility) {
      if (dist < 8 && sim.known.some((k) => k.def.id === 'mongoose_bite')) sim.castAbility('mongoose_bite');
      else if (!hasAura(m, 'serpent_sting') && sim.known.some((k) => k.def.id === 'serpent_sting')) sim.castAbility('serpent_sting');
      else if ((p.resource ?? 0) >= 25 && sim.known.some((k) => k.def.id === 'arcane_shot')) sim.castAbility('arcane_shot');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Retribution paladin rotation for solo viability checks. */
function fightMobPaladin(sim: Sim, mobId: number, maxTicks = 20 * 500): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 3);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  sim.startAutoAttack();
  if (sim.known.some((k) => k.def.id === 'seal_of_righteousness') && !(p.auras ?? []).some((a) => a.kind === 'imbue')) {
    sim.castAbility('seal_of_righteousness');
  }
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const hpPct = p.hp / p.maxHp;
    if (p.gcdRemaining <= 0 && !p.castingAbility) {
      const hostiles = [...sim.entities.values()].filter((e) => {
        if (e.kind !== 'mob' || e.dead || e.aggroTargetId !== p.id) return false;
        if (e.spawnPos.x <= DUNGEON_X_THRESHOLD) return false;
        return Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) <= 25;
      });
      if (hpPct < 0.55 && sim.known.some((k) => k.def.id === 'holy_light')) sim.castAbility('holy_light');
      else if (hostiles.length > 1 && sim.known.some((k) => k.def.id === 'consecration')) sim.castAbility('consecration');
      else if (!(p.auras ?? []).some((a) => a.kind === 'imbue') && sim.known.some((k) => k.def.id === 'seal_of_righteousness')) sim.castAbility('seal_of_righteousness');
      else if ((p.resource ?? 0) >= 30 && sim.known.some((k) => k.def.id === 'judgement')) sim.castAbility('judgement');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Shadow priest rotation for solo viability checks. */
function fightMobPriest(sim: Sim, mobId: number, maxTicks = 20 * 600): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleportPrep(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(p.id);
  if (sim.known.some((k) => k.def.id === 'power_word_fortitude') && !hasAura(p, 'power_word_fortitude')) sim.castAbility('power_word_fortitude');
  if (sim.known.some((k) => k.def.id === 'renew') && !hasAura(p, 'renew')) sim.castAbility('renew');
  for (let i = 0; i < 80 && (p.castingAbility || p.channeling); i++) sim.tick();
  teleportPull(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const hpPct = p.hp / p.maxHp;
    if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
      if (hpPct < 0.5 && sim.known.some((k) => k.def.id === 'power_word_shield') && !p.auras?.some((a) => a.kind === 'absorb')) {
        sim.targetEntity(p.id);
        sim.castAbility('power_word_shield');
        sim.targetEntity(mobId);
      } else if (hpPct < 0.55 && sim.known.some((k) => k.def.id === 'renew') && !hasAura(p, 'renew')) {
        sim.targetEntity(p.id);
        sim.castAbility('renew');
        sim.targetEntity(mobId);
      } else if (hpPct < 0.4 && sim.known.some((k) => k.def.id === 'lesser_heal')) {
        sim.targetEntity(p.id);
        sim.castAbility('lesser_heal');
        sim.targetEntity(mobId);
      }       else if (!hasAura(m, 'shadow_word_pain') && sim.known.some((k) => k.def.id === 'shadow_word_pain')) sim.castAbility('shadow_word_pain');
      else if (m.hp / m.maxHp < 0.35 && sim.known.some((k) => k.def.id === 'mind_blast') && (p.resource ?? 0) >= 50) sim.castAbility('mind_blast');
      else if (sim.known.some((k) => k.def.id === 'mind_blast') && (p.resource ?? 0) >= 50) sim.castAbility('mind_blast');
      else if ((p.resource ?? 0) >= 20 && sim.known.some((k) => k.def.id === 'smite')) sim.castAbility('smite');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Affliction warlock rotation for solo viability checks. */
function fightMobWarlock(sim: Sim, mobId: number, maxTicks = 20 * 700): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleportPrep(sim, mob);
  faceTarget(sim, mob);
  if (sim.known.some((k) => k.def.id === 'demon_skin') && !hasAura(p, 'demon_skin')) sim.castAbility('demon_skin');
  for (let i = 0; i < 40 && (p.castingAbility || p.channeling); i++) sim.tick();
  teleportPull(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
    const manaPct = (p.resource ?? 0) / Math.max(1, p.maxResource ?? 1);
    const hpPct = p.hp / p.maxHp;
    const hostiles = hostilesOn(sim, p, mobId);
    if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
      if (manaPct < 0.2 && hpPct > 0.35 && sim.known.some((k) => k.def.id === 'life_tap')) sim.castAbility('life_tap');
      else if (m.hp / m.maxHp < 0.25 && (p.resource ?? 0) >= 25 && sim.known.some((k) => k.def.id === 'shadow_bolt')) sim.castAbility('shadow_bolt');
      else if (hpPct < 0.8 && dist <= 20 && sim.known.some((k) => k.def.id === 'drain_life') && (p.resource ?? 0) >= 35) sim.castAbility('drain_life');
      else if (!hasAura(m, 'immolate') && sim.known.some((k) => k.def.id === 'immolate') && (p.resource ?? 0) >= 25) sim.castAbility('immolate');
      else if (!hasAura(m, 'corruption') && sim.known.some((k) => k.def.id === 'corruption') && (p.resource ?? 0) >= 35) sim.castAbility('corruption');
      else if (!hasAura(m, 'curse_of_agony') && sim.known.some((k) => k.def.id === 'curse_of_agony') && (p.resource ?? 0) >= 25) sim.castAbility('curse_of_agony');
      else if (hostiles.length > 1 && sim.known.some((k) => k.def.id === 'corruption')) {
        const add = hostiles.find((e) => e.id !== mobId);
        if (add && !hasAura(add, 'corruption')) {
          sim.targetEntity(add.id);
          sim.castAbility('corruption');
          sim.targetEntity(mobId);
        } else if ((p.resource ?? 0) >= 25) sim.castAbility('shadow_bolt');
      } else if ((p.resource ?? 0) >= 25 && sim.known.some((k) => k.def.id === 'shadow_bolt')) sim.castAbility('shadow_bolt');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Balance druid rotation for solo viability checks. */
function fightMobDruidBalance(sim: Sim, mobId: number, maxTicks = 20 * 600): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  const prep = mob.templateId === 'crypt_warden' ? teleportWardenPrep : teleportPrep;
  const pull = mob.templateId === 'crypt_warden' ? teleportWardenPull : teleportPull;
  prep(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(p.id);
  if (sim.known.some((k) => k.def.id === 'mark_of_the_wild') && !hasAura(p, 'mark_of_the_wild')) sim.castAbility('mark_of_the_wild');
  if (sim.known.some((k) => k.def.id === 'rejuvenation') && !hasAura(p, 'rejuvenation')) sim.castAbility('rejuvenation');
  for (let i = 0; i < 80 && (p.castingAbility || p.channeling); i++) sim.tick();
  pull(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
    const hpPct = p.hp / p.maxHp;
    if (!p.castingAbility && !p.channeling) kiteCryptWarden(sim, m, dist);
    if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
      const hostiles = hostilesOn(sim, p, mobId);
      if (hpPct < 0.55 && sim.known.some((k) => k.def.id === 'healing_touch')) {
        sim.targetEntity(p.id);
        sim.castAbility('healing_touch');
        sim.targetEntity(mobId);
      } else if (hpPct < 0.7 && sim.known.some((k) => k.def.id === 'rejuvenation') && !hasAura(p, 'rejuvenation')) {
        sim.targetEntity(p.id);
        sim.castAbility('rejuvenation');
        sim.targetEntity(mobId);
      } else if (hostiles.length > 0 && sim.known.some((k) => k.def.id === 'entangling_roots') && !(m.auras ?? []).some((a) => a.kind === 'root')) sim.castAbility('entangling_roots');
      else if (dist <= 10 && sim.known.some((k) => k.def.id === 'entangling_roots') && !(m.auras ?? []).some((a) => a.kind === 'root')) sim.castAbility('entangling_roots');
      else if (!hasAura(m, 'moonfire') && sim.known.some((k) => k.def.id === 'moonfire') && (p.resource ?? 0) >= 25) sim.castAbility('moonfire');
      else if ((p.resource ?? 0) >= 20 && sim.known.some((k) => k.def.id === 'wrath')) sim.castAbility('wrath');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Elemental shaman rotation for solo viability checks. */
function fightMobShaman(sim: Sim, mobId: number, maxTicks = 20 * 700): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleportPrep(sim, mob);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  if (sim.known.some((k) => k.def.id === 'rockbiter_weapon') && !hasAura(p, 'rockbiter_weapon')) sim.castAbility('rockbiter_weapon');
  if (sim.known.some((k) => k.def.id === 'lightning_shield') && !hasAura(p, 'lightning_shield')) sim.castAbility('lightning_shield');
  for (let i = 0; i < 80 && (p.castingAbility || p.channeling); i++) sim.tick();
  if (mob.templateId === 'crypt_warden') {
    teleportPull(sim, mob);
    faceTarget(sim, mob);
    sim.targetEntity(mobId);
  }
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
    const hpPct = p.hp / p.maxHp;
    if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
      const hostiles = hostilesOn(sim, p, mobId);
      if (hpPct < 0.35 && sim.known.some((k) => k.def.id === 'healing_wave')) {
        sim.targetEntity(p.id);
        sim.castAbility('healing_wave');
        sim.targetEntity(mobId);
      } else if (hostiles.length > 1 && sim.known.some((k) => k.def.id === 'earth_shock')) sim.castAbility('earth_shock');
      else if (!hasAura(m, 'flame_shock') && sim.known.some((k) => k.def.id === 'flame_shock') && (p.resource ?? 0) >= 35) sim.castAbility('flame_shock');
      else if (m.hp / m.maxHp < 0.3 && sim.known.some((k) => k.def.id === 'earth_shock') && (p.resource ?? 0) >= 30) sim.castAbility('earth_shock');
      else if ((p.resource ?? 0) >= 15 && sim.known.some((k) => k.def.id === 'lightning_bolt')) sim.castAbility('lightning_bolt');
    }
    sim.tick();
  }
  return 'timeout';
}

describe('Forgotten Crypt dungeon slice', () => {
  it('dungeon door at the Fallen Chapel enters hollow_crypt on proximity', () => {
    const sim = makeSim(5);
    const door = [...sim.entities.values()].find(
      (e) => e.kind === 'object' && e.templateId === 'dungeon_door' && e.dungeonId === 'hollow_crypt',
    );
    expect(door).toBeTruthy();
    teleport(sim, door!.pos.x, door!.pos.z);
    sim.tick();
    expect(sim.player.pos.x).toBeGreaterThan(600);
    expect(sim.instanceSlotAt(sim.player.pos)).not.toBeNull();
  });

  it('leaveDungeon returns the player to the Forgotten Crypt door', () => {
    const sim = makeSim(5);
    sim.enterCrypt();
    expect(sim.player.pos.x).toBeGreaterThan(600);
    sim.leaveCrypt();
    expect(sim.player.pos.x).toBeLessThan(200);
    expect(Math.hypot(sim.player.pos.x - 80, sim.player.pos.z - 86)).toBeLessThan(6);
  });

  it('level 8 offense warrior can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8);
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'offense',
      ranks: { off_brutality: 1, off_lethal_blows: 1, off_deep_wounds: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobWarrior(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 10 offense warrior with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10);
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'offense',
      ranks: {
        war_battle_training: 2,
        off_brutality: 1,
        off_lethal_blows: 1,
        off_deep_wounds: 2,
      },
    });
    sim.inventory.push({ itemId: 'wardens_hammer', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('wardens_hammer');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobWarrior(sim, warden.id, 20 * 400)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 10 fire mage with dungeon gear can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(10, 'mage');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'fire',
      ranks: {
        mag_improved_fireball: 2,
        fire_pyromancy: 1,
        fire_critical_mass: 1,
        fire_burning_soul: 2,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'ancient_ring', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('ancient_ring');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobMage(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 10 assassination rogue with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'rogue');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'assassination',
      ranks: {
        ass_deadliness: 1,
        ass_ruthlessness: 1,
        ass_lethality: 2,
        ass_finishing_moves: 2,
      },
    });
    sim.inventory.push({ itemId: 'crypt_blade', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('crypt_blade');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobRogue(sim, warden.id, 20 * 500)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 8 assassination rogue can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'rogue');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'assassination',
      ranks: { ass_deadliness: 1, ass_ruthlessness: 1, ass_lethality: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobRogue(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 8 marksmanship hunter can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'hunter');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'marksmanship',
      ranks: { mm_imp_arcane_shot: 1, mm_lethal_shots: 1, mm_aimed_focus: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobHunter(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 10 retribution paladin with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'paladin');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'retribution',
      ranks: {
        ret_conviction: 1,
        ret_seal_command: 2,
        ret_imp_judgement: 2,
        ret_zeal: 1,
      },
    });
    sim.inventory.push({ itemId: 'crypt_blade', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('crypt_blade');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobPaladin(sim, warden.id, 20 * 600)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 8 shadow priest can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'priest');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'shadow',
      ranks: { shadow_blackout: 1, shadow_word_pain: 1, shadow_focus: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobPriest(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 8 balance druid can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'druid');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'balance',
      ranks: { bal_imp_wrath: 1, bal_imp_moonfire: 1, bal_vengeance: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobDruidBalance(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 8 affliction warlock can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'warlock');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'affliction',
      ranks: { aff_imp_corruption: 1, aff_imp_agony: 1, aff_fel_concentration: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobWarlock(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 8 elemental shaman can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'shaman');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'elemental',
      ranks: { ele_concussion: 1, ele_call_flame: 1, ele_elemental_focus: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobShaman(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 10 fire mage with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'mage');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'fire',
      ranks: {
        mag_improved_fireball: 2,
        fire_pyromancy: 1,
        fire_critical_mass: 1,
        fire_burning_soul: 2,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'bone_shield', qty: 1 }, { itemId: 'ancient_ring', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('bone_shield');
    sim.equipItem('ancient_ring');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobMage(sim, warden.id, 20 * 700)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 10 shadow priest with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'priest');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'shadow',
      ranks: {
        shadow_blackout: 1,
        shadow_word_pain: 2,
        shadow_focus: 2,
        shadow_darkness: 1,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobPriest(sim, warden.id, 20 * 700)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 10 affliction warlock with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'warlock');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'affliction',
      ranks: {
        aff_imp_corruption: 1,
        aff_imp_agony: 1,
        aff_fel_concentration: 2,
        aff_amplify_curse: 1,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobWarlock(sim, warden.id, 20 * 700)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 10 elemental shaman with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'shaman');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'elemental',
      ranks: {
        ele_concussion: 1,
        ele_call_flame: 1,
        ele_elemental_focus: 2,
        ele_lightning_mastery: 1,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobShaman(sim, warden.id, 20 * 700)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 10 balance druid with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10, 'druid');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'balance',
      ranks: {
        bal_imp_wrath: 1,
        bal_imp_moonfire: 2,
        bal_natures_reach: 1,
        bal_moonglow: 2,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobDruidBalance(sim, warden.id, 20 * 700)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('scales elite and boss levels within template bands', () => {
    const sim = makeSim(8);
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const slot = sim.instanceSlotAt(sim.player.pos)!;
    const origin = instanceOrigin(0, slot);
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    expect(guardian.level).toBeGreaterThanOrEqual(MOBS.bone_guardian.minLevel);
    expect(guardian.level).toBeLessThanOrEqual(MOBS.bone_guardian.maxLevel);
    expect(warden.level).toBeGreaterThanOrEqual(MOBS.crypt_warden.minLevel);
    expect(warden.level).toBeLessThanOrEqual(MOBS.crypt_warden.maxLevel);
  });

  it('credits Enter the Crypt when the player enters hollow_crypt', () => {
    const sim = makeSim(5);
    teleport(sim, -14, -10);
    sim.acceptQuest('q_fc_enter');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const qp = sim.meta(sim.playerId)!.questLog.get('q_fc_enter')!;
    expect(qp.counts[0]).toBe(1);
    expect(qp.state).toBe('ready');
  });

  it('gates the Forgotten Crypt quest chain by level and prerequisites', () => {
    const sim = new Sim({ seed: 42, playerClass: 'warrior' });
    sim.setPlayerLevel(4);
    expect(sim.questState('q_fc_enter')).toBe('unavailable');
    sim.setPlayerLevel(5);
    expect(sim.questState('q_fc_enter')).toBe('available');
    expect(sim.questState('q_fc_guardian')).toBe('unavailable');
    sim.questsDone.add('q_fc_enter');
    expect(sim.questState('q_fc_guardian')).toBe('available');
    sim.questsDone.add('q_fc_guardian');
    expect(sim.questState('q_fc_warden')).toBe('available');
  });

  it('credits kill objectives for Bone Guardian and the Crypt Warden', () => {
    const sim = makeSim();
    const meta = sim.meta(sim.playerId)!;
    meta.questLog.set('q_fc_guardian', { questId: 'q_fc_guardian', counts: [0], state: 'active' });
    meta.questLog.set('q_fc_warden', { questId: 'q_fc_warden', counts: [0], state: 'active' });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const slot = sim.instanceSlotAt(sim.player.pos)!;
    const origin = instanceOrigin(0, slot);
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    expect(guardian).toBeTruthy();
    expect(warden).toBeTruthy();

    killMob(sim, guardian.id);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_guardian')!.counts[0]).toBe(1);

    killMob(sim, warden.id);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_warden')!.counts[0]).toBe(1);
    expect(warden.lootable).toBe(true);
  });

  it('Crypt Warden drops dungeon gear on kill', () => {
    const sim = makeSim();
    const meta = sim.meta(sim.playerId)!;
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const slot = sim.instanceSlotAt(sim.player.pos)!;
    const warden = nearestMob(sim, 'crypt_warden', instanceOrigin(0, slot))!;
    killMob(sim, warden.id);
    (sim as any).rollLoot(warden, meta);
    const drops = warden.loot?.items?.map((s) => s.itemId) ?? [];
    expect(drops.length).toBeGreaterThan(0);
    expect(drops.some((id) => ['crypt_blade', 'cultist_robes', 'bone_shield', 'wardens_hammer', 'ancient_ring'].includes(id))).toBe(true);
  });

  it('spawn list covers three wings with the expected trash and elites', () => {
    expect(MOBS.skeleton_warrior).toBeTruthy();
    expect(MOBS.crypt_warden.boss).toBe(true);
    expect(MOBS.bone_guardian.elite).toBe(true);
    expect(MOBS.cult_adept.elite).toBe(true);
    expect(MOBS.crypt_warden.summonAdds?.mobId).toBe('skeleton_warrior_add');
    expect(MOBS.skeleton_warrior_add.loot).toEqual([]);
  });

  it('completes the Alden crypt quest chain through boss turn-in', () => {
    const sim = makeSim(8);
    const meta = sim.meta(sim.playerId)!;
    const xp0 = meta.lifetimeXp;
    const alden = { x: -14, z: -10 };
    const door = { x: 80, z: 88 };

    teleport(sim, alden.x, alden.z);
    sim.acceptQuest('q_fc_enter');
    teleport(sim, door.x, door.z);
    sim.enterCrypt();
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_enter')!.state).toBe('ready');
    teleport(sim, alden.x, alden.z);
    sim.turnInQuest('q_fc_enter');
    expect(meta.questsDone.has('q_fc_enter')).toBe(true);

    sim.acceptQuest('q_fc_guardian');
    teleport(sim, door.x, door.z);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    killMob(sim, nearestMob(sim, 'bone_guardian', origin)!.id);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_guardian')!.state).toBe('ready');
    teleport(sim, alden.x, alden.z);
    sim.turnInQuest('q_fc_guardian');
    expect(meta.questsDone.has('q_fc_guardian')).toBe(true);
    const hasBoneShield = sim.inventory.some((s) => s.itemId === 'bone_shield')
      || Object.values(meta.equipment).includes('bone_shield');
    expect(hasBoneShield).toBe(true);

    sim.acceptQuest('q_fc_warden');
    teleport(sim, door.x, door.z);
    sim.enterCrypt();
    const origin2 = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin2)!;
    killMob(sim, warden.id);
    (sim as any).rollLoot(warden, meta);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_warden')!.state).toBe('ready');
    teleport(sim, alden.x, alden.z);
    sim.turnInQuest('q_fc_warden');
    expect(meta.questsDone.has('q_fc_warden')).toBe(true);
    expect(meta.lifetimeXp).toBeGreaterThan(xp0);
    const hasWardenHammer = sim.inventory.some((s) => s.itemId === 'wardens_hammer')
      || Object.values(meta.equipment).includes('wardens_hammer');
    expect(hasWardenHammer).toBe(true);
  });
});
