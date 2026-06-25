// AUTO-ASSEMBLED localization for sim-emitted system/combat/loot/error log text.
// The deterministic core (src/sim) is host-agnostic and MUST stay English: it emits
// SimEvent log/error/loot text in English. The client re-renders it here, exactly
// mirroring server_i18n.ts. hud.ts calls localizeSimText() as a fallback inside
// localizeSystemText / localizeErrorText / localizeLootText (after localizeServerText).
// Player/build names splice through verbatim; item and mob names are localized via
// the entity dictionary; numbers and roll values pass through unchanged.
//
// NOTE: this is the ONE place sim English is re-localized — when a SimEvent text:
// literal in src/sim/sim.ts changes, update the matching EXACT value or RULE here.
// The S3 guard in tests/localization_fixes.test.ts parses src/sim/sim.ts, enumerates
// every player-facing emit site, and fails if any is no longer recognized by a client
// matcher — so a new unhandled sim string cannot ship silently.
import { ITEMS, MOBS } from '../sim/data';
import { getLanguage, supportedLanguages, t, formatNumber, type InterpolationValues, type SupportedLanguage } from './i18n';
import { tEntity } from './entity_i18n';

const baseEnTable = {
  "error.lineOfSight": "Line of sight.",
  "error.specLevel": "You may choose a specialization at level {level}.",
  "error.invalidBuild": "Invalid talent build.",
  "error.unknownSpec": "Unknown specialization.",
  "error.maxLoadouts": "You can save at most {count} loadouts.",
  "error.noLoadout": "No such loadout.",
  "error.loadoutLevel": "That loadout needs a higher level.",
  "error.cannotEquip": "You cannot equip that.",
  "error.faceWater": "You need to face fishable water.",
  "error.potionNotReady": "That potion is not ready yet.",
  "error.trinketNotReady": "That trinket is not ready yet.",
  "error.fullHealth": "You are already at full health.",
  "error.nothingRestore": "Nothing to restore.",
  "error.merchantUnavailable": "That merchant is not available.",
  "error.notForSale": "That item is not for sale.",
  "error.noMerchant": "There is no merchant nearby.",
  "error.noSellQuest": "You cannot sell quest items.",
  "error.noBuyback": "That item is not available for buyback.",
  "error.nailedShut": "It is nailed shut.",
  "error.enoughOfThose": "You have enough of those.",
  "error.whoOnline": "The /who roster is available in online play.",
  "error.alreadyInParty": "You are already in a party.",
  "error.notPartyLeader": "You are not the party leader.",
  "error.raidMarkersParty": "You must be in a party to use raid markers.",
  "error.nameSellQty": "Name how many you wish to sell.",
  "error.talentsInCombat": "You cannot change talents in combat.",
  "error.talentsArena": "You cannot change talents during an arena match.",
  "error.noItem": "You don't have that item.",
  "error.cantWhileDead": "You can't do that while dead.",
  "error.cantWhileSwimming": "You can't do that while swimming.",
  "error.tameThat": "You cannot tame that.",
  "error.tameBeastsOnly": "Only beasts can be tamed.",
  "error.tameTooStrong": "That beast is too strong to tame.",
  "error.tameTooHigh": "That beast is too high level for you to tame.",
  "error.tameDungeon": "You cannot tame dungeon creatures.",
  "error.alreadyHavePet": "You already have a pet.",
  "error.noLootPermission": "You don't have permission to loot that.",
  "log.talentsUpdated": "Talents updated.",
  "log.talentsReset": "Talents reset.",
  "log.savedBuild": "Saved build “{name}”.",
  "log.loadoutApplied": "Loadout “{name}” applied.",
  "log.deletedBuild": "Deleted build “{name}”.",
  "log.dismissPet": "You dismiss {name}.",
  "log.summonDemon": "You summon {name}.",
  "log.tamedPet": "{name} is now your loyal companion.",
  "log.entityDies": "{name} dies.",
  "log.prestiged": "You have prestiged! Prestige Rank {rank}.",
  "log.enraged": "{name} becomes enraged!",
  "log.callsForAid": "{name} calls for aid!",
  "log.discarded": "Discarded {item}.",
  "log.equipped": "Equipped {item}.",
  "log.unequipped": "Unequipped {item}.",
  "log.noFish": "No fish are biting.",
  "log.sitEat": "You sit down to eat.",
  "log.sitDrink": "You sit down to drink.",
  "log.quaff": "You quaff {item}.",
  "log.boutDecided": "The bout is decided. Returning to the world…",
  "log.partyLeaves": "{name} leaves the party.",
  "log.partyLeft": "{name} has left the party.",
  "log.partyRemoved": "{name} has been removed from the party.",
  "loot.rollWin": "{winner} wins {item} ({roll})",
  "aura.tamed": "Tamed",
} as const;

