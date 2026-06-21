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

const PET_DICT_FR: Record<PetSimMessageKey, string> = {
  "error.noPet": "Vous n'avez pas de familier.",
  "error.petAlreadyAlive": "Votre familier est déjà en vie.",
  "error.permanentPetAbandonFrame": "Les familiers permanents ne peuvent être abandonnés que depuis le cadre du familier.",
  "error.summonUnavailable": "Cette invocation n'est pas disponible.",
  "error.huntersAbandonPets": "Seuls les chasseurs peuvent abandonner des familiers.",
  "error.petClassesRename": "Seules les classes à familier peuvent renommer des familiers.",
  "error.petNameInvalid": "Le nom du familier doit contenir 2 à 16 lettres, espaces, traits d'union ou apostrophes, et commencer par une lettre.",
  "error.petClassesRevive": "Seules les classes à familier peuvent ranimer des familiers.",
  "error.petClassesCommand": "Seules les classes à familier peuvent commander des familiers.",
  "error.noLivingPet": "Vous n'avez pas de familier vivant.",
  "error.petNeedsHostileTarget": "Votre familier a besoin d'une cible hostile.",
  "error.petTauntNotReady": "La provocation du familier n'est pas prête.",
  "error.huntersFeedPets": "Seuls les chasseurs peuvent nourrir des familiers.",
  "error.petFoodOnly": "Votre familier ne peut manger que de la nourriture.",
  "error.petFullHealth": "Votre familier a déjà tous ses points de vie.",
  "error.warlocksDemonHeal": "Seuls les démonistes peuvent canaliser une guérison démoniaque.",
  "error.youAreDead": "Vous êtes mort.",
  "error.youAreStunned": "Vous êtes étourdi.",
  "error.noLivingDemon": "Vous n'avez pas de démon vivant.",
  "error.demonFullHealth": "Votre démon a déjà tous ses points de vie.",
  "log.petFadesVoid": "{name} se dissipe dans le Néant.",
  "log.petAnswersSummons": "{name} répond à votre invocation.",
  "log.abandonPet": "Vous abandonnez {name}.",
  "log.petRenamed": "Votre familier s'appelle désormais {name}.",
  "log.petReturns": "{name} revient à vos côtés.",
  "log.feedPet": "Vous nourrissez {name}.",
  "log.demonHealChannel": "Vous canalisez des soins vers {name}.",
  "log.petMode": "{name} est maintenant en mode {mode}.",
  "petMode.passive": "passif",
  "petMode.defensive": "défensif",
  "petMode.aggressive": "agressif",
  "aura.summoned": "Invoqué",
  "aura.fed": "Nourri",
};

const PET_DICT_IT: Record<PetSimMessageKey, string> = {
  "error.noPet": "Non hai una mascotte.",
  "error.petAlreadyAlive": "La tua mascotte è già viva.",
  "error.permanentPetAbandonFrame": "Le mascotte permanenti possono essere abbandonate solo dal riquadro della mascotte.",
  "error.summonUnavailable": "Quella evocazione non è disponibile.",
  "error.huntersAbandonPets": "Solo i cacciatori possono abbandonare mascotte.",
  "error.petClassesRename": "Solo le classi con mascotte possono rinominare mascotte.",
  "error.petNameInvalid": "Il nome della mascotte deve avere 2-16 lettere, spazi, trattini o apostrofi e iniziare con una lettera.",
  "error.petClassesRevive": "Solo le classi con mascotte possono rianimare mascotte.",
  "error.petClassesCommand": "Solo le classi con mascotte possono comandare mascotte.",
  "error.noLivingPet": "Non hai una mascotte viva.",
  "error.petNeedsHostileTarget": "La tua mascotte ha bisogno di un bersaglio ostile.",
  "error.petTauntNotReady": "La provocazione della mascotte non è pronta.",
  "error.huntersFeedPets": "Solo i cacciatori possono nutrire mascotte.",
  "error.petFoodOnly": "La tua mascotte può mangiare solo cibo.",
  "error.petFullHealth": "La tua mascotte ha già la salute al massimo.",
  "error.warlocksDemonHeal": "Solo gli stregoni possono canalizzare cure demoniache.",
  "error.youAreDead": "Sei morto.",
  "error.youAreStunned": "Sei stordito.",
  "error.noLivingDemon": "Non hai un demone vivo.",
  "error.demonFullHealth": "Il tuo demone ha già la salute al massimo.",
  "log.petFadesVoid": "{name} svanisce di nuovo nel vuoto.",
  "log.petAnswersSummons": "{name} risponde alla tua evocazione.",
  "log.abandonPet": "Abbandoni {name}.",
  "log.petRenamed": "La tua mascotte ora si chiama {name}.",
  "log.petReturns": "{name} torna al tuo fianco.",
  "log.feedPet": "Nutri {name}.",
  "log.demonHealChannel": "Canalizzi cure verso {name}.",
  "log.petMode": "{name} è ora in modalità {mode}.",
  "petMode.passive": "passiva",
  "petMode.defensive": "difensiva",
  "petMode.aggressive": "aggressiva",
  "aura.summoned": "Evocato",
  "aura.fed": "Nutrito",
};

