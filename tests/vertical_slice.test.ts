import { describe, expect, it } from 'vitest';
import { MOBS } from '../src/sim/data';
import { createMob } from '../src/sim/entity';
import { Sim } from '../src/sim/sim';
import { terrainHeight } from '../src/sim/world';

function nearestWolf(sim: Sim) {
  return [...sim.entities.values()].find(
    (e) => e.kind === 'mob' && e.templateId === 'forest_wolf' && !e.dead && e.ownerId === null,
  )!;
}

describe('gameplay vertical slice', () => {
  it('forest_wolf matches slice tuning (35 HP, 3 dmg, 45 XP)', () => {
    const wolf = createMob(1, MOBS.forest_wolf, 1, { x: 0, y: 0, z: 0 });
    expect(wolf.maxHp).toBe(35);
    expect(wolf.weapon.min).toBe(2);
    expect(wolf.weapon.max).toBe(4);
    expect(MOBS.forest_wolf.xpReward).toBe(45);
  });

  it('spawns starter wolves north of Eastbrook', () => {
    const sim = new Sim({ seed: 42, playerClass: 'warrior', autoEquip: true });
    const nearTown = [...sim.entities.values()].filter(
      (e) => e.kind === 'mob' && e.templateId === 'forest_wolf' && e.pos.z < 45 && e.pos.z > 15,
    );
    expect(nearTown.length).toBeGreaterThanOrEqual(5);
  });

  it('kill wolf → XP → loot → respawn', () => {
    const sim = new Sim({ seed: 7, playerClass: 'warrior', autoEquip: true });
    const wolf = nearestWolf(sim);
    const startXp = sim.xp;
    const startLevel = sim.player.level;

    sim.player.pos.x = wolf.pos.x;
    sim.player.pos.z = wolf.pos.z + 2;
    sim.player.pos.y = terrainHeight(sim.player.pos.x, sim.player.pos.z, sim.cfg.seed);
    sim.player.prevPos = { ...sim.player.pos };
    sim.player.facing = Math.atan2(wolf.pos.x - sim.player.pos.x, wolf.pos.z - sim.player.pos.z);
    sim.targetEntity(wolf.id);
    sim.startAutoAttack();

    let killed = false;
    for (let i = 0; i < 20 * 30 && !killed; i++) {
      const events = sim.tick();
      if (events.some((e) => e.type === 'death' && e.entityId === wolf.id)) killed = true;
    }
    expect(killed).toBe(true);
    expect(sim.xp).toBeGreaterThan(startXp);
    expect(sim.player.level).toBeGreaterThanOrEqual(startLevel);
    expect(wolf.lootable).toBe(true);

    sim.lootCorpse(wolf.id);
    const invCount = sim.inventory.reduce((n, s) => n + s.count, 0);
    expect(invCount).toBeGreaterThan(0);

    const corpseId = wolf.id;
    let respawned = false;
    for (let i = 0; i < 20 * 600 && !respawned; i++) {
      sim.tick();
      const e = sim.entities.get(corpseId);
      if (e && !e.dead && e.hp > 0) respawned = true;
    }
    expect(respawned).toBe(true);
  });
});