const petEnTable = {
  "error.noPet": "You have no pet.",
  "error.petAlreadyAlive": "Your pet is already alive.",
  "error.permanentPetAbandonFrame": "Permanent pets can only be abandoned from the pet frame.",
  "error.summonUnavailable": "That summon is unavailable.",
  "error.huntersAbandonPets": "Only hunters can abandon pets.",
  "error.petClassesRename": "Only pet classes can rename pets.",
  "error.petNameInvalid": "Pet name must be 2-16 letters/spaces/hyphen/apostrophe and start with a letter.",
  "error.petClassesRevive": "Only pet classes can revive pets.",
  "error.petClassesCommand": "Only pet classes can command pets.",
  "error.noLivingPet": "You have no living pet.",
  "error.petNeedsHostileTarget": "Your pet needs a hostile target.",
  "error.petTauntNotReady": "Pet taunt is not ready.",
  "error.huntersFeedPets": "Only hunters can feed pets.",
  "error.petFoodOnly": "Your pet can only eat food.",
  "error.petFullHealth": "Your pet is already at full health.",
  "error.warlocksDemonHeal": "Only warlocks can channel demon healing.",
  "error.youAreDead": "You are dead.",
  "error.youAreStunned": "You are stunned.",
  "error.noLivingDemon": "You have no living demon.",
  "error.demonFullHealth": "Your demon is already at full health.",
  "log.petFadesVoid": "{name} fades back into the void.",
  "log.petAnswersSummons": "{name} answers your summons.",
  "log.abandonPet": "You abandon {name}.",
  "log.petRenamed": "Your pet is now named {name}.",
  "log.petReturns": "{name} returns to your side.",
  "log.feedPet": "You feed {name}.",
  "log.demonHealChannel": "You channel healing into {name}.",
  "log.petMode": "{name} is now {mode}.",
  "petMode.passive": "passive",
  "petMode.defensive": "defensive",
  "petMode.aggressive": "aggressive",
  "aura.summoned": "Summoned",
  "aura.fed": "Fed",
} as const;

const enTable = { ...baseEnTable, ...petEnTable } as const;

type BaseSimMessageKey = keyof typeof baseEnTable;
type PetSimMessageKey = keyof typeof petEnTable;
export type SimMessageKey = keyof typeof enTable;

