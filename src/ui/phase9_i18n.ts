import { DUNGEONS, MOBS, NPCS, QUESTS, ZONES } from '../sim/data';

const MOB_IDS = [
  'forest_wolf', 'old_greyjaw', 'wild_boar', 'webwood_spider', 'mudfin_murloc', 'tunnel_rat',
  'vale_bandit', 'restless_bones', 'gorrak', 'mire_prowler', 'deepfen_murloc', 'mire_widow',
  'mirefen_broodmother', 'drowned_dead', 'fen_troll', 'grubjaw', 'gravecaller_cultist',
  'gravecaller_summoner', 'deacon_voss', 'ridge_stalker', 'deeprock_kobold', 'thornpeak_ogre',
  'ogre_crusher', 'warlord_drogmar', 'stormcrag_elemental', 'shardlord_kazzix',
  'wyrmcult_zealot', 'wyrmcult_necromancer', 'boneclad_revenant',
  'skeleton_warrior', 'skeleton_archer', 'restless_spirit', 'crypt_cultist', 'crypt_hound',
  'bone_guardian', 'cult_adept', 'crypt_warden', 'skeleton_warrior_add',
  'bastion_revenant',
  'tidebound_acolyte', 'drowned_thrall', 'knight_commander_olen', 'vael_the_mistcaller',
  'sanctum_boneguard', 'sanctum_drakonid', 'raised_bonewalker', 'korgath_the_bound',
  'grand_necromancer_velkhar', 'korzul_the_gravewyrm',
] as const;

const NPC_IDS = [
  'the_merchant', 'marshal_redbrook', 'trader_wilkes', 'apothecary_lin', 'brother_aldric',
  'smith_haldren', 'fisherman_brandt', 'foreman_odell',
  'innkeeper_eliza', 'hunter_rowan', 'guard_ashford', 'guard_merrick', 'villager_marta', 'villager_cedric',
  'wounded_scout',
  'warden_fenwick', 'brother_aldric_fen',
  'provisioner_hale', 'herbalist_yara', 'scout_maren', 'captain_thessaly',
  'brother_aldric_highwatch', 'scout_maren_highwatch', 'quartermaster_bree', 'armorer_hode',
  'loremaster_caddis',
] as const;

const QUEST_IDS = [
  'q_wolves', 'q_wolf_pelts', 'q_report_marshal', 'q_greyjaw', 'q_boars', 'q_spiders', 'q_murlocs', 'q_mine', 'q_bones',
  'q_supplies', 'q_whispers', 'q_names_of_the_dead', 'q_silence_the_call', 'q_rite',
  'q_fc_enter', 'q_fc_guardian', 'q_fc_warden',
  'q_hollow', 'q_sexton', 'q_gravecallers_trail', 'q_bandits', 'q_ringleader',
  'q_fenbridge_muster', 'q_prowlers', 'q_prowler_pelts', 'q_fen_supplies', 'q_deepfen',
  'q_idols', 'q_deepfen_purge', 'q_widows', 'q_broodmother', 'q_drowned',
  'q_drowned_censers', 'q_no_rest', 'q_trolls', 'q_troll_fetishes', 'q_grubjaw',
  'q_cult_camp', 'q_summoners', 'q_deacon', 'q_bastion_door', 'q_olen', 'q_mistcaller',
  'q_highwatch_summons', 'q_stalkers', 'q_stalker_pelts', 'q_kobold_tunnels',
  'q_glowing_wax', 'q_ogre_edges', 'q_ogre_totems', 'q_ogre_bounty', 'q_crushers',
  'q_drogmar', 'q_elementals', 'q_shard_cores', 'q_kazzix', 'q_zealots', 'q_cult_orders',
  'q_necromancers', 'q_revenants', 'q_revenant_vanguard', 'q_wyrm_sigils',
  'q_breaking_the_seal', 'q_voice_below', 'q_sanctum_gate', 'q_korgath', 'q_velkhar',
  'q_gravewyrm',
  'q_word_with_lin', 'q_scout_pinewood', 'q_scout_chapel', 'q_scout_stalker_ridge',
  'q_escort_to_inn', 'q_fen_courier_chain', 'q_hold_south_gate',
] as const;

const ZONE_IDS = ['eastbrook_vale', 'mirefen_marsh', 'thornpeak_heights'] as const;
const DUNGEON_IDS = ['hollow_crypt', 'sunken_bastion', 'gravewyrm_sanctum'] as const;

const OBJECTIVE_ITEM_IDS = [
  'wolf_pelt',
  'greyjaw_fang', 'boar_hide', 'webwood_silk', 'supply_crate', 'gravecaller_sigil',
  'weathered_ledger_page', 'blessed_wax', 'ghostly_essence', 'morthen_grimoire',
  'fen_muster_order', 'mire_prowler_pelt', 'lost_caravan_goods', 'waterlogged_idol',
  'widow_venom_sac', 'rusted_censer', 'troll_fetish', 'grubjaw_tusk', 'cult_cipher',
  'bastion_ward_stone', 'highwatch_summons', 'ridge_stalker_pelt', 'glowing_wax',
  'ogre_war_totem', 'storm_core', 'kazzix_heartshard', 'wyrmcult_orders',
  'ritual_phylactery', 'gravewyrm_sigil', 'blessed_embers', 'sanctum_key_shard',
] as const;

type MobId = typeof MOB_IDS[number];
type NpcId = typeof NPC_IDS[number];
type QuestId = typeof QUEST_IDS[number];
type ZoneId = typeof ZONE_IDS[number];
type DungeonId = typeof DUNGEON_IDS[number];
type ObjectiveItemId = typeof OBJECTIVE_ITEM_IDS[number];

type MobTranslations = Record<MobId, { name: string }>;
type NpcTranslations = Record<NpcId, { name: string; title: string; greeting: string }>;
type QuestTranslation = { title: string; text: string; completion: string; objectives: Record<number, { label: string }> };
type QuestTranslations = Record<QuestId, QuestTranslation>;
type QuestNarrativeTranslations = Record<QuestId, readonly [text: string, completion: string]>;
type ZoneTranslations = Record<ZoneId, { name: string; welcome: string; pois: Record<number, { label: string }> }>;
type DungeonTranslations = Record<DungeonId, { name: string; enterText: string; leaveText: string }>;
type ObjectiveItemTranslations = Record<ObjectiveItemId, string>;

type Phase9Translations = {
  worldContent: {
    corpseName: string;
    dungeonExitName: string;
    dungeonPartyWarning: string;
    dungeonInstanceBusy: string;
  };
  entities: {
    mobs: MobTranslations;
    npcs: NpcTranslations;
    quests: QuestTranslations;
    zones: ZoneTranslations;
    dungeons: DungeonTranslations;
  };
};

