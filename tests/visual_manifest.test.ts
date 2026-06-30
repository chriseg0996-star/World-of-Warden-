import { describe, expect, it } from 'vitest';
import { VISUALS, mobVisualMods, visualKeyFor } from '../src/render/characters/manifest';
import type { Entity } from '../src/sim/types';

function mobEntity(templateId: string, flags: Partial<Entity> = {}): Entity {
  return {
    id: 1,
    kind: 'mob',
    templateId,
    pos: { x: 0, y: 0, z: 0 },
    prevPos: { x: 0, y: 0, z: 0 },
    facing: 0,
    prevFacing: 0,
    color: 0xffffff,
    scale: 1,
    dead: false,
    skin: 0,
    auras: [],
    ...flags,
  } as Entity;
}

describe('character visual manifest', () => {
  it('uses the custom boar death clip without relying on a speed override', () => {
    expect(VISUALS.mob_boar.clips.death).toBe('Dying');
    expect(VISUALS.mob_boar.deathTimeScale).toBeUndefined();
  });

  it('maps zone mobs to role-specific rigs instead of generic family fallbacks', () => {
    expect(visualKeyFor(mobEntity('drowned_dead'))).toBe('skel_warrior');
    expect(visualKeyFor(mobEntity('mirefen_broodmother'))).toBe('mob_spider');
    expect(visualKeyFor(mobEntity('wyrmcult_zealot'))).toBe('mob_bruiser');
    expect(visualKeyFor(mobEntity('korzul_the_gravewyrm'))).toBe('mob_dragonkin');
  });

  it('boosts elite and rare mob render scale and tint strength', () => {
    expect(mobVisualMods(mobEntity('forest_wolf'))).toEqual({ scaleMul: 1, tintStrengthMul: 1 });
    const elite = mobVisualMods(mobEntity('ogre_crusher'));
    expect(elite.scaleMul).toBeCloseTo(1.08, 5);
    expect(elite.tintStrengthMul).toBeCloseTo(1.15, 5);
    const boss = mobVisualMods(mobEntity('warlord_drogmar'));
    expect(boss.scaleMul).toBeCloseTo(1.08 * 1.04, 5);
    expect(boss.tintStrengthMul).toBeCloseTo(1.15 * 1.1, 5);
    const rare = mobVisualMods(mobEntity('old_greyjaw'));
    expect(rare.scaleMul).toBeCloseTo(1.05, 5);
    expect(rare.tintStrengthMul).toBeCloseTo(1.12, 5);
  });
});