const PET_DICT_DE: Record<PetSimMessageKey, string> = {
  "error.noPet": "Du hast kein Begleittier.",
  "error.petAlreadyAlive": "Dein Begleittier lebt bereits.",
  "error.permanentPetAbandonFrame": "Dauerhafte Begleiter können nur über das Begleiterfenster aufgegeben werden.",
  "error.summonUnavailable": "Diese Beschwörung ist nicht verfügbar.",
  "error.huntersAbandonPets": "Nur Jäger können Begleiter aufgeben.",
  "error.petClassesRename": "Nur Begleiterklassen können Begleiter umbenennen.",
  "error.petNameInvalid": "Der Begleitername muss 2-16 Buchstaben, Leerzeichen, Bindestriche oder Apostrophe enthalten und mit einem Buchstaben beginnen.",
  "error.petClassesRevive": "Nur Begleiterklassen können Begleiter wiederbeleben.",
  "error.petClassesCommand": "Nur Begleiterklassen können Begleiter befehligen.",
  "error.noLivingPet": "Du hast kein lebendes Begleittier.",
  "error.petNeedsHostileTarget": "Dein Begleiter braucht ein feindliches Ziel.",
  "error.petTauntNotReady": "Der Begleiterspott ist noch nicht bereit.",
  "error.huntersFeedPets": "Nur Jäger können Begleiter füttern.",
  "error.petFoodOnly": "Dein Begleiter kann nur Nahrung fressen.",
  "error.petFullHealth": "Dein Begleiter hat bereits volle Gesundheit.",
  "error.warlocksDemonHeal": "Nur Hexenmeister können Dämonenheilung kanalisieren.",
  "error.youAreDead": "Du bist tot.",
  "error.youAreStunned": "Du bist betäubt.",
  "error.noLivingDemon": "Du hast keinen lebenden Dämon.",
  "error.demonFullHealth": "Dein Dämon hat bereits volle Gesundheit.",
  "log.petFadesVoid": "{name} verschwindet zurück in die Leere.",
  "log.petAnswersSummons": "{name} folgt deiner Beschwörung.",
  "log.abandonPet": "Du gibst {name} auf.",
  "log.petRenamed": "Dein Begleiter heißt nun {name}.",
  "log.petReturns": "{name} kehrt an deine Seite zurück.",
  "log.feedPet": "Du fütterst {name}.",
  "log.demonHealChannel": "Du kanalisierst Heilung in {name}.",
  "log.petMode": "{name} ist jetzt {mode}.",
  "petMode.passive": "passiv",
  "petMode.defensive": "defensiv",
  "petMode.aggressive": "aggressiv",
  "aura.summoned": "Beschworen",
  "aura.fed": "Gefüttert",
};