type ObjectiveSpec =
  | { kind: 'kill'; mobId: MobId; mode?: 'slain' | 'rest' | 'silenced' }
  | { kind: 'collect'; itemId: ObjectiveItemId }
  // For objective types whose label is not generated from a mob/item (e.g. 'talk',
  // 'explore'), provide the Spanish label literally. English comes from the content.
  | { kind: 'text'; es: string };

type LocaleText = {
  corpseName: string;
  dungeonExitName: string;
  dungeonPartyWarning: string;
  dungeonInstanceBusy: string;
  kill(mob: string): string;
  rest(mob: string): string;
  silenced(mob: string): string;
  list(items: readonly string[]): string;
};

type LocaleData = {
  mobs: readonly string[];
  npcRows: readonly (readonly [string, string, string])[];
  questTitles: readonly string[];
  objectiveItems: readonly string[];
  zones: readonly (readonly [string, string, readonly string[]])[];
  dungeons: readonly (readonly [string, string, string])[];
};

const OBJECTIVE_SPECS: readonly (readonly ObjectiveSpec[])[] = [
  [{ kind: 'kill', mobId: 'forest_wolf' }],
  [{ kind: 'collect', itemId: 'wolf_pelt' }],
  [{ kind: 'text', es: 'Informa al mariscal Redbrook' }],
  [{ kind: 'collect', itemId: 'greyjaw_fang' }],
  [{ kind: 'collect', itemId: 'boar_hide' }],
  [{ kind: 'kill', mobId: 'webwood_spider' }, { kind: 'collect', itemId: 'webwood_silk' }],
  [{ kind: 'kill', mobId: 'mudfin_murloc' }],
  [{ kind: 'kill', mobId: 'tunnel_rat' }],
  [{ kind: 'kill', mobId: 'restless_bones', mode: 'rest' }],
  [{ kind: 'collect', itemId: 'supply_crate' }],
  [{ kind: 'collect', itemId: 'gravecaller_sigil' }],
  [{ kind: 'collect', itemId: 'weathered_ledger_page' }],
  [{ kind: 'kill', mobId: 'restless_bones', mode: 'silenced' }],
  [{ kind: 'collect', itemId: 'blessed_wax' }, { kind: 'collect', itemId: 'ghostly_essence' }],
  [{ kind: 'text', es: 'Entra en la Cripta Olvidada' }],
  [{ kind: 'kill', mobId: 'bone_guardian' }],
  [{ kind: 'kill', mobId: 'crypt_warden' }],
  [{ kind: 'kill', mobId: 'crypt_warden' }],
  [{ kind: 'kill', mobId: 'bone_guardian' }],
  [{ kind: 'collect', itemId: 'morthen_grimoire' }],
  [{ kind: 'kill', mobId: 'vale_bandit' }],
  [{ kind: 'kill', mobId: 'gorrak' }],
  [{ kind: 'collect', itemId: 'fen_muster_order' }],
  [{ kind: 'kill', mobId: 'mire_prowler' }],
  [{ kind: 'collect', itemId: 'mire_prowler_pelt' }],
  [{ kind: 'collect', itemId: 'lost_caravan_goods' }],
  [{ kind: 'kill', mobId: 'deepfen_murloc' }],
  [{ kind: 'collect', itemId: 'waterlogged_idol' }],
  [{ kind: 'kill', mobId: 'deepfen_murloc' }],
  [{ kind: 'kill', mobId: 'mire_widow' }, { kind: 'collect', itemId: 'widow_venom_sac' }],
  [{ kind: 'kill', mobId: 'mire_widow' }, { kind: 'kill', mobId: 'mirefen_broodmother' }],
  [{ kind: 'kill', mobId: 'drowned_dead', mode: 'rest' }],
  [{ kind: 'collect', itemId: 'rusted_censer' }],
  [{ kind: 'kill', mobId: 'drowned_dead', mode: 'rest' }],
  [{ kind: 'kill', mobId: 'fen_troll' }],
  [{ kind: 'collect', itemId: 'troll_fetish' }],
  [{ kind: 'collect', itemId: 'grubjaw_tusk' }],
  [{ kind: 'kill', mobId: 'gravecaller_cultist' }],
  [{ kind: 'kill', mobId: 'gravecaller_summoner' }, { kind: 'collect', itemId: 'cult_cipher' }],
  [{ kind: 'kill', mobId: 'deacon_voss' }],
  [{ kind: 'collect', itemId: 'bastion_ward_stone' }],
  [{ kind: 'kill', mobId: 'knight_commander_olen', mode: 'rest' }],
  [{ kind: 'kill', mobId: 'vael_the_mistcaller' }],
  [{ kind: 'collect', itemId: 'highwatch_summons' }],
  [{ kind: 'kill', mobId: 'ridge_stalker' }],
  [{ kind: 'collect', itemId: 'ridge_stalker_pelt' }],
  [{ kind: 'kill', mobId: 'deeprock_kobold' }],
  [{ kind: 'collect', itemId: 'glowing_wax' }],
  [{ kind: 'kill', mobId: 'thornpeak_ogre' }],
  [{ kind: 'collect', itemId: 'ogre_war_totem' }],
  [{ kind: 'kill', mobId: 'thornpeak_ogre' }],
  [{ kind: 'kill', mobId: 'ogre_crusher' }],
  [{ kind: 'kill', mobId: 'warlord_drogmar' }],
  [{ kind: 'kill', mobId: 'stormcrag_elemental' }],
  [{ kind: 'collect', itemId: 'storm_core' }],
  [{ kind: 'collect', itemId: 'kazzix_heartshard' }],
  [{ kind: 'kill', mobId: 'wyrmcult_zealot' }],
  [{ kind: 'kill', mobId: 'wyrmcult_zealot' }, { kind: 'collect', itemId: 'wyrmcult_orders' }],
  [{ kind: 'kill', mobId: 'wyrmcult_necromancer' }, { kind: 'collect', itemId: 'ritual_phylactery' }],
  [{ kind: 'kill', mobId: 'boneclad_revenant' }],
  [{ kind: 'kill', mobId: 'boneclad_revenant' }],
  [{ kind: 'collect', itemId: 'gravewyrm_sigil' }],
  [{ kind: 'collect', itemId: 'blessed_embers' }],
  [{ kind: 'kill', mobId: 'wyrmcult_zealot' }, { kind: 'kill', mobId: 'wyrmcult_necromancer' }],
  [{ kind: 'collect', itemId: 'sanctum_key_shard' }],
  [{ kind: 'kill', mobId: 'korgath_the_bound' }],
  [{ kind: 'kill', mobId: 'grand_necromancer_velkhar' }],
  [{ kind: 'kill', mobId: 'korzul_the_gravewyrm' }],
  [{ kind: 'text', es: 'Habla con la boticaria Lin' }],
  [{ kind: 'text', es: 'Explora el camino de pinos del norte' }],
  [{ kind: 'text', es: 'Explora la Capilla Ahogada' }],
  [{ kind: 'text', es: 'Explora la Cresta de los Acechadores' }],
  [{ kind: 'text', es: 'Escolta al explorador herido a la posada de Eastbrook' }],
  [
    { kind: 'text', es: 'Habla con la herborista Yara' },
    { kind: 'text', es: 'Habla con el hermano Aldric' },
    { kind: 'text', es: 'Habla con el proveedor Hale' },
  ],
  [{ kind: 'text', es: 'Repele la incursión de bandidos en la puerta sur' }],
];