// Per-locale table. Typed Record<SupportedLanguage, Record<...>> so tsc fails on
// a missing locale OR a missing/renamed key (stronger than the server DICT).
const BASE_DICT: Record<SupportedLanguage, Record<BaseSimMessageKey, string>> = {
  en: {
    "error.lineOfSight": "Line of sight.",
    "error.specLevel": "You may choose a specialization at level {level}.",
    "error.invalidBuild": "Invalid talent build.",
    "error.unknownSpec": "Unknown specialization.",
    "error.maxLoadouts": "You can save at most {count} loadouts.",
    "error.noLoadout": "No such loadout.",
    "error.loadoutLevel": "That loadout needs a higher level.",
    "error.cannotEquip": "You cannot equip that.",
    "error.faceWater": "You need to face fishable water.",
    "error.potionNotReady": "That potion is not ready yet.",
    "error.trinketNotReady": "That trinket is not ready yet.",
    "error.fullHealth": "You are already at full health.",
    "error.nothingRestore": "Nothing to restore.",
    "error.merchantUnavailable": "That merchant is not available.",
    "error.notForSale": "That item is not for sale.",
    "error.noMerchant": "There is no merchant nearby.",
    "error.noSellQuest": "You cannot sell quest items.",
    "error.noBuyback": "That item is not available for buyback.",
    "error.nailedShut": "It is nailed shut.",
    "error.enoughOfThose": "You have enough of those.",
    "error.whoOnline": "The /who roster is available in online play.",
    "error.alreadyInParty": "You are already in a party.",
    "error.notPartyLeader": "You are not the party leader.",
    "error.raidMarkersParty": "You must be in a party to use raid markers.",
    "error.nameSellQty": "Name how many you wish to sell.",
    "error.talentsInCombat": "You cannot change talents in combat.",
    "error.talentsArena": "You cannot change talents during an arena match.",
    "error.noItem": "You don't have that item.",
    "error.cantWhileDead": "You can't do that while dead.",
    "error.cantWhileSwimming": "You can't do that while swimming.",
    "error.tameThat": "You cannot tame that.",
    "error.tameBeastsOnly": "Only beasts can be tamed.",
    "error.tameTooStrong": "That beast is too strong to tame.",
    "error.tameTooHigh": "That beast is too high level for you to tame.",
    "error.tameDungeon": "You cannot tame dungeon creatures.",
    "error.alreadyHavePet": "You already have a pet.",
    "error.noLootPermission": "You don't have permission to loot that.",
    "log.talentsUpdated": "Talents updated.",
    "log.talentsReset": "Talents reset.",
    "log.savedBuild": "Saved build “{name}”.",
    "log.loadoutApplied": "Loadout “{name}” applied.",
    "log.deletedBuild": "Deleted build “{name}”.",
    "log.dismissPet": "You dismiss {name}.",
    "log.summonDemon": "You summon {name}.",
    "log.tamedPet": "{name} is now your loyal companion.",
    "log.entityDies": "{name} dies.",
    "log.prestiged": "You have prestiged! Prestige Rank {rank}.",
    "log.enraged": "{name} becomes enraged!",
    "log.callsForAid": "{name} calls for aid!",
    "log.discarded": "Discarded {item}.",
    "log.equipped": "Equipped {item}.",
    "log.unequipped": "Unequipped {item}.",
    "log.noFish": "No fish are biting.",
    "log.sitEat": "You sit down to eat.",
    "log.sitDrink": "You sit down to drink.",
    "log.quaff": "You quaff {item}.",
    "log.boutDecided": "The bout is decided. Returning to the world…",
    "log.partyLeaves": "{name} leaves the party.",
    "log.partyLeft": "{name} has left the party.",
    "log.partyRemoved": "{name} has been removed from the party.",
    "loot.rollWin": "{winner} wins {item} ({roll})",
    "aura.tamed": "Tamed",
  },
  es: {
    "error.lineOfSight": "Sin línea de visión.",
    "error.specLevel": "Puedes elegir una especialización al nivel {level}.",
    "error.invalidBuild": "Configuración de talentos no válida.",
    "error.unknownSpec": "Especialización desconocida.",
    "error.maxLoadouts": "Puedes guardar como máximo {count} configuraciones.",
    "error.noLoadout": "Esa configuración no existe.",
    "error.loadoutLevel": "Esa configuración requiere un nivel más alto.",
    "error.cannotEquip": "No puedes equipar eso.",
    "error.faceWater": "Debes mirar hacia agua donde se pueda pescar.",
    "error.potionNotReady": "Esa poción aún no está lista.",
    "error.trinketNotReady": "Ese abalorio aún no está listo.",
    "error.fullHealth": "Ya tienes la salud al máximo.",
    "error.nothingRestore": "No hay nada que restaurar.",
    "error.merchantUnavailable": "Ese vendedor no está disponible.",
    "error.notForSale": "Ese objeto no está a la venta.",
    "error.noMerchant": "No hay ningún vendedor cerca.",
    "error.noSellQuest": "No puedes vender objetos de misión.",
    "error.noBuyback": "Ese objeto no está disponible para recompra.",
    "error.nailedShut": "Está clavado y no se puede abrir.",
    "error.enoughOfThose": "Ya tienes suficientes de esos.",
    "error.whoOnline": "La lista de /who está disponible en el juego en línea.",
    "error.alreadyInParty": "Ya estás en un grupo.",
    "error.notPartyLeader": "No eres el líder del grupo.",
    "error.raidMarkersParty": "Debes estar en un grupo para usar marcadores de banda.",
    "error.nameSellQty": "Indica cuántos deseas vender.",
    "error.talentsInCombat": "No puedes cambiar de talentos en combate.",
    "error.talentsArena": "No puedes cambiar de talentos durante un combate de arena.",
    "error.noItem": "No tienes ese objeto.",
    "error.cantWhileDead": "No puedes hacer eso estando muerto.",
    "error.cantWhileSwimming": "No puedes hacer eso mientras nadas.",
    "error.tameThat": "No puedes domesticar eso.",
    "error.tameBeastsOnly": "Solo se puede domesticar a bestias.",
    "error.tameTooStrong": "Esa bestia es demasiado fuerte para domesticarla.",
    "error.tameTooHigh": "Esa bestia es de nivel demasiado alto para que la domestiques.",
    "error.tameDungeon": "No puedes domesticar criaturas de mazmorra.",
    "error.alreadyHavePet": "Ya tienes una mascota.",
    "error.noLootPermission": "No tienes permiso para saquear eso.",
    "log.talentsUpdated": "Talentos actualizados.",
    "log.talentsReset": "Talentos restablecidos.",
    "log.savedBuild": "Configuración “{name}” guardada.",
    "log.loadoutApplied": "Configuración “{name}” aplicada.",
    "log.deletedBuild": "Configuración “{name}” eliminada.",
    "log.dismissPet": "Despides a {name}.",
    "log.summonDemon": "Invocas a {name}.",
    "log.tamedPet": "{name} ahora es tu fiel compañero.",
    "log.entityDies": "{name} muere.",
    "log.prestiged": "¡Has ascendido a prestigio! Rango de prestigio {rank}.",
    "log.enraged": "¡{name} se enfurece!",
    "log.callsForAid": "¡{name} pide ayuda!",
    "log.discarded": "Has desechado {item}.",
    "log.equipped": "Has equipado {item}.",
    "log.unequipped": "Has desequipado {item}.",
    "log.noFish": "No pican los peces.",
    "log.sitEat": "Te sientas a comer.",
    "log.sitDrink": "Te sientas a beber.",
    "log.quaff": "Bebes {item}.",
    "log.boutDecided": "El combate está decidido. Regresando al mundo…",
    "log.partyLeaves": "{name} abandona el grupo.",
    "log.partyLeft": "{name} ha abandonado el grupo.",
    "log.partyRemoved": "{name} ha sido expulsado del grupo.",
    "loot.rollWin": "{winner} gana {item} ({roll})",
    "aura.tamed": "Domado",
  },
};

