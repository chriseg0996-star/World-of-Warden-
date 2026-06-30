import { describe, expect, it } from 'vitest';
import { guidedQuestIdForZone, isQuestNpcOffer } from '../src/sim/quest_state';
import type { QuestProgress } from '../src/sim/types';

function emptyLog(): Map<string, QuestProgress> {
  return new Map();
}

describe('guided quest offers', () => {
  it('spotlights the first quest in zone order for new players', () => {
    expect(guidedQuestIdForZone('eastbrook_vale', emptyLog(), new Set(), 1)).toBe('q_wolves');
  });

  it('hides side quests until the guided chain reaches them', () => {
    const done = new Set(['q_wolves']);
    expect(guidedQuestIdForZone('eastbrook_vale', emptyLog(), done, 1)).toBe('q_wolf_pelts');
    expect(isQuestNpcOffer(
      'q_boars', 'eastbrook_vale', emptyLog(), done, 1, 'giver', 'trader_wilkes',
    )).toBe(false);
    expect(isQuestNpcOffer(
      'q_wolf_pelts', 'eastbrook_vale', emptyLog(), done, 1, 'giver', 'hunter_rowan',
    )).toBe(true);
  });

  it('always shows ready turn-ins at the correct npc', () => {
    const log = new Map<string, QuestProgress>([
      ['q_wolves', { questId: 'q_wolves', counts: [5], state: 'ready' }],
    ]);
    expect(isQuestNpcOffer(
      'q_wolves', 'eastbrook_vale', log, new Set(), 1, 'turnIn', 'marshal_redbrook',
    )).toBe(true);
    expect(isQuestNpcOffer(
      'q_wolves', 'eastbrook_vale', log, new Set(), 1, 'giver', 'marshal_redbrook',
    )).toBe(false);
  });
});