function normalizeSourceText(text: string): string {
  return text.replace(/\$N/g, '{playerName}').replace(/\$C/g, '{className}').replace(/\u2014/g, '-');
}

function orderedValues<T>(ids: readonly string[], source: Record<string, T>): T[] {
  return ids.map((id) => {
    const value = source[id];
    if (!value) throw new Error(`Missing Phase 9 source entry for ${id}`);
    return value;
  });
}

function stringsToRecord<TId extends string>(ids: readonly TId[], values: readonly string[], label: string): Record<TId, string> {
  if (values.length !== ids.length) {
    throw new Error(`${label} count mismatch: expected ${ids.length}, got ${values.length}`);
  }
  const record = {} as Record<TId, string>;
  ids.forEach((id, index) => {
    const value = values[index];
    if (!value) throw new Error(`Missing ${label} translation for ${id}`);
    record[id] = value;
  });
  return record;
}

function makeMobTranslations(values: readonly string[]): MobTranslations {
  const names = stringsToRecord(MOB_IDS, values, 'mob');
  const mobs = {} as MobTranslations;
  MOB_IDS.forEach((id) => { mobs[id] = { name: names[id] }; });
  return mobs;
}

function makeNpcTranslations(rows: readonly (readonly [string, string, string])[]): NpcTranslations {
  if (rows.length !== NPC_IDS.length) throw new Error(`NPC translation count mismatch: expected ${NPC_IDS.length}, got ${rows.length}`);
  const npcs = {} as NpcTranslations;
  NPC_IDS.forEach((id, index) => {
    const [name, title, greeting] = rows[index];
    if (!name || !title || !greeting) throw new Error(`Missing NPC translation for ${id}`);
    npcs[id] = { name, title, greeting };
  });
  return npcs;
}

function makeObjectiveItems(values: readonly string[]): ObjectiveItemTranslations {
  return stringsToRecord(OBJECTIVE_ITEM_IDS, values, 'quest objective item');
}

function objectiveLabel(spec: ObjectiveSpec, mobs: MobTranslations, items: ObjectiveItemTranslations, text: LocaleText): string {
  if (spec.kind === 'text') return spec.es;
  if (spec.kind === 'collect') return items[spec.itemId];
  const mobName = mobs[spec.mobId].name;
  if (spec.mode === 'rest') return text.rest(mobName);
  if (spec.mode === 'silenced') return text.silenced(mobName);
  return text.kill(mobName);
}

function makeQuestTranslations(
  titles: readonly string[],
  narratives: QuestNarrativeTranslations,
  mobs: MobTranslations,
  itemNames: ObjectiveItemTranslations,
  text: LocaleText,
): QuestTranslations {
  if (titles.length !== QUEST_IDS.length) throw new Error(`Quest title count mismatch: expected ${QUEST_IDS.length}, got ${titles.length}`);
  if (OBJECTIVE_SPECS.length !== QUEST_IDS.length) throw new Error('Quest objective spec count mismatch');
  const quests = {} as QuestTranslations;
  QUEST_IDS.forEach((id, index) => {
    const title = titles[index];
    const narrative = narratives[id];
    const [questText, completion] = narrative ?? [];
    if (!questText || !completion) throw new Error(`Missing quest narrative translation for ${id}`);
    const objectives = OBJECTIVE_SPECS[index].map((spec) => objectiveLabel(spec, mobs, itemNames, text));
    const objectiveRecord = {} as Record<number, { label: string }>;
    objectives.forEach((label, objectiveIndex) => { objectiveRecord[objectiveIndex] = { label }; });
    quests[id] = {
      title,
      text: questText,
      completion,
      objectives: objectiveRecord,
    };
  });
  return quests;
}

function makeZoneTranslations(rows: readonly (readonly [string, string, readonly string[]])[]): ZoneTranslations {
  if (rows.length !== ZONE_IDS.length) throw new Error(`Zone translation count mismatch: expected ${ZONE_IDS.length}, got ${rows.length}`);
  const zones = {} as ZoneTranslations;
  ZONE_IDS.forEach((id, index) => {
    const [name, welcome, pois] = rows[index];
    const sourcePois = ZONES[index].pois;
    if (pois.length !== sourcePois.length) {
      throw new Error(`POI translation count mismatch for ${id}: expected ${sourcePois.length}, got ${pois.length}`);
    }
    const poiRecord = {} as Record<number, { label: string }>;
    pois.forEach((label, poiIndex) => { poiRecord[poiIndex] = { label }; });
    zones[id] = { name, welcome, pois: poiRecord };
  });
  return zones;
}

function makeDungeonTranslations(rows: readonly (readonly [string, string, string])[]): DungeonTranslations {
  if (rows.length !== DUNGEON_IDS.length) throw new Error(`Dungeon translation count mismatch: expected ${DUNGEON_IDS.length}, got ${rows.length}`);
  const dungeons = {} as DungeonTranslations;
  DUNGEON_IDS.forEach((id, index) => {
    const [name, enterText, leaveText] = rows[index];
    dungeons[id] = { name, enterText, leaveText };
  });
  return dungeons;
}

function makeEnglishPhase9(): Phase9Translations {
  const mobs = {} as MobTranslations;
  orderedValues(MOB_IDS, MOBS).forEach((mob) => { mobs[mob.id as MobId] = { name: mob.name }; });

  const npcs = {} as NpcTranslations;
  orderedValues(NPC_IDS, NPCS).forEach((npc) => {
    npcs[npc.id as NpcId] = {
      name: npc.name,
      title: npc.title,
      greeting: normalizeSourceText(npc.greeting),
    };
  });

  const quests = {} as QuestTranslations;
  orderedValues(QUEST_IDS, QUESTS).forEach((quest) => {
    const objectiveRecord = {} as Record<number, { label: string }>;
    quest.objectives.forEach((objective, objectiveIndex) => {
      objectiveRecord[objectiveIndex] = { label: objective.label };
    });
    quests[quest.id as QuestId] = {
      title: quest.name,
      text: normalizeSourceText(quest.text),
      completion: normalizeSourceText(quest.completionText),
      objectives: objectiveRecord,
    };
  });

  const zones = {} as ZoneTranslations;
  ZONES.forEach((zone) => {
    const poiRecord = {} as Record<number, { label: string }>;
    zone.pois.forEach((poi, index) => { poiRecord[index] = { label: poi.label }; });
    zones[zone.id as ZoneId] = {
      name: zone.name,
      welcome: normalizeSourceText(zone.welcome),
      pois: poiRecord,
    };
  });

  const dungeons = {} as DungeonTranslations;
  orderedValues(DUNGEON_IDS, DUNGEONS).forEach((dungeon) => {
    dungeons[dungeon.id as DungeonId] = {
      name: dungeon.name,
      enterText: normalizeSourceText(dungeon.enterText),
      leaveText: normalizeSourceText(dungeon.leaveText),
    };
  });

  return {
    worldContent: {
      corpseName: '{name} (corpse)',
      dungeonExitName: '{name} Exit',
      dungeonPartyWarning: '{name} is meant for a full party of {count}. Tread carefully.',
      dungeonInstanceBusy: 'All instances of {name} are busy. Try again soon.',
    },
    entities: { mobs, npcs, quests, zones, dungeons },
  };
}