const PET_DICT_EN: Record<PetSimMessageKey, string> = {
  "error.noPet": "You have no pet.",
  "error.petAlreadyAlive": "Your pet is already alive.",
  "error.permanentPetAbandonFrame": "Permanent pets can only be abandoned from the pet frame.",
  "error.summonUnavailable": "That summon is unavailable.",
  "error.huntersAbandonPets": "Only hunters can abandon pets.",
  "error.petClassesRename": "Only pet classes can rename pets.",
  "error.petNameInvalid": "Pet name must be 2-16 letters/spaces/hyphen/apostrophe and start with a letter.",
  "error.petClassesRevive": "Only pet classes can revive pets.",
  "error.petClassesCommand": "Only pet classes can command pets.",
  "error.noLivingPet": "You have no living pet.",
  "error.petNeedsHostileTarget": "Your pet needs a hostile target.",
  "error.petTauntNotReady": "Pet taunt is not ready.",
  "error.huntersFeedPets": "Only hunters can feed pets.",
  "error.petFoodOnly": "Your pet can only eat food.",
  "error.petFullHealth": "Your pet is already at full health.",
  "error.warlocksDemonHeal": "Only warlocks can channel demon healing.",
  "error.youAreDead": "You are dead.",
  "error.youAreStunned": "You are stunned.",
  "error.noLivingDemon": "You have no living demon.",
  "error.demonFullHealth": "Your demon is already at full health.",
  "log.petFadesVoid": "{name} fades back into the void.",
  "log.petAnswersSummons": "{name} answers your summons.",
  "log.abandonPet": "You abandon {name}.",
  "log.petRenamed": "Your pet is now named {name}.",
  "log.petReturns": "{name} returns to your side.",
  "log.feedPet": "You feed {name}.",
  "log.demonHealChannel": "You channel healing into {name}.",
  "log.petMode": "{name} is now {mode}.",
  "petMode.passive": "passive",
  "petMode.defensive": "defensive",
  "petMode.aggressive": "aggressive",
  "aura.summoned": "Summoned",
  "aura.fed": "Fed",
};