const PET_DICT_ZH_CN: Record<PetSimMessageKey, string> = {
  "error.noPet": "你没有宠物。",
  "error.petAlreadyAlive": "你的宠物已经活着。",
  "error.permanentPetAbandonFrame": "永久宠物只能从宠物框架中放弃。",
  "error.summonUnavailable": "该召唤不可用。",
  "error.huntersAbandonPets": "只有猎人可以放弃宠物。",
  "error.petClassesRename": "只有宠物职业可以重命名宠物。",
  "error.petNameInvalid": "宠物名称必须为 2-16 个字母、空格、连字符或撇号，并以字母开头。",
  "error.petClassesRevive": "只有宠物职业可以复活宠物。",
  "error.petClassesCommand": "只有宠物职业可以命令宠物。",
  "error.noLivingPet": "你没有活着的宠物。",
  "error.petNeedsHostileTarget": "你的宠物需要一个敌对目标。",
  "error.petTauntNotReady": "宠物嘲讽尚未就绪。",
  "error.huntersFeedPets": "只有猎人可以喂养宠物。",
  "error.petFoodOnly": "你的宠物只能吃食物。",
  "error.petFullHealth": "你的宠物生命值已满。",
  "error.warlocksDemonHeal": "只有术士可以引导恶魔治疗。",
  "error.youAreDead": "你已经死亡。",
  "error.youAreStunned": "你被击晕了。",
  "error.noLivingDemon": "你没有活着的恶魔。",
  "error.demonFullHealth": "你的恶魔生命值已满。",
  "log.petFadesVoid": "{name} 消散回虚空。",
  "log.petAnswersSummons": "{name} 回应了你的召唤。",
  "log.abandonPet": "你放弃了 {name}。",
  "log.petRenamed": "你的宠物现在名为 {name}。",
  "log.petReturns": "{name} 回到你身边。",
  "log.feedPet": "你喂养了 {name}。",
  "log.demonHealChannel": "你向 {name} 引导治疗。",
  "log.petMode": "{name} 现在处于{mode}模式。",
  "petMode.passive": "被动",
  "petMode.defensive": "防御",
  "petMode.aggressive": "攻击",
  "aura.summoned": "已召唤",
  "aura.fed": "已喂养",
};

const PET_DICT_ZH_TW: Record<PetSimMessageKey, string> = {
  "error.noPet": "你沒有寵物。",
  "error.petAlreadyAlive": "你的寵物已經活著。",
  "error.permanentPetAbandonFrame": "永久寵物只能從寵物框架中放棄。",
  "error.summonUnavailable": "該召喚不可用。",
  "error.huntersAbandonPets": "只有獵人可以放棄寵物。",
  "error.petClassesRename": "只有寵物職業可以重新命名寵物。",
  "error.petNameInvalid": "寵物名稱必須為 2-16 個字母、空格、連字號或撇號，並以字母開頭。",
  "error.petClassesRevive": "只有寵物職業可以復活寵物。",
  "error.petClassesCommand": "只有寵物職業可以命令寵物。",
  "error.noLivingPet": "你沒有活著的寵物。",
  "error.petNeedsHostileTarget": "你的寵物需要一個敵對目標。",
  "error.petTauntNotReady": "寵物嘲諷尚未就緒。",
  "error.huntersFeedPets": "只有獵人可以餵養寵物。",
  "error.petFoodOnly": "你的寵物只能吃食物。",
  "error.petFullHealth": "你的寵物生命值已滿。",
  "error.warlocksDemonHeal": "只有術士可以引導惡魔治療。",
  "error.youAreDead": "你已經死亡。",
  "error.youAreStunned": "你被擊暈了。",
  "error.noLivingDemon": "你沒有活著的惡魔。",
  "error.demonFullHealth": "你的惡魔生命值已滿。",
  "log.petFadesVoid": "{name} 消散回虛空。",
  "log.petAnswersSummons": "{name} 回應了你的召喚。",
  "log.abandonPet": "你放棄了 {name}。",
  "log.petRenamed": "你的寵物現在名為 {name}。",
  "log.petReturns": "{name} 回到你身邊。",
  "log.feedPet": "你餵養了 {name}。",
  "log.demonHealChannel": "你向 {name} 引導治療。",
  "log.petMode": "{name} 現在處於{mode}模式。",
  "petMode.passive": "被動",
  "petMode.defensive": "防禦",
  "petMode.aggressive": "攻擊",
  "aura.summoned": "已召喚",
  "aura.fed": "已餵養",
};