function makeLocalePhase9(data: LocaleData, text: LocaleText, narratives: QuestNarrativeTranslations): Phase9Translations {
  const mobs = makeMobTranslations(data.mobs);
  const npcs = makeNpcTranslations(data.npcRows);
  const objectiveItems = makeObjectiveItems(data.objectiveItems);
  return {
    worldContent: {
      corpseName: text.corpseName,
      dungeonExitName: text.dungeonExitName,
      dungeonPartyWarning: text.dungeonPartyWarning,
      dungeonInstanceBusy: text.dungeonInstanceBusy,
    },
    entities: {
      mobs,
      npcs,
      quests: makeQuestTranslations(data.questTitles, narratives, mobs, objectiveItems, text),
      zones: makeZoneTranslations(data.zones),
      dungeons: makeDungeonTranslations(data.dungeons),
    },
  };
}

const esText: LocaleText = {
  corpseName: '{name} (cadáver)',
  dungeonExitName: 'Salida de {name}',
  dungeonPartyWarning: '{name} está pensado para un grupo completo de {count}. Avanza con cuidado.',
  dungeonInstanceBusy: 'Todas las instancias de {name} están ocupadas. Inténtalo de nuevo pronto.',
  kill: (mob) => `${mob} abatido`,
  rest: (mob) => `${mob} devuelto al descanso`,
  silenced: (mob) => `${mob} silenciado`,
  list: (items) => items.join(', '),
};