const PET_DICT_ES: Record<PetSimMessageKey, string> = {
  "error.noPet": "No tienes una mascota.",
  "error.petAlreadyAlive": "Tu mascota ya está viva.",
  "error.permanentPetAbandonFrame": "Las mascotas permanentes solo se pueden abandonar desde el marco de mascota.",
  "error.summonUnavailable": "Esa invocación no está disponible.",
  "error.huntersAbandonPets": "Solo los cazadores pueden abandonar mascotas.",
  "error.petClassesRename": "Solo las clases con mascota pueden renombrar mascotas.",
  "error.petNameInvalid": "El nombre de mascota debe tener 2-16 letras, espacios, guiones o apóstrofos, y empezar con una letra.",
  "error.petClassesRevive": "Solo las clases con mascota pueden revivir mascotas.",
  "error.petClassesCommand": "Solo las clases con mascota pueden dar órdenes a mascotas.",
  "error.noLivingPet": "No tienes una mascota viva.",
  "error.petNeedsHostileTarget": "Tu mascota necesita un objetivo hostil.",
  "error.petTauntNotReady": "La provocación de mascota no está lista.",
  "error.huntersFeedPets": "Solo los cazadores pueden alimentar mascotas.",
  "error.petFoodOnly": "Tu mascota solo puede comer comida.",
  "error.petFullHealth": "Tu mascota ya tiene la salud al máximo.",
  "error.warlocksDemonHeal": "Solo los brujos pueden canalizar sanación demoníaca.",
  "error.youAreDead": "Estás muerto.",
  "error.youAreStunned": "Estás aturdido.",
  "error.noLivingDemon": "No tienes un demonio vivo.",
  "error.demonFullHealth": "Tu demonio ya tiene la salud al máximo.",
  "log.petFadesVoid": "{name} se desvanece de vuelta en el vacío.",
  "log.petAnswersSummons": "{name} responde a tu invocación.",
  "log.abandonPet": "Abandonas a {name}.",
  "log.petRenamed": "Tu mascota ahora se llama {name}.",
  "log.petReturns": "{name} vuelve a tu lado.",
  "log.feedPet": "Alimentas a {name}.",
  "log.demonHealChannel": "Canalizas sanación hacia {name}.",
  "log.petMode": "{name} ahora está en modo {mode}.",
  "petMode.passive": "pasivo",
  "petMode.defensive": "defensivo",
  "petMode.aggressive": "agresivo",
  "aura.summoned": "Invocado",
  "aura.fed": "Alimentado",
};










