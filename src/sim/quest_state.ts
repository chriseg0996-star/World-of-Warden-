import type { QuestProgress, QuestState } from './types';
import { QUESTS } from './data';
import { ZONE1_QUEST_ORDER } from './content/zone1';
import { ZONE2_QUEST_ORDER } from './content/zone2';
import { ZONE3_QUEST_ORDER } from './content/zone3';
import { TEMPLE_QUEST_ORDER } from './content/temple';

const ZONE_QUEST_ORDERS: Record<string, readonly string[]> = {
  eastbrook_vale: ZONE1_QUEST_ORDER,
  mirefen_marsh: ZONE2_QUEST_ORDER,
  thornpeak_heights: ZONE3_QUEST_ORDER,
  drowned_temple: TEMPLE_QUEST_ORDER,
};

// Pure quest-state computation, shared by the sim and the network client.
export function computeQuestState(
  questId: string,
  questLog: Map<string, QuestProgress>,
  questsDone: Set<string>,
  playerLevel: number,
): QuestState {
  if (questsDone.has(questId)) return 'done';
  const qp = questLog.get(questId);
  if (qp) return qp.state === 'ready' ? 'ready' : 'active';
  const quest = QUESTS[questId];
  if (!quest) return 'unavailable';
  if (quest.requiresQuest && !questsDone.has(quest.requiresQuest)) return 'unavailable';
  if (quest.minLevel && playerLevel < quest.minLevel) return 'unavailable';
  return 'available';
}

/** The one quest the zone guide spotlights: active/ready first, else next available. */
export function guidedQuestIdForZone(
  zoneId: string,
  questLog: Map<string, QuestProgress>,
  questsDone: Set<string>,
  playerLevel: number,
): string | null {
  const order = ZONE_QUEST_ORDERS[zoneId];
  if (!order) return null;
  for (const qid of order) {
    const st = computeQuestState(qid, questLog, questsDone, playerLevel);
    if (st === 'active' || st === 'ready') return qid;
  }
  for (const qid of order) {
    if (computeQuestState(qid, questLog, questsDone, playerLevel) === 'available') return qid;
  }
  return null;
}

/** Givers only surface the guided next quest; turn-ins always show when ready. */
export function isQuestNpcOffer(
  questId: string,
  zoneId: string,
  questLog: Map<string, QuestProgress>,
  questsDone: Set<string>,
  playerLevel: number,
  role: 'giver' | 'turnIn',
  npcTemplateId: string,
): boolean {
  const quest = QUESTS[questId];
  if (!quest) return false;
  const st = computeQuestState(questId, questLog, questsDone, playerLevel);
  if (role === 'turnIn') {
    return st === 'ready' && quest.turnInNpcId === npcTemplateId;
  }
  if (st !== 'available' || quest.giverNpcId !== npcTemplateId) return false;
  const guided = guidedQuestIdForZone(zoneId, questLog, questsDone, playerLevel);
  return questId === guided;
}