const esQuestNarratives = {
  q_wolves: [`Los lobos del bosque se atreven ya con el camino norte, {playerName}. Abate 5 antes de que otra carreta desaparezca entre los pinos.`, `Buen trabajo. El camino ya parece menos hambriento.`],
  q_wolf_pelts: [`El mariscal envió aviso de que los lobos ceden, pero Eastbrook aún necesita cuero. Tráeme 5 pieles de lobo de la senda del bosque, {playerName}.`, `Buenas pieles, firmes y limpias. Toma esta moneda e informa al mariscal.`],
  q_report_marshal: [`Rowan ya tiene tus pieles. Lleva la noticia al mariscal Redbrook en la plaza, {playerName}: debe saber que el camino norte está más tranquilo.`, `Así que los lobos menguan y el pueblo tiene suministros. Eastbrook te recibe como es debido, {playerName}.`],
  q_greyjaw: [`Hay un lobo que jamás cayó en trampa alguna: el viejo Greyjaw. Acecha al norte de la senda de los lobos; tráeme su colmillo.`, `Por fin murió ese viejo demonio. El muchacho de los establos dormirá mejor, y yo también.`],
  q_boars: [`La piel de jabalí hace buenas alforjas, y las praderas están llenas de animales. Tráeme 5 pieles de jabalí erizadas.`, `Magníficas pieles erizadas. Sacaré buen precio por ellas.`],
  q_spiders: [`Los acechadores de Webwood tienen la seda que necesito, pero han criado demasiado. Mata 6 y corta 4 glándulas de seda.`, `Aún se mueven. Perfecto. Te ganaste esto.`],
  q_murlocs: [`Pescaba el lago Espejo hasta que esos hombres pez salieron de los bajíos. Expulsa a 8 Aletabarro y cuida tu espalda.`, `¡Ja! Eso les enseñará a quedarse en sus propios charcos.`],
  q_mine: [`Abrimos una veta de cobre y los kobolds brotaron de la colina. Derriba 10 excavadores Rata de Túnel para que mi cuadrilla vuelva.`, `¡A trabajar, muchachos! Tienes mi gratitud y mi paga.`],
  q_bones: [`La vieja capilla fue un lugar de descanso, hasta que algo despertó a sus muertos. Devuelve 8 huesos inquietos a la tierra, {playerName}.`, `Que descansen ahora, y que la Luz perdone a quien los despertó.`],
  q_supplies: [`Los bandidos robaron mi último carro: herramientas, sal y lino de Eastbrook. Recupera 4 cajas de su campamento de las colinas del sudeste.`, `¡Mis cajas! Apenas tienen un rasguño. Eres una maravilla.`],
  q_whispers: [`Los muertos vuelven a levantarse porque algo los llama. Busca en la capilla una señal de quien susurra y tráela intacta.`, `Este sigilo lleva la marca de los Gravecallers. Temía que esa secta siguiera muerta, {playerName}.`],
  q_names_of_the_dead: [`Si los Gravecallers profanaron nuestras tumbas, necesito saber a quiénes robaron. Reúne 3 páginas del registro de entierros, {playerName}.`, `Pobres almas... y mira esto: el sacristán Marrow fue el primero. Morthen empezó con quien enterraba a Eastbrook.`],
  q_silence_the_call: [`Cada nombre del registro es un alma que Morthen quiere arrancar de la tierra. Silencia 12 huesos inquietos, {playerName}, antes de que el susurro sea coro.`, `El patio está más quieto, pero la llamada sube ahora desde la cripta, {playerName}.`],
  q_rite: [`Debemos abrir la cripta, pero solo un rito de vínculo dejará pasar a los vivos. Necesito 4 sebos benditos y 6 esencias fantasmales.`, `Está hecho. El camino de abajo se abre... reúne a tus compañeros, {playerName}.`],
  q_fc_enter: [`La Cripta Olvidada vuelve a agitarse: cultistas y muertos surgen de sus profundidades. Cabalga al este hasta la Capilla caída y desciende por las salas funerarias, {playerName}. No te demores en la entrada; avanza hacia las catacumbas.`, `Respiraste el aire de la cripta y viviste para contarlo. El Valle tiene suerte de que no cuentes entre sus muertos.`],
  q_fc_guardian: [`Los supervivientes hablan de un esqueleto imponente envuelto en polvo de tumba, un Guardián de Hueso que bloquea el camino a la cámara ritual. Destrúyelo, {playerName}.`, `El guardián es polvo. Siento que la cripta tiembla: quien manda a estos muertos está cerca.`],
  q_fc_warden: [`En el corazón de la Cripta Olvidada, el Guardián de la Cripta manda a los muertos alzados. Cortará, invocará y sacudirá la piedra, pero debe caer, {playerName}.`, `El Guardián ha caído y la cripta calla. Le has dado al Valle una victoria verdadera, {playerName}.`],
  q_hollow: [`El Guardián de la Cripta espera en el fondo de la Cripta Olvidada, rodeado de muertos de élite. Lleva compañeros si puedes y acaba con él.`, `El susurro cesó. Los muertos duermen, {playerName}, y Eastbrook te debe cuanto tiene.`],
  q_sexton: [`El registro nombra a un sacristán de la capilla, y la cripta guarda su eco retorcido: un Guardián de Hueso que impide el paso a los vivos. Concédele el descanso robado, {playerName}.`, `El guardián ha caído. No dobles campanas por él; oyó bastantes en vida.`],
  q_gravecallers_trail: [`Morthen murió, pero su secta no gastaría un siglo de silencio en una sola capilla. Busca su grimorio entre las ruinas, {playerName}.`, `Morthen escribía a un "Mistcaller" en la ciénaga norte. La secta no está muerta, {playerName}; solo esperó.`],
  q_bandits: [`Una banda de degolladores acampa en las colinas del sudoeste. Han robado tres carros esta semana. Abate 10 bandidos del Valle.`, `Diez cuchillos menos en la oscuridad. Toma esto, te lo ganaste.`],
  q_ringleader: [`Los bandidos obedecen a Gorrak el Despiadado. Corta la cabeza y el cuerpo se dispersará. Acaba con él, {playerName}.`, `¿Gorrak muerto? Entonces el Valle queda libre de su sombra.`],
  q_fenbridge_muster: [`Los escritos de Morthen nombran a un maestro en la ciénaga norte, {playerName}. Toma la orden de reunión en la puerta de Fenbridge y llévala al guardián.`, `¿El sello de Aldric? Servirás. La ciénaga se traga mis patrullas enteras.`],
  q_prowlers: [`Los merodeadores han aprendido el sonido de las mulas de carga. Mata 12 en torno a la calzada, {playerName}.`, `Doce, y ni una mordida en ti. Esta noche la calzada respira mejor.`],
  q_prowler_pelts: [`La calzada se sostiene con piel de merodeador aceitada, y mis reservas se acabaron. Tráeme 8 pieles intactas, {playerName}, antes de vadear hasta Eastbrook.`, `Buenas pieles gruesas. Ahora la calzada nos sobrevivirá a ambos.`],
  q_fen_supplies: [`Una caravana salió de Eastbrook y la niebla se la tragó. Rescata 5 cargas antes de que la ciénaga termine de hundirlas.`, `Empapadas, pero enteras. La ciénaga conserva lo que atrapa, {playerName}.`],
  q_deepfen: [`Los murlocs de Deepfen arrastran cosas del lecho del lago. Sacrifica 12 chasqueadores y averiguaremos qué los agita.`, `Eso los empujará de vuelta al barro un tiempo. Pero algo los puso a cavar.`],
  q_idols: [`Los hombres pez abrazan ídolos sacados del fondo como reliquias. Quítales 5, aunque no los entregarán de buena gana.`, `Obra de los Gravecallers, más antigua que Morthen. La secta empezó aquí, {playerName}.`],
  q_deepfen_purge: [`Esos ídolos son obra del culto, y los murlocs sacan el mal viejo de la ciénaga a brazadas. Mata 14 más.`, `Implacable y minucioso. Si esta ciénaga se seca, te espera trabajo de guardián.`],
  q_widows: [`El veneno de viuda limpia la podredumbre de las heridas, pero el matorral se ha vuelto horror. Mata 10 viudas y corta 6 sacos enteros.`, `Todos los sacos intactos. Tienes manos más firmes que medio sur, {playerName}.`],
  q_broodmother: [`Si las redes son tan gruesas, imagina qué las teje. Quema paso entre 8 viudas y mata a la vieja madre antes de que eclosione su puesta.`, `¿Muerta de verdad? Entonces el matorral vuelve a ser solo árboles. Que la Luz bendiga tu hoja, {playerName}.`],
  q_drowned: [`Los viajeros ahogados salen de los lagos cubiertos de algas. Libera 12 muertos ahogados, {playerName}.`, `Cada uno que derribas es un alma robada que vuelve a ser libre.`],
  q_drowned_censers: [`La capilla del norte se hundió con su congregación, y sus muertos llevan incensarios de rito funerario. Reúne 4 del patio.`, `Tal como temía: quemaban ceniza de tumba, y el rito está firmado por Voss.`],
  q_no_rest: [`Ese rito hace levantarse a los ahogados donde la ciénaga los toca. No podemos deshacerlo aún; deja 14 muertos menos a sus amos.`, `Das más misericordia a los muertos que sus señores. Toma esto, lo mereces.`],
  q_trolls: [`Los trolls de Mirefen abrieron túmulos más viejos que cualquier reino humano, {playerName}. Expúlsalos: 12 trolls muertos bastarán.`, `Los trolls no cavan sin motivo. Alguien de túnica gris les dijo dónde.`],
  q_troll_fetishes: [`Esos fetiches no son obra trol: nudos falsos, huesos humanos y todos apuntan a los túmulos. Tráeme 8.`, `Mismo artesano que en los estandartes del culto. Los trolls solo son palas alquiladas, {playerName}.`],
  q_grubjaw: [`Grubjaw no cava con los demás; se comió mis dos últimas mulas, arneses incluidos. Tráeme su colmillo, {playerName}.`, `¡Ese colmillo me llega al antebrazo! Las mulas están vengadas.`],
  q_cult_camp: [`Al norte, donde la niebla no levanta, los Gravecallers acampan como si ya poseyeran la ciénaga. Derriba 12 cultistas, {playerName}.`, `Doce túnicas boca abajo en el barro. Ahora saben que la ciénaga mira de vuelta.`],
  q_summoners: [`Los invocadores llaman a los ahogados como perros a un silbato. Silencia 8 y tráeme 4 cifras.`, `Cada cifra está refrendada por el diácono Voss y enviada al Mistcaller. El maestro de Morthen, {playerName}. Lo hemos encontrado.`],
  q_deacon: [`Voss canta a mis guardianes ahogados para que le sirvan. Toma el camino del campamento y entiérralo bien hondo, {playerName}.`, `Voss ha muerto y la niebla ya se adelgaza. Solo queda el Bastión.`],
  q_bastion_door: [`El Bastión Sumergido guarda al Mistcaller, y su puerta está sellada con piedras de tumba. Tráeme una piedra guardiana, {playerName}.`, `El sello cede como cuerda podrida. La puerta se abre, y la oscuridad escucha.`],
  q_olen: [`Olen murió defendiendo el Bastión y ahora vigila su puerta como marioneta. Esa vergüenza acaba aquí, {playerName}. Baja con cuatro compañeros y dale el descanso que ganó.`, `Su guardia terminó por fin. Yo mismo grabaré su nombre en la puerta. Gracias, {playerName}.`],
  q_mistcaller: [`Vael espera en el fondo del Bastión, voz que ahogó a cien viajeros. Lleva cuatro compañeros y acaba con él, {playerName}.`, `Vael murió y la niebla se levanta, pero sus últimas palabras hielan: el Wyrm se agita bajo los picos. Descansa mientras puedas, {playerName}.`],
  q_highwatch_summons: [`Las últimas palabras de Vael no me dejan, {playerName}. Toma la citación de Highwatch y dile a Thessaly que Aldric sube tras de ti.`, `Si Aldric sube en persona, esto es tan grave como temía. Bienvenido a Highwatch, {playerName}.`],
  q_stalkers: [`Los felinos de la cresta bajan hambrientos de la nieve y sangran mis patrullas. Abate 12, {playerName}.`, `Doce sombras menos en la cresta. Las patrullas respirarán esta noche.`],
  q_stalker_pelts: [`El invierno de esta montaña derriba puertas, {playerName}. Ocho pieles de acechador forrarán capas para la muralla.`, `Gruesas como mi brazo. La guardia no se congelará este año.`],
  q_kobold_tunnels: [`Los kobolds de Deeprock cavan recto hacia abajo, como si algo los llamara bajo la muralla, {playerName}. Mata 12 tuneladores.`, `Cada galería baja en línea recta. Los kobolds no cavan así por voluntad propia.`],
  q_glowing_wax: [`La cera de esos tuneladores brilla, {playerName}, y está cálida como un latido. Trae 6 trozos para que Caddis la estudie.`, `Sigue tibia. El brillo no coincide con ninguna llama que conozca el maestro.`],
  q_ogre_edges: [`Los clanes de Thornpeak acampan demasiado al este con pintura de guerra. Alguien los paga. Abate 12, {playerName}.`, `Doce caídos, y no retroceden. Quien los compró pagó con algo más pesado que oro.`],
  q_ogre_totems: [`Los ogros levantaron tótems de cuero y cráneo: señales de reunión, no de incursión. Derriba 6 y tráemelos. Cuidado con los trituradores del perímetro, {playerName}.`, `Calavera, cuero... y ligaduras de escama de wyrm. Son regalos del culto, {playerName}.`],
  q_ogre_bounty: [`Los clanes están comprados y mi muralla es su primer encargo. Mata 14 ogros más, {playerName}, con recompensa por cada uno.`, `Recompensa pagada entera. Las colinas callan un poco más.`],
  q_crushers: [`Los trituradores son la columna del campamento de Drogmar, cada uno vale por tres soldados míos. Rompe 10 con ayuda.`, `Diez trituradores menos. El campamento quedó sin espina dorsal.`],
  q_drogmar: [`Drogmar tomó la moneda del Wyrmcult y juró los clanes al despertar de la montaña. Entra en su campamento y mátalo, {playerName}, por Highwatch.`, `Drogmar yace muerto en su propio campamento. Compraste un invierno para mi muralla, {playerName}.`],
  q_elementals: [`Stormcrag calló mil años y ahora sus piedras caminan. Los elementales no despiertan sin más, {playerName}. Derriba 12 elementales para estudiar lo que quede.`, `Los fragmentos zumban como campanas. La montaña no está furiosa, {playerName}... la están perturbando.`],
  q_shard_cores: [`Cada elemental lleva un núcleo de tormenta. Seis juntos me dirán dónde nace la perturbación, {playerName}, aunque temo saberlo.`, `Todos apuntan al sur como limaduras hacia un imán. Al Santuario, {playerName}.`],
  q_kazzix: [`Kazzix arde más que los demás, una tormenta con hombros. Arráncale el fragmento de corazón en los riscos lejanos.`, `¡El fragmento aún crepita! Magnífico. Toma estas grebas por la molestia.`],
  q_zealots: [`El viento trae cánticos desde los picos del sur. Silencia 12 fanáticos, {playerName}; cada voz callada compra otra noche de sueño.`, `El viento está más callado. Lo que me inquieta, {playerName}, es que algo quizá responda al canto.`],
  q_cult_orders: [`Los fanáticos se mueven como soldados antes de un asedio, {playerName}. Mata 8 más y tráeme 4 órdenes escritas.`, `Esta letra viene del grimorio de Morthen. La misma mano guio cada tumba, {playerName}.`],
  q_necromancers: [`Las órdenes hablan de un anillo de filacterias, vasos de alma, {playerName}, alrededor del Santuario. Mata 8 nigromantes y trae 3 intactas.`, `Que la Luz nos perdone. Guardan los muertos del Valle y la ciénaga; nunca formaban un ejército, {playerName}. Eran un diezmo.`],
  q_revenants: [`Al este del camino yace un viejo campo de batalla. El culto levantó sus huesos con armaduras oxidadas. Devuelve 12 al suelo, {playerName}.`, `Fueron soldados como los míos. Quien los llamó no respeta a los muertos.`],
  q_revenant_vanguard: [`Los aparecidos forman filas verdaderas, {playerName}. Rompe 14 más antes de que marchen al Santuario.`, `Los campos vuelven a callar. Toma esto; nadie lo ha ganado más.`],
  q_wyrm_sigils: [`Es hora de que sepas toda la verdad, {playerName}. Los Gravecallers sirven a Korzul el Gravewyrm, y cada alma robada alimenta su despertar. Tráeme 3 sigilos del acceso al Santuario.`, `Sí... una letanía de despertar escrita durante generaciones. Están cerca, {playerName}.`],
  q_breaking_the_seal: [`El sello del Santuario se forjó con fuego de montaña. Trae 5 brasas benditas de los elementales, {playerName}, para abrirlo sin romperlo.`, `Arden azules y limpias. La montaña recuerda su antiguo juramento.`],
  q_voice_below: [`Anoche el campamento entero se arrodilló mirando al Santuario, {playerName}. Mata 10 fanáticos y 6 nigromantes antes de que esa voz tenga manos suficientes.`, `La genuflexión cesó. No silenciamos la voz, {playerName}; solo redujimos su coro.`],
  q_sanctum_gate: [`Este es el último umbral, {playerName}. La llave del Santuario fue rota en fragmentos bajo la mirada de los muertos acorazados. Tráeme 3 y abriré el camino en silencio.`, `Los fragmentos encajan y la puerta reconoce su llave. Reúne a los más fuertes, {playerName}.`],
  q_korgath: [`Maren halló cadenas gruesas como mástiles, {playerName}, y algo con forma de ogro tirando de ellas. Lleva cuatro compañeros y derriba a Korgath.`, `Korgath está roto al fin. Hasta sus cadenas merecían un final más amable.`],
  q_velkhar: [`Velkhar, primer Gravecaller, tejió cada hilo y vierte almas robadas en el Wyrm. Acaba con él, {playerName}.`, `Velkhar ha muerto y el rito perdió la cabeza, pero el Wyrm ya no duerme.`],
  q_gravewyrm: [`Ya no queda rito que detener, {playerName}, solo el Wyrm medio despierto. Entra con tus compañeros y termina lo empezado en la capilla.`, `Ha terminado. Los muertos de tres tierras descansan, y cada campana canta tu nombre, {playerName}.`],
  q_word_with_lin: [`La boticaria Lin necesita unas manos firmes, {playerName}. La hallarás en su mesa de trabajo al este de la plaza; ve y escucha lo que quiere.`, `¿Te envía el mariscal? Bien. Tengo trabajo que hacer, pero antes, gracias por venir hasta aquí.`],
  q_scout_pinewood: [`Antes de enviar la patrulla al norte quiero ojos en el camino, {playerName}. Sigue el camino de pinos hacia los cotos de lobos y observa qué se mueve; luego vuelve a informar.`, `Así que el camino aún se puede transitar. Buen trabajo: la patrulla saldrá más segura gracias a ti.`],
  q_scout_chapel: [`Mis exploradores hablan de luces en la Capilla Ahogada, pero ninguno ha llegado y vuelto con un informe claro. Sigue la calzada al este, {playerName}, mira qué se mueve entre esas ruinas y vuelve a informar.`, `Así que la capilla aún se mantiene en pie, apenas. Bien. Necesitaré tu palabra antes de arriesgar una patrulla por el Matorral de Viudas.`],
  q_scout_stalker_ridge: [`Antes de enviar patrullas al sur quiero ojos en la Cresta de los Acechadores, {playerName}. Sigue el camino de montaña hasta la cima y mira qué se mueve entre los felinos.`, `Así que la cresta aún se puede transitar, por ahora. Con eso basta para empezar.`],
  q_escort_to_inn: [`Un explorador volvió cojeando del camino de pinos con una mordida de lobo aún sangrando. Escóltalo hasta Eliza en la posada antes de que más lobos encuentren el rastro, {playerName}.`, `Lo trajiste respirando. Eliza lo curará; Eastbrook te debe una.`],
  q_fen_courier_chain: [`Necesito mensajeros que hablen con mi gente sin desenvainar la espada, {playerName}. Lleva mi recuento a Yara en el cobertizo de hierbas, luego a Aldric en el muelle de la capilla y después a Hale en el almacén. Cuando los tres hayan respondido, vuelve conmigo.`, `Tres respuestas y ni una gota de sangre derramada. Así se sostiene Fenbridge.`],
  q_hold_south_gate: [`Los degolladores que diezmaste han dejado de esconderse, {playerName}: mis exploradores dicen que el resto planea asaltar la puerta sur en masa. Planta cara en el camino de la puerta y recházalos cuando lleguen. Eastbrook resiste, o arde.`, `Ni uno solo pasó de la puerta. El mariscal sabrá cómo mantuviste la línea, {playerName}.`],
} satisfies QuestNarrativeTranslations;