const PET_DICT: Record<SupportedLanguage, Record<PetSimMessageKey, string>> = {
  en: PET_DICT_EN,
  es: PET_DICT_ES,
};

export const DICT: Record<SupportedLanguage, Record<SimMessageKey, string>> = Object.fromEntries(
  supportedLanguages.map((lang) => [lang, { ...BASE_DICT[lang], ...PET_DICT[lang] }]),
) as Record<SupportedLanguage, Record<SimMessageKey, string>>;

function interpolate(template: string, params?: InterpolationValues): string {
  if (!params) return template;
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (m, name: string) => {
    const v = params[name];
    return v === undefined ? m : String(v);
  });
}

export function tSim(key: SimMessageKey, params?: InterpolationValues, lang: SupportedLanguage = getLanguage()): string {
  const table = DICT[lang] ?? DICT.en;
  const tmpl = table[key] ?? DICT.en[key];
  return interpolate(tmpl, params);
}

// Reverse maps: the sim splices English item/mob names into its text; localize them.
const itemNameToId = new Map<string, string>();
for (const [id, it] of Object.entries(ITEMS)) itemNameToId.set(it.name, id);
const mobNameToId = new Map<string, string>();
for (const [id, m] of Object.entries(MOBS)) mobNameToId.set(m.name, id);

function locItem(name: string): string {
  const id = itemNameToId.get(name);
  return id ? tEntity({ kind: 'item', id, field: 'name' }) : name;
}
function locMob(name: string): string {
  const id = mobNameToId.get(name);
  return id ? tEntity({ kind: 'mob', id, field: 'name' }) : name;
}
function locItemStack(name: string, stackSuffix?: string): string {
  const item = locItem(name);
  if (!stackSuffix) return item;
  const count = Number(stackSuffix.trim().slice(1));
  return `${item} ${t('itemUi.bags.stackCount', { count: formatNumber(count, { maximumFractionDigits: 0 }) })}`;
}
function locPetMode(mode: string): string {
  const normalized = mode.toLowerCase();
  if (normalized === 'passive' || normalized === 'defensive' || normalized === 'aggressive') {
    return tSim(`petMode.${normalized}` as PetSimMessageKey);
  }
  return mode;
}

// Flavor aura names (not abilities, not talents) shown in the buff frame / combat log.
const AURA_NAME_KEY: Record<string, SimMessageKey> = {
  Tamed: 'aura.tamed',
  Summoned: 'aura.summoned',
  Fed: 'aura.fed',
};
export function localizeSimAuraName(name: string): string | null {
  const key = AURA_NAME_KEY[name];
  return key ? tSim(key) : null;
}

// Trinket on-use/proc buffs surface by the item's name; localize via the item table.
export function localizeSimItemName(name: string): string | null {
  const id = itemNameToId.get(name);
  return id ? tEntity({ kind: 'item', id, field: 'name' }) : null;
}

// EXACT (no-placeholder) sim messages: English -> key (auto-built; throws on collision).
const EXACT: Record<string, SimMessageKey> = {};
for (const key of Object.keys(enTable) as SimMessageKey[]) {
  const v = enTable[key];
  if (v.includes('{') || key.startsWith('aura.') || key.startsWith('petMode.')) continue;
  if (EXACT[v] !== undefined) throw new Error(`sim_i18n: duplicate exact English message "${v}" (keys ${EXACT[v]} and ${key})`);
  EXACT[v] = key;
}