const PET_DICT_KO: Record<PetSimMessageKey, string> = {
  "error.noPet": "소환수가 없습니다.",
  "error.petAlreadyAlive": "소환수가 이미 살아 있습니다.",
  "error.permanentPetAbandonFrame": "영구 소환수는 소환수 창에서만 포기할 수 있습니다.",
  "error.summonUnavailable": "그 소환은 사용할 수 없습니다.",
  "error.huntersAbandonPets": "사냥꾼만 소환수를 포기할 수 있습니다.",
  "error.petClassesRename": "소환수 직업만 소환수 이름을 바꿀 수 있습니다.",
  "error.petNameInvalid": "소환수 이름은 2-16자의 문자, 공백, 하이픈 또는 아포스트로피여야 하며 문자로 시작해야 합니다.",
  "error.petClassesRevive": "소환수 직업만 소환수를 되살릴 수 있습니다.",
  "error.petClassesCommand": "소환수 직업만 소환수에게 명령할 수 있습니다.",
  "error.noLivingPet": "살아 있는 소환수가 없습니다.",
  "error.petNeedsHostileTarget": "소환수에게 적대적인 대상이 필요합니다.",
  "error.petTauntNotReady": "소환수 도발이 아직 준비되지 않았습니다.",
  "error.huntersFeedPets": "사냥꾼만 소환수에게 먹이를 줄 수 있습니다.",
  "error.petFoodOnly": "소환수는 음식만 먹을 수 있습니다.",
  "error.petFullHealth": "소환수의 생명력이 이미 가득 찼습니다.",
  "error.warlocksDemonHeal": "흑마법사만 악마 치유를 정신집중할 수 있습니다.",
  "error.youAreDead": "당신은 죽었습니다.",
  "error.youAreStunned": "당신은 기절했습니다.",
  "error.noLivingDemon": "살아 있는 악마가 없습니다.",
  "error.demonFullHealth": "악마의 생명력이 이미 가득 찼습니다.",
  "log.petFadesVoid": "{name}이(가) 다시 공허 속으로 사라집니다.",
  "log.petAnswersSummons": "{name}이(가) 당신의 소환에 응답합니다.",
  "log.abandonPet": "{name}을(를) 포기합니다.",
  "log.petRenamed": "소환수의 이름이 {name}(으)로 바뀌었습니다.",
  "log.petReturns": "{name}이(가) 당신 곁으로 돌아옵니다.",
  "log.feedPet": "{name}에게 먹이를 줍니다.",
  "log.demonHealChannel": "{name}에게 치유를 정신집중합니다.",
  "log.petMode": "{name}이(가) 이제 {mode} 상태입니다.",
  "petMode.passive": "수동",
  "petMode.defensive": "방어",
  "petMode.aggressive": "공격",
  "aura.summoned": "소환됨",
  "aura.fed": "먹이를 먹음",
};

const PET_DICT_JA: Record<PetSimMessageKey, string> = {
  "error.noPet": "ペットがいません。",
  "error.petAlreadyAlive": "ペットはすでに生きています。",
  "error.permanentPetAbandonFrame": "永続ペットはペットフレームからのみ放棄できます。",
  "error.summonUnavailable": "その召喚は使用できません。",
  "error.huntersAbandonPets": "ハンターだけがペットを放棄できます。",
  "error.petClassesRename": "ペットクラスだけがペットの名前を変更できます。",
  "error.petNameInvalid": "ペット名は2-16文字の文字、スペース、ハイフン、アポストロフィで、文字から始める必要があります。",
  "error.petClassesRevive": "ペットクラスだけがペットを蘇生できます。",
  "error.petClassesCommand": "ペットクラスだけがペットに命令できます。",
  "error.noLivingPet": "生きているペットがいません。",
  "error.petNeedsHostileTarget": "ペットには敵対的な対象が必要です。",
  "error.petTauntNotReady": "ペットの挑発はまだ準備できていません。",
  "error.huntersFeedPets": "ハンターだけがペットに餌を与えられます。",
  "error.petFoodOnly": "ペットは食べ物だけを食べられます。",
  "error.petFullHealth": "ペットの体力はすでに最大です。",
  "error.warlocksDemonHeal": "ウォーロックだけが悪魔の治癒をチャネルできます。",
  "error.youAreDead": "あなたは死亡しています。",
  "error.youAreStunned": "あなたはスタンしています。",
  "error.noLivingDemon": "生きている悪魔がいません。",
  "error.demonFullHealth": "悪魔の体力はすでに最大です。",
  "log.petFadesVoid": "{name}は虚空へ戻って消えます。",
  "log.petAnswersSummons": "{name}が召喚に応じます。",
  "log.abandonPet": "{name}を放棄しました。",
  "log.petRenamed": "ペットの名前は{name}になりました。",
  "log.petReturns": "{name}があなたのそばに戻ります。",
  "log.feedPet": "{name}に餌を与えます。",
  "log.demonHealChannel": "{name}へ治癒をチャネルします。",
  "log.petMode": "{name}は現在{mode}です。",
  "petMode.passive": "受動",
  "petMode.defensive": "防御",
  "petMode.aggressive": "攻撃",
  "aura.summoned": "召喚済み",
  "aura.fed": "給餌済み",
};