const esData: LocaleData = {
  mobs: [
    'Lobo del bosque', 'Viejo Greyjaw', 'Jabalí salvaje', 'Acechador de Webwood', 'Merodeador Aletabarro', 'Excavador Rata de Túnel',
    'Bandido del Valle', 'Huesos inquietos', 'Gorrak el Despiadado', 'Merodeador del lodazal', 'Chasqueador de Deepfen', 'Viuda de Mirefen',
    'La Madre de la nidada', 'Muerto ahogado', 'Trol de Mirefen', 'Grubjaw el Glotón', 'Cultista Gravecaller', 'Invocador Gravecaller',
    'Diácono Voss', 'Acechador de la cresta', 'Tunelador de Deep Rock', 'Ogro de Thornpeak', 'Triturador de Thornpeak', 'Señor de la guerra Drogmar',
    'Elemental de Stormcrag', 'Señor de fragmentos Kazzix', 'Fanático del Culto del Wyrm', 'Nigromante del Culto del Wyrm', 'Aparecido de hueso',
    'Guerrero esquelético', 'Arquero esquelético', 'Espíritu inquieto', 'Cultista de la cripta', 'Sabueso de la cripta',
    'Guardián de hueso', 'Adepto cultista', 'El Guardián de la Cripta', 'Guerrero esquelético',
    'Aparecido del Bastión',
    'Acólito atado a la marea', 'Siervo ahogado', 'Caballero comandante Olen', 'Vael el Mistcaller', 'Guardahuesos del Santuario', 'Dracónido del Santuario',
    'Caminahuesos alzado', 'Korgath el Encadenado', 'Gran nigromante Velkhar', 'Korzul el Gravewyrm',
  ],
  npcRows: [
    ['El Mercader', 'Guardián del Mercado Mundial', 'Bienvenido al Mercado Mundial, {className}. Compra a aventureros de cada rincón del reino o vende tus propias mercancías.'],
    ['Mariscal Redbrook', 'Mariscal de la ciudad', 'Ten la hoja cerca, {className}. El Valle ya no es lo que era.'],
    ['Comerciante Wilkes', 'Proveedor', 'Pan fresco, agua limpia y precios justos. ¿Qué necesitas?'],
    ['Boticaria Lin', 'Herborista', 'Ten cuidado al pisar en los bosques orientales, amigo.'],
    ['Sacerdote Alden', 'Capellán de Eastbrook', 'Que la Luz te guarde, {className}. Ni siquiera los muertos descansan últimamente.'],
    ['Herrero Thorne', 'Herrero', 'Cuidado con las chispas, {className}. El buen acero separa una cicatriz de una tumba.'],
    ['Pescador Brandt', 'Viejo lobo de agua', 'Grlmurlgrl... perdón, llevo demasiado tiempo oyendo a esos hombres pez.'],
    ['Capataz Odell', 'Capataz de la mina', '¡Toda la excavación está llena de esas alimañas con velas en la cabeza!'],
    ['Posadera Eliza', 'Posadera', 'Bienvenido a la posada de Eastbrook, {className}. Descansa los pies: el camino del norte es duro esta noche.'],
    ['Cazador Rowan', 'Cazador', 'Los lobos han sido audaces en el camino de pinos. Si los cazas, puedo usar tus pieles.'],
    ['Guardia Ashford', 'Guardia de la ciudad', 'Sigue tu camino, ciudadano. La plaza permanece segura mientras la patrullo.'],
    ['Guardia Merrick', 'Guardia de la ciudad', 'Ojos abiertos en el camino sur. A los bandidos les encanta una puerta sin vigilancia.'],
    ['Marta', 'Aldeana', 'Un día hermoso para el mercado, si ignoras los aullidos del bosque.'],
    ['Cedric', 'Aldeano', 'La posada sirve buen guiso esta noche. Eliza no deja a un viajero con hambre.'],
    ['Explorador herido', 'Explorador', 'Con calma, {className}... los lobos me destrozaron la pierna en el camino de pinos. Llévame a la posada.'],
    ['Guardián Fenwick', 'Guardián de Fenbridge', 'Alto en la puerta, {className}. Más allá de los juncos, la ciénaga mata por nosotros.'],
    ['Hermano Aldric', 'Sacerdote del Valle', 'Que la Luz te mantenga sobre el agua, {playerName}. Los muertos de esta ciénaga no duermen: vadean.'],
    ['Proveedor Hale', 'Proveedor', 'Botas secas, pan seco y pólvora seca: en Fenbridge consigues dos de tres en un buen día.'],
    ['Herborista Yara', 'Herborista', 'Cuida el matorral al oeste del camino. Las telarañas están espesas como velamen.'],
    ['Exploradora Maren', 'Exploradora del mariscal', 'Pies silenciosos y una hoja corta te mantienen con vida. Habla rápido: debo volver a los juncos.'],
    ['Capitana Thessaly', 'Capitana de Highwatch', 'Doscientos años ha resistido este muro, {className}. No caerá bajo mi guardia, aunque gime.'],
    ['Hermano Aldric', 'Sacerdote del Valle', 'De un patio de capilla al techo del mundo... el rastro termina aquí. Siento que la montaña escucha.'],
    ['Exploradora Maren', 'Exploradora del mariscal', 'Seguí a los cultistas contigo por la ciénaga y el rastro llegó aquí. Las cumbres son peores, {className}. Mantente alerta.'],
    ['Intendente Bree', 'Intendente de Highwatch', 'Lana, galleta dura y botas herradas: Highwatch vive de las tres, y apenas tengo existencias.'],
    ['Armero Hode', 'Maestro armero', 'La forja está caliente y la piedra gira. Si corta, lo vendo.'],
    ['Maestro de saber Caddis', 'Maestro de saber', 'Cuida la pizarra suelta, {className}. La montaña está inquieta últimamente y quiero saber por qué.'],
  ],
  questTitles: [
    'Lobos a la puerta', 'Reunir suministros', 'Informe al mariscal', 'El viejo lobo', 'Pieles de Bristleback', 'Amenaza de Webwood', 'Problemas en el lago', 'Ratas en la mina',
    'Los muertos inquietos', 'Suministros robados', 'Susurros bajo tierra', 'Los nombres de los muertos', 'Silenciar la llamada',
    'El rito vinculante', 'Entrar en la cripta', 'Romper al Guardián de Hueso', 'Matar al Guardián de la Cripta',
    'En las profundidades', 'El peaje del guardián', 'El rastro del Gravecaller', 'Bandidos del Valle',
    'El cabecilla', 'Reunión en Fenbridge', 'Dientes de la ciénaga', 'Pieles para la calzada', 'La caravana perdida',
    'El Deepfen se agita', 'Ídolos de las profundidades', 'De vuelta a los bajíos', 'Seda y veneno', 'La Madre de la nidada',
    'Los muertos ahogados', 'Incensarios de las profundidades', 'Sin descanso entre los juncos', 'Túmulos de Mirefen',
    'Fetiche y hueso', 'El Glotón', 'Togas en los juncos', 'Detener la invocación', 'El diácono de la ciénaga',
    'El Bastión Sumergido', 'La vergüenza del caballero comandante', 'El Mistcaller', 'La guardia de las cumbres',
    'Acechadores en la cresta', 'El invierno llega a Highwatch', 'Problemas de Deeprock', 'Cera extraña', 'Ogros en las colinas',
    'Tótems de guerra', 'La recompensa de la capitana', 'Romper el campamento de guerra', 'Señor de la guerra Drogmar',
    'La montaña despierta', 'Núcleos de la tormenta', 'El señor de fragmentos', 'Cánticos en el viento', 'Órdenes de abajo',
    'El anillo de filacterias', 'Los campos de aparecidos', 'Huesos de la vanguardia', 'Sigilos del Wyrm', 'Romper el sello',
    'La voz de abajo', 'La puerta del Santuario', 'El guardián encadenado', 'El gran nigromante', 'Korzul el Gravewyrm',
    'Unas palabras con Lin', 'Explorar el camino de pinos', 'Ojos en la capilla', 'Recorrer la cresta',
    'A salvo en la posada', 'Palabra por la calzada', 'Defiende la puerta sur',
  ],
  objectiveItems: [
    'Piel de lobo',
    'Colmillo del viejo Greyjaw', 'Piel de jabalí erizada', 'Glándula de seda de Webwood', 'Caja de suministros robada',
    'Sigilo de Gravecaller', 'Página de registro desgastada', 'Sebo bendito', 'Esencia fantasmal', 'Grimorio de Morthen',
    'Orden de reunión de Fenbridge', 'Piel de merodeador del lodazal', 'Mercancías de la caravana perdida', 'Ídolo empapado',
    'Saco de veneno de viuda', 'Incensario oxidado', 'Fetiche trol de Mirefen', 'Colmillo de Grubjaw', 'Cifra Gravecaller',
    'Piedra guardiana del Bastión', 'Citación de Highwatch', 'Piel de acechador de la cresta', 'Cera resplandeciente',
    'Tótem de guerra ogro', 'Núcleo de tormenta', 'Fragmento del corazón de Kazzix', 'Órdenes del Culto del Wyrm',
    'Filacteria ritual', 'Sigilo del Gravewyrm', 'Brasas benditas', 'Fragmento de llave del santuario',
  ],
  zones: [
    ['Valle de Eastbrook', 'El mariscal Redbrook está en la plaza. Lobos merodean el camino norte y Eastbrook necesita cada espada.', ['Eastbrook', 'Senda de lobos', 'Prado de jabalíes', 'Lago Espejo', 'Webwood', 'Mina de cobre', 'Campamento bandido', 'Capilla caída']],
    ['Ciénaga de Mirefen', 'Preséntate ante el guardián Fenwick en la puerta de Fenbridge.', ['Fenbridge', 'Juncos de merodeadores', 'Bajíos de Deepfen', 'Matorral de viudas', 'Capilla ahogada', 'Túmulos trol', 'Campamento Gravecaller', 'El Bastión Sumergido']],
    ['Alturas de Thornpeak', 'La capitana Thessaly sostiene el muro de Highwatch a duras penas.', ['Highwatch', 'Cresta del acechador', 'Madrigueras Deeprock', 'Colinas ogro', 'Campamento de guerra de Drogmar', 'Stormcrag', 'El Glimmermere', 'Tiendas del Culto del Wyrm', 'Campos de aparecidos', 'Santuario del Gravewyrm']],
  ],
  dungeons: [
    ['La Cripta Olvidada', 'Desciendes a la Cripta Olvidada. Las antorchas parpadean en el aire viciado.', 'Vuelves a subir a la luz del día, agradecido por el sol.'],
    ['El Bastión Sumergido', 'Vadeas hacia las profundidades del Bastión Sumergido...', 'Sales de la oscuridad ahogada.'],
    ['Santuario del Gravewyrm', 'El aire se vuelve frío. Algo inmenso respira abajo...', 'Sales tambaleándote al viento de la montaña.'],
  ],
};










export const phase9 = {
  en: makeEnglishPhase9(),
  es: makeLocalePhase9(esData, esText, esQuestNarratives),
};