type Rule = { re: RegExp; build: (m: RegExpExecArray) => string };
const RULES: Rule[] = [
  { re: /^You may choose a specialization at level (\d+)\.$/, build: (m) => tSim('error.specLevel', { level: m[1] }) },
  { re: /^You can save at most (\d+) loadouts\.$/, build: (m) => tSim('error.maxLoadouts', { count: m[1] }) },
  { re: /^Saved build "(.+)"\.$/, build: (m) => tSim('log.savedBuild', { name: m[1] }) },
  { re: /^Loadout "(.+)" applied\.$/, build: (m) => tSim('log.loadoutApplied', { name: m[1] }) },
  { re: /^Deleted build "(.+)"\.$/, build: (m) => tSim('log.deletedBuild', { name: m[1] }) },
  { re: /^You dismiss (.+)\.$/, build: (m) => tSim('log.dismissPet', { name: locMob(m[1]) }) },
  { re: /^You summon (.+)\.$/, build: (m) => tSim('log.summonDemon', { name: locMob(m[1]) }) },
  { re: /^(.+) fades back into the void\.$/, build: (m) => tSim('log.petFadesVoid', { name: locMob(m[1]) }) },
  { re: /^(.+) answers your summons\.$/, build: (m) => tSim('log.petAnswersSummons', { name: locMob(m[1]) }) },
  { re: /^You abandon (.+)\.$/, build: (m) => tSim('log.abandonPet', { name: locMob(m[1]) }) },
  { re: /^Your pet is now named (.+)\.$/, build: (m) => tSim('log.petRenamed', { name: m[1] }) },
  { re: /^(.+) returns to your side\.$/, build: (m) => tSim('log.petReturns', { name: locMob(m[1]) }) },
  { re: /^You feed (.+)\.$/, build: (m) => tSim('log.feedPet', { name: locMob(m[1]) }) },
  { re: /^You channel healing into (.+)\.$/, build: (m) => tSim('log.demonHealChannel', { name: locMob(m[1]) }) },
  { re: /^(.+) is now your loyal companion\.$/, build: (m) => tSim('log.tamedPet', { name: locMob(m[1]) }) },
  { re: /^(.+) is now (.+)\.$/, build: (m) => tSim('log.petMode', { name: locMob(m[1]), mode: locPetMode(m[2]) }) },
  { re: /^(.+) dies\.$/, build: (m) => tSim('log.entityDies', { name: locMob(m[1]) }) },
  { re: /^You have prestiged! Prestige Rank (\d+)\.$/, build: (m) => tSim('log.prestiged', { rank: m[1] }) },
  { re: /^(.+) becomes enraged!$/, build: (m) => tSim('log.enraged', { name: locMob(m[1]) }) },
  { re: /^(.+) calls for aid!$/, build: (m) => tSim('log.callsForAid', { name: locMob(m[1]) }) },
  { re: /^Discarded (.+?)( x\d+)?\.$/, build: (m) => tSim('log.discarded', { item: locItemStack(m[1], m[2]) }) },
  { re: /^Equipped (.+)\.$/, build: (m) => tSim('log.equipped', { item: locItem(m[1]) }) },
  { re: /^Unequipped (.+)\.$/, build: (m) => tSim('log.unequipped', { item: locItem(m[1]) }) },
  { re: /^You quaff (.+)\.$/, build: (m) => tSim('log.quaff', { item: locItem(m[1]) }) },
  { re: /^(.+) wins (.+) \((\d+)\)$/, build: (m) => tSim('loot.rollWin', { winner: m[1], item: locItem(m[2]), roll: m[3] }) },
  { re: /^(.+) leaves the party\.$/, build: (m) => tSim('log.partyLeaves', { name: m[1] }) },
  { re: /^(.+) has left the party\.$/, build: (m) => tSim('log.partyLeft', { name: m[1] }) },
  { re: /^(.+) has been removed from the party\.$/, build: (m) => tSim('log.partyRemoved', { name: m[1] }) },
];

// Returns the localized form of a sim-emitted message, or null if not one of ours.
export function localizeSimText(text: string): string | null {
  const exactKey = EXACT[text];
  if (exactKey) return tSim(exactKey);
  for (const rule of RULES) {
    const m = rule.re.exec(text);
    if (m) return rule.build(m);
  }
  return null;
}