const PET_DICT_PT: Record<PetSimMessageKey, string> = {
  "error.noPet": "Você não tem mascote.",
  "error.petAlreadyAlive": "Seu mascote já está vivo.",
  "error.permanentPetAbandonFrame": "Mascotes permanentes só podem ser abandonados pela moldura do mascote.",
  "error.summonUnavailable": "Essa invocação não está disponível.",
  "error.huntersAbandonPets": "Somente caçadores podem abandonar mascotes.",
  "error.petClassesRename": "Somente classes com mascote podem renomear mascotes.",
  "error.petNameInvalid": "O nome do mascote deve ter 2-16 letras, espaços, hífens ou apóstrofos e começar com uma letra.",
  "error.petClassesRevive": "Somente classes com mascote podem reviver mascotes.",
  "error.petClassesCommand": "Somente classes com mascote podem comandar mascotes.",
  "error.noLivingPet": "Você não tem um mascote vivo.",
  "error.petNeedsHostileTarget": "Seu mascote precisa de um alvo hostil.",
  "error.petTauntNotReady": "A provocação do mascote não está pronta.",
  "error.huntersFeedPets": "Somente caçadores podem alimentar mascotes.",
  "error.petFoodOnly": "Seu mascote só pode comer comida.",
  "error.petFullHealth": "Seu mascote já está com a vida cheia.",
  "error.warlocksDemonHeal": "Somente bruxos podem canalizar cura demoníaca.",
  "error.youAreDead": "Você está morto.",
  "error.youAreStunned": "Você está atordoado.",
  "error.noLivingDemon": "Você não tem um demônio vivo.",
  "error.demonFullHealth": "Seu demônio já está com a vida cheia.",
  "log.petFadesVoid": "{name} desaparece de volta no vazio.",
  "log.petAnswersSummons": "{name} responde à sua invocação.",
  "log.abandonPet": "Você abandona {name}.",
  "log.petRenamed": "Seu mascote agora se chama {name}.",
  "log.petReturns": "{name} volta para o seu lado.",
  "log.feedPet": "Você alimenta {name}.",
  "log.demonHealChannel": "Você canaliza cura em {name}.",
  "log.petMode": "{name} agora está no modo {mode}.",
  "petMode.passive": "passivo",
  "petMode.defensive": "defensivo",
  "petMode.aggressive": "agressivo",
  "aura.summoned": "Invocado",
  "aura.fed": "Alimentado",
};

const PET_DICT_RU: Record<PetSimMessageKey, string> = {
  "error.noPet": "У вас нет питомца.",
  "error.petAlreadyAlive": "Ваш питомец уже жив.",
  "error.permanentPetAbandonFrame": "Постоянных питомцев можно оставить только через рамку питомца.",
  "error.summonUnavailable": "Этот призыв недоступен.",
  "error.huntersAbandonPets": "Только охотники могут оставлять питомцев.",
  "error.petClassesRename": "Только классы с питомцами могут переименовывать питомцев.",
  "error.petNameInvalid": "Имя питомца должно содержать 2-16 букв, пробелов, дефисов или апострофов и начинаться с буквы.",
  "error.petClassesRevive": "Только классы с питомцами могут воскрешать питомцев.",
  "error.petClassesCommand": "Только классы с питомцами могут отдавать приказы питомцам.",
  "error.noLivingPet": "У вас нет живого питомца.",
  "error.petNeedsHostileTarget": "Вашему питомцу нужна враждебная цель.",
  "error.petTauntNotReady": "Провокация питомца ещё не готова.",
  "error.huntersFeedPets": "Только охотники могут кормить питомцев.",
  "error.petFoodOnly": "Ваш питомец может есть только пищу.",
  "error.petFullHealth": "У вашего питомца уже полное здоровье.",
  "error.warlocksDemonHeal": "Только чернокнижники могут направлять исцеление демона.",
  "error.youAreDead": "Вы мертвы.",
  "error.youAreStunned": "Вы оглушены.",
  "error.noLivingDemon": "У вас нет живого демона.",
  "error.demonFullHealth": "У вашего демона уже полное здоровье.",
  "log.petFadesVoid": "{name} растворяется обратно в Бездне.",
  "log.petAnswersSummons": "{name} откликается на ваш призыв.",
  "log.abandonPet": "Вы оставляете {name}.",
  "log.petRenamed": "Теперь вашего питомца зовут {name}.",
  "log.petReturns": "{name} возвращается к вам.",
  "log.feedPet": "Вы кормите {name}.",
  "log.demonHealChannel": "Вы направляете исцеление в {name}.",
  "log.petMode": "{name} теперь в режиме {mode}.",
  "petMode.passive": "пассивный",
  "petMode.defensive": "защитный",
  "petMode.aggressive": "агрессивный",
  "aura.summoned": "Призван",
  "aura.fed": "Накормлен",
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
