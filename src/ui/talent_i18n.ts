import { ABILITIES, CLASSES } from '../sim/data';
import {
  TALENTS,
  type ClassTalents,
  type GlobalModEffect,
  type SpecDef,
  type StatModEffect,
  type TalentChoiceOption,
  type TalentEffect,
  type TalentNode,
} from '../sim/content/talents';
import type { PlayerClass } from '../sim/types';
import { getLanguage, languageTag, type SupportedLanguage } from './i18n';
import { tEntity } from './entity_i18n';

export type TalentTranslationKind = 'talentNode' | 'talentChoice' | 'talentSpec' | 'talentMastery';
export type TalentTranslationField = 'name' | 'description';

export type TalentTranslationRequest =
  | { kind: 'talentNode'; node: TalentNode; field: TalentTranslationField }
  | { kind: 'talentChoice'; choice: TalentChoiceOption; field: TalentTranslationField }
  | { kind: 'talentSpec'; spec: SpecDef; field: TalentTranslationField }
  | { kind: 'talentMastery'; spec: SpecDef; field: TalentTranslationField };

export interface TalentTranslationManifestEntry {
  kind: TalentTranslationKind;
  id: string;
  classId: PlayerClass;
  specId?: string;
  field: TalentTranslationField;
  source: string;
}

type StatKey = keyof StatModEffect;
type GlobalKey = keyof GlobalModEffect;

interface TalentLocaleText {
  statLabels: Record<StatKey | GlobalKey | 'damage' | 'cost' | 'cooldown' | 'castTime', string>;
  roleLabels: Record<'tank' | 'healer' | 'dps', string>;
  perRank: string;
  noEffect: string;
  chooseOne: (name: string) => string;
  specDescription: (className: string, role: string, abilityName: string) => string;
  grant: (abilityName: string) => string;
  increase: (target: string, amount: string, perRank: string) => string;
  reduce: (target: string, amount: string, perRank: string) => string;
}

const abilityIdByName = new Map(Object.values(ABILITIES).map((ability) => [ability.name, ability.id]));

const enText: TalentLocaleText = {
  statLabels: {
    str: 'Strength',
    agi: 'Agility',
    sta: 'Stamina',
    int: 'Intellect',
    spi: 'Spirit',
    armor: 'armor',
    ap: 'attack power',
    crit: 'critical strike chance',
    dodge: 'dodge chance',
    apPct: 'attack power',
    staPct: 'Stamina',
    armorPct: 'armor',
    maxHpPct: 'maximum health',
    meleeDmgPct: 'melee ability damage',
    spellDmgPct: 'spell damage',
    healPct: 'healing done',
    threatPct: 'threat generated',
    damage: 'damage',
    cost: 'cost',
    cooldown: 'cooldown',
    castTime: 'cast time',
  },
  roleLabels: { tank: 'tank', healer: 'healer', dps: 'damage' },
  perRank: ' per rank',
  noEffect: 'Provides a specialization benefit.',
  chooseOne: (name) => `Choose one ${name} option.`,
  specDescription: (className, role, abilityName) => `${className} specialization focused on ${role}. Signature ability: ${abilityName}.`,
  grant: (abilityName) => `Grants ${abilityName}.`,
  increase: (target, amount, perRank) => `Increases ${target} by ${amount}${perRank}.`,
  reduce: (target, amount, perRank) => `Reduces ${target} by ${amount}${perRank}.`,
};

const localeText: Record<SupportedLanguage, TalentLocaleText> = {
  en: enText,
  es: {
    statLabels: {
      str: 'Fuerza', agi: 'Agilidad', sta: 'Aguante', int: 'Intelecto', spi: 'Espíritu', armor: 'armadura',
      ap: 'poder de ataque', crit: 'probabilidad de golpe crítico', dodge: 'probabilidad de esquivar',
      apPct: 'poder de ataque', staPct: 'Aguante', armorPct: 'armadura', maxHpPct: 'salud máxima',
      meleeDmgPct: 'daño de habilidades cuerpo a cuerpo', spellDmgPct: 'daño con hechizos', healPct: 'sanación realizada',
      threatPct: 'amenaza generada', damage: 'daño', cost: 'coste', cooldown: 'reutilización', castTime: 'tiempo de lanzamiento',
    },
    roleLabels: { tank: 'tanque', healer: 'sanación', dps: 'daño' },
    perRank: ' por rango',
    noEffect: 'Aporta una ventaja de especialización.',
    chooseOne: (name) => `Elige una opción de ${name}.`,
    specDescription: (className, role, abilityName) => `Especialización de ${className} centrada en ${role}. Habilidad distintiva: ${abilityName}.`,
    grant: (abilityName) => `Otorga ${abilityName}.`,
    increase: (target, amount, perRank) => `Aumenta ${target} en ${amount}${perRank}.`,
    reduce: (target, amount, perRank) => `Reduce ${target} en ${amount}${perRank}.`,
  },
};




// Single authoritative table of per-name talent-title translations using official
// classic-MMO terminology. translateTitle() consults this after ability-name
// resolution. To add a talent or locale, add its localized name here for each
// locale — there is no secondary additions/corrections layer.
const titleOverrides: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  es: {
    "Affliction": "Aflicción",
    "Amplify Curse": "Amplificar maldición",
    "Ancestral Guidance": "Guía ancestral",
    "Ancestral Knowledge": "Conocimiento ancestral",
    "Ancestral Weapons": "Armas ancestrales",
    "Ardent Defender": "Defensor ferviente",
    "Assassin Vigor": "Vigor de asesino",
    "Assassination": "Asesinato",
    "Backdraft": "Tiro de retorno",
    "Bane": "Perdición",
    "Battle Training": "Entrenamiento de batalla",
    "Brutality": "Brutalidad",
    "Barrage": "Descarga",
    "Benediction": "Bendición",
    "Bestial Bond": "Vínculo bestial",
    "Bestial Wrath": "Ira bestial",
    "Blackout": "Desmayo",
    "Blade Flurry": "Frenesí de hoja",
    "Blademaster": "Maestro de hojas",
    "Blast Wave": "Onda explosiva",
    "Blessing of Sanctuary": "Bendición de santuario",
    "Blood Craze": "Ansia de sangre",
    "Bloodthirsty": "Sediento de sangre",
    "Borrowed Time": "Tiempo prestado",
    "Brutal Impact": "Impacto brutal",
    "Bulwark": "Baluarte",
    "Call of Flame": "Llamada de la llama",
    "Camouflage": "Camuflaje",
    "Cataclysm": "Cataclismo",
    "Clearcasting": "Lanzamiento libre",
    "Cold Blood": "Sangre fría",
    "Cold Snap": "Frío repentino",
    "Combustion": "Combustión",
    "Concussion": "Conmoción",
    "Convection": "Convección",
    "Conviction": "Convicción",
    "Counterattack": "Contraataque",
    "Critical Mass": "Masa crítica",
    "Crusader Path": "Senda del cruzado",
    "Crusader Strikes": "Golpes de cruzado",
    "Crusader Zeal": "Celo de cruzado",
    "Dark Arts": "Artes oscuras",
    "Dark Pact": "Pacto oscuro",
    "Demonic Embrace": "Abrazo demoníaco",
    "Demonic Knowledge": "Conocimiento demoníaco",
    "Demonic Resilience": "Resiliencia demoníaca",
    "Demonic Tactics": "Tácticas demoníacas",
    "Demonology": "Demonología",
    "Desperate Prayer": "Plegaria desesperada",
    "Deep Wounds": "Heridas profundas",
    "Defense": "Defensa",
    "Defensive Stance": "Postura defensiva",
    "Destruction": "Destrucción",
    "Deterrence": "Disuasión",
    "Devastation": "Devastación",
    "Devoted Soul": "Alma devota",
    "Dire Bear": "Oso temerario",
    "Dirty Tricks": "Trucos sucios",
    "Efficiency": "Eficiencia",
    "Elusiveness": "Evasión",
    "Emberstorm": "Tormenta de ascuas",
    "Endurance": "Aguante",
    "Endurance Training": "Entrenamiento de aguante",
    "Enhancement": "Mejora",
    "Enlightenment": "Iluminación",
    "Enrage": "Enfurecer",
    "Fel Concentration": "Concentración vil",
    "Fel Intellect": "Intelecto vil",
    "Fel Stamina": "Aguante vil",
    "Feline Swiftness": "Celeridad felina",
    "Ferocity": "Ferocidad",
    "Flame Throwing": "Lanzallamas",
    "Flurry": "Frenesí",
    "Focused Will": "Voluntad concentrada",
    "Frenzy": "Frenesí",
    "Furor": "Furor",
    "Hawk Eye": "Ojo de halcón",
    "Heart of the Wild": "Corazón de lo salvaje",
    "Heightened Senses": "Sentidos agudizados",
    "Hemorrhage": "Hemorragia",
    "Ice Shards": "Esquirlas de hielo",
    "Icecraft": "Maestría de hielo",
    "Ignite": "Inflamar",
    "Illumination": "Iluminación",
    "Impact": "Impacto",
    "Improved Strike": "Golpe mejorado",
    "Iron Skin": "Piel de hierro",
    "Impale": "Empalar",
    "Incinerate": "Incinerar",
    "Inner Calling": "Llamado interior",
    "Innervate": "Inervar",
    "Inspiration": "Inspiración",
    "Intimidation": "Intimidación",
    "Killer Instinct": "Instinto asesino",
    "Kindred Spirits": "Almas gemelas",
    "Last Stand": "Última posición",
    "Lethal Blows": "Golpes letales",
    "Lethal Shots": "Disparos letales",
    "Lightning Reflexes": "Reflejos relámpago",
    "Malice": "Malicia",
    "Mana Tide": "Marea de maná",
    "Marksmanship": "Puntería",
    "Master Demonologist": "Maestro demonólogo",
    "Master Summoner": "Maestro invocador",
    "Master of Deception": "Maestro del engaño",
    "Meditation": "Meditación",
    "Mental Agility": "Agilidad mental",
    "Metamorphosis": "Metamorfosis",
    "Monster Slaying": "Matanza de monstruos",
    "Moonfury": "Furia lunar",
    "Moonglow": "Resplandor lunar",
    "Moonkin Form": "Forma de búho lunar",
    "Moonkin Path": "Senda del búho lunar",
    "Murder": "Asesinato a sangre fría",
    "Murderous Intent": "Intención homicida",
    "Naturalist": "Naturalista",
    "Nightfall": "Caída de la noche",
    "Offense": "Ofensiva",
    "Offensive Stance": "Postura ofensiva",
    "Opportunity": "Oportunidad",
    "Pack Leader": "Líder de manada",
    "Pathfinder": "Explorador",
    "Penance": "Penitencia",
    "Permafrost": "Escarcha permanente",
    "Potent Afflictions": "Aflicciones potentes",
    "Precision": "Precisión",
    "Predatory Strikes": "Golpes predatorios",
    "Preparation": "Preparación",
    "Purification": "Purificación",
    "Pursuit of Justice": "Búsqueda de la justicia",
    "Pyromancer": "Piromántico",
    "Rapid Instincts": "Instintos rápidos",
    "Reckoning": "Ajuste de cuentas",
    "Redoubt": "Reducto",
    "Reflection": "Reflexión",
    "Relentless Strikes": "Golpes implacables",
    "Remorseless Attacks": "Ataques despiadados",
    "Restoration": "Restauración",
    "Restoration Gift": "Don de restauración",
    "Reverberation": "Reverberación",
    "Riposte": "Réplica",
    "Sanctuary": "Santuario",
    "Savage Strikes": "Golpes salvajes",
    "Seal Command": "Sello de orden",
    "Seal Fate": "Sellar el destino",
    "Shadowform": "Forma de las Sombras",
    "Shadowstep": "Paso de las Sombras",
    "Sharpened Blades": "Hojas afiladas",
    "Shield Discipline": "Disciplina de escudo",
    "Shield Training": "Entrenamiento de escudo",
    "Shatter": "Resquebrajar",
    "Siphon Life": "Drenar vida",
    "Soul Harvest": "Cosecha de almas",
    "Soul Link": "Vínculo de alma",
    "Storm Path": "Senda de la tormenta",
    "Storm Reach": "Alcance de la tormenta",
    "Stormcaller": "Invocatormentas",
    "Suppression": "Supresión",
    "Surefooted": "Paso firme",
    "Survivalist": "Superviviente",
    "Sweeping Strikes": "Golpes arrasadores",
    "Thick Hide": "Piel gruesa",
    "Thundering Strikes": "Golpes atronadores",
    "Trailblazer": "Abrecaminos",
    "Tree of Life": "Árbol de la Vida",
    "Trueshot": "Disparo certero",
    "Trueshot Training": "Entrenamiento de disparo certero",
    "Twin Disciplines": "Disciplinas gemelas",
    "Unbreakable Will": "Voluntad inquebrantable",
    "Unbridled Wrath": "Ira desenfrenada",
    "Unstable Affliction": "Aflicción inestable",
    "Vampiric Embrace": "Abrazo vampírico",
    "Vitality": "Vitalidad",
    "Vigor": "Vigor",
    "Vile Poisons": "Venenos viles",
    "Vile Precision": "Precisión vil",
    "Warlord's Fury": "Furia del señor de la guerra",
    "Weapon Expertise": "Pericia con armas",
    "Winter Chill": "Frío invernal",
    "Anticipation": "Anticipación",
    "Arcane": "Arcano",
    "Arcane Concentration": "Concentración arcana",
    "Arcane Instability": "Inestabilidad arcana",
    "Arcane Resilience": "Resiliencia arcana",
    "Arcane Thesis": "Tesis arcana",
    "Beacon Discipline": "Disciplina del faro",
    "Berserker": "Berserker",
    "Combat": "Combate",
    "Cleave Mastery": "Maestría de tajada",
    "Combat Path": "Senda de combate",
    "Combat Potency": "Potencia de combate",
    "Combat Style": "Estilo de combate",
    "Discipline": "Disciplina",
    "Divine Intellect": "Intelecto divino",
    "Elemental": "Elemental",
    "Elemental Calling": "Llamada elemental",
    "Elemental Devastation": "Devastación elemental",
    "Elemental Precision": "Precisión elemental",
    "Feral": "Feral",
    "Feral Aggression": "Agresión feral",
    "Feral Instinct": "Instinto feral",
    "Frost": "Escarcha",
    "Frost Warding": "Resguardo de escarcha",
    "Gift of Nature": "Don de la naturaleza",
    "Guardian": "Guardián",
    "Guardian Favor": "Favor del guardián",
    "Guardian's Resolve": "Resolución del guardián",
    "Mortal Precision": "Precisión mortal",
    "Mortal Shots": "Disparos mortales",
    "Nature Blessing": "Bendición de la naturaleza",
    "Nature Grace": "Gracia de la naturaleza",
    "Nature Grasp": "Apretón de la naturaleza",
    "Nature Guidance": "Guía de la naturaleza",
    "Nature Path": "Senda de la naturaleza",
    "Nature Reach": "Alcance de la naturaleza",
    "Nature Swiftness": "Celeridad de la naturaleza",
    "Protection": "Protección",
    "Ruin": "Ruina",
    "Sanctity Aura": "Aura de santidad",
    "Silence": "Silencio",
    "Trueshot Aura": "Aura de Disparo Certero",
    "Vengeance": "Venganza",
    "Aimed Focus": "Concentración de Disparo Apuntado",
    "Ancestral Healing": "Sanación ancestral",
    "Arcane Focus": "Foco arcano",
    "Arcane Mind": "Mente arcana",
    "Arcane Power": "Poder arcano",
    "Arms": "Armas",
    "Balance": "Equilibrio",
    "Beast Mastery": "Maestría de bestias",
    "Bladed Armor": "Armadura con cuchillas",
    "Cruelty": "Crueldad",
    "Darkness": "Oscuridad",
    "Deep Wounds": "Heridas profundas",
    "Deflection": "Desvío",
    "Discipline Focus": "Concentración de disciplina",
    "Divine Favor": "Favor divino",
    "Divine Fury": "Furia divina",
    "Divine Strength": "Fuerza divina",
    "Elemental Focus": "Concentración elemental",
    "Elemental Fury": "Furia elemental",
    "Elemental Mastery": "Maestría elemental",
    "Fel Armor": "Armadura vil",
    "Fire": "Fuego",
    "Flash Focus": "Concentración de Destello",
    "Focused Fire": "Fuego concentrado",
    "Fury": "Furia",
    "Healing Focus": "Concentración de sanación",
    "Healing Grace": "Gracia sanadora",
    "Healing Light": "Luz sanadora",
    "Healing Prayers": "Plegarias sanadoras",
    "Holy": "Sagrado",
    "Holy Calling": "Llamado sagrado",
    "Holy Grace": "Gracia sagrada",
    "Holy Reach": "Alcance sagrado",
    "Holy Shield": "Escudo sagrado",
    "Holy Shielding": "Protección sagrada",
    "Holy Word": "Palabra sagrada",
    "Improved Ambush": "Emboscada mejorada",
    "Improved Arcane Missiles": "Misiles Arcanos mejorados",
    "Improved Arcane Shot": "Disparo Arcano mejorado",
    "Improved Aspect of the Hawk": "Aspecto del halcón mejorado",
    "Improved Bloodthirst": "Sed de sangre mejorada",
    "Improved Cleave": "Rajar mejorado",
    "Improved Corruption": "Corrupción mejorada",
    "Improved Curse of Agony": "Maldición de agonía mejorada",
    "Improved Demon Skin": "Piel de demonio mejorada",
    "Improved Devotion Aura": "Aura de devoción mejorada",
    "Improved Eviscerate": "Eviscerar mejorado",
    "Improved Fire Blast": "Explosión de Fuego mejorada",
    "Improved Fireball": "Bola de Fuego mejorada",
    "Improved Fortitude": "Fortaleza mejorada",
    "Improved Frost Nova": "Nova de Escarcha mejorada",
    "Improved Frostbolt": "Descarga de Escarcha mejorada",
    "Improved Ghost Wolf": "Lobo fantasmal mejorado",
    "Improved Gouge": "Gubia mejorada",
    "Improved Healing Wave": "Ola de sanación mejorada",
    "Improved Heroic Strike": "Golpe heroico mejorado",
    "Improved Holy Light": "Luz Sagrada mejorada",
    "Improved Judgement": "Sentencia mejorada",
    "Improved Lay on Hands": "Imposición de manos mejorada",
    "Improved Life Tap": "Transfusión de vida mejorada",
    "Improved Lightning Shield": "Escudo de relámpagos mejorado",
    "Improved Mark of the Wild": "Marca de lo Salvaje mejorada",
    "Improved Mend Pet": "Reparar mascota mejorado",
    "Improved Mind Flay": "Tortura mental mejorada",
    "Improved Moonfire": "Fuego lunar mejorado",
    "Improved Mortal Strike": "Golpe mortal mejorado",
    "Improved Overpower": "Abrumar mejorado",
    "Improved Polymorph": "Polimorfia mejorada",
    "Improved Power Word: Shield": "Palabra de poder: Escudo mejorada",
    "Improved Regrowth": "Recrecimiento mejorado",
    "Improved Rejuvenation": "Rejuvenecimiento mejorado",
    "Improved Renew": "Renovar mejorado",
    "Improved Righteous Fury": "Furia recta mejorada",
    "Improved Rockbiter": "Mordemontañas mejorado",
    "Improved Searing Pain": "Dolor abrasador mejorado",
    "Improved Shadow Word: Pain": "Palabra de las Sombras: Dolor mejorada",
    "Improved Shield Slam": "Embate con escudo mejorado",
    "Improved Sinister Strike": "Golpe siniestro mejorado",
    "Improved Slam": "Embate mejorado",
    "Improved Sprint": "Esprint mejorado",
    "Improved Sunder Armor": "Hender armadura mejorado",
    "Improved Taunt": "Provocar mejorado",
    "Improved Thunder Clap": "Atronar mejorado",
    "Improved Wing Clip": "Cortar alas mejorado",
    "Improved Wrath": "Cólera mejorada",
    "Inner Focus": "Concentración interior",
    "Judgement of Light": "Sentencia de Luz",
    "Light Mastery": "Dominio de la Luz",
    "Lightning Mastery": "Maestría del rayo",
    "Living Spirit": "Espíritu viviente",
    "Marksman Mastery": "Dominio de tirador",
    "Netherwind Focus": "Concentración de Vendaval Abisal",
    "Poleaxe Specialization": "Especialización en alabardas",
    "Power Infusion": "Infusión de poder",
    "Presence of Mind": "Presencia mental",
    "Retribution": "Reprensión",
    "Sanctified Light": "Luz santificada",
    "Savagery": "Ferocidad",
    "School Focus": "Concentración de escuela",
    "Second Wind": "Segundo aliento",
    "Shadow": "Sombra",
    "Shadow Affinity": "Afinidad con las Sombras",
    "Shadow Arts": "Artes de las Sombras",
    "Shadow Focus": "Concentración de las Sombras",
    "Shadow Mastery": "Maestría de las Sombras",
    "Shield Mastery": "Dominio de escudo",
    "Shield Specialization": "Especialización en escudo",
    "Spirit Tap": "Extracción de espíritu",
    "Spirit Weapons": "Armas espirituales",
    "Spiritual Focus": "Concentración espiritual",
    "Spiritual Guidance": "Guía espiritual",
    "Spiritual Healing": "Sanación espiritual",
    "Starfire Mastery": "Dominio de Fuego Estelar",
    "Subtlety": "Sutileza",
    "Survival": "Supervivencia",
    "Survival Instincts": "Instintos de supervivencia",
    "Survival Tactics": "Tácticas de supervivencia",
    "Tactical Mastery": "Maestría táctica",
    "Tidal Focus": "Concentración de mareas",
    "Toughness": "Dureza",
    "Unleashed Fury": "Furia desatada",
    "Wand Specialization": "Especialización en varitas",
    "Weapon Expertise": "Pericia con armas",
    "Weapon Mastery": "Dominio de armas",
  },
};


function talentClassData(): ClassTalents[] {
  return Object.values(TALENTS).filter((ct): ct is ClassTalents => ct !== undefined);
}

function formatNumber(value: number, lang: SupportedLanguage): string {
  return new Intl.NumberFormat(languageTag(lang), { maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number, lang: SupportedLanguage): string {
  return `${formatNumber(Math.abs(value) * 100, lang)}%`;
}

function statAmount(stat: StatKey, value: number, lang: SupportedLanguage): string {
  return stat === 'crit' || stat === 'dodge' || stat.endsWith('Pct')
    ? formatPercent(value, lang)
    : formatNumber(Math.abs(value), lang);
}

function translateTitle(source: string, lang: SupportedLanguage): string {
  if (lang === 'en') return source;
  const abilityId = abilityIdByName.get(source);
  if (abilityId) return tEntity({ kind: 'ability', id: abilityId, field: 'name' });
  const override = titleOverrides[lang]?.[source];
  if (override !== undefined) return override;
  // Every shipped talent name has an explicit override (enforced by tests) or is an
  // ability name (resolved above). A bare return here only triggers for a newly-added
  // talent that still needs a localized override — clean English is preferable to a
  // broken word-by-word guess, and the leak-guard test flags it for translation.
  return source;
}

function abilityName(id: string): string {
  return tEntity({ kind: 'ability', id, field: 'name' });
}

// True when a talent title has an explicit per-locale translation override. The
// coverage test uses this to tell a deliberately-kept cognate (e.g. French
// "Riposte", Spanish "Vigor") apart from a name that leaks English by accident
// because the word-substitution dictionary does not cover its vocabulary.
export function hasTalentTitleOverride(lang: SupportedLanguage, source: string): boolean {
  return titleOverrides[lang]?.[source] !== undefined;
}

// Public wrapper: localize a content title given its English source name. Resolves an
// ability name (via the entity dictionary) or a talent-title override, else returns the
// source unchanged. Used by the HUD to localize aura/buff names that are granted by a
// talent or ability but surface in the buff frame / combat log by their raw English name.
export function localizeTalentTitle(source: string, lang: SupportedLanguage = getLanguage()): string {
  return translateTitle(source, lang);
}

function effectDescription(effect: TalentEffect | undefined, maxRank: number, lang: SupportedLanguage): string {
  if (!effect) return localeText[lang].noEffect;
  const text = localeText[lang];
  const perRank = maxRank > 1 ? text.perRank : '';
  const parts: string[] = [];

  if (effect.grant) parts.push(text.grant(abilityName(effect.grant.ability)));

  const stats = effect.stats ?? {};
  for (const [key, value] of Object.entries(stats) as [StatKey, number][]) {
    if (value === undefined || value === 0) continue;
    const label = text.statLabels[key];
    parts.push(text.increase(label, statAmount(key, value, lang), perRank));
  }

  const global = effect.global ?? {};
  for (const [key, value] of Object.entries(global) as [GlobalKey, number][]) {
    if (value === undefined || value === 0) continue;
    parts.push(text.increase(text.statLabels[key], formatPercent(value, lang), perRank));
  }

  for (const mod of effect.ability ?? []) {
    const name = abilityName(mod.ability);
    if (mod.dmgPct) parts.push(text.increase(`${name} ${text.statLabels.damage}`, formatPercent(mod.dmgPct, lang), perRank));
    if (mod.flatDmg) parts.push(text.increase(`${name} ${text.statLabels.damage}`, formatNumber(Math.abs(mod.flatDmg), lang), perRank));
    if (mod.costPct) parts.push((mod.costPct < 0 ? text.reduce : text.increase)(`${name} ${text.statLabels.cost}`, formatPercent(mod.costPct, lang), perRank));
    if (mod.cooldownPct) parts.push((mod.cooldownPct < 0 ? text.reduce : text.increase)(`${name} ${text.statLabels.cooldown}`, formatPercent(mod.cooldownPct, lang), perRank));
    if (mod.castPct) parts.push((mod.castPct < 0 ? text.reduce : text.increase)(`${name} ${text.statLabels.castTime}`, formatPercent(mod.castPct, lang), perRank));
  }

  return parts.length > 0 ? parts.join(' ') : text.noEffect;
}

function className(id: PlayerClass): string {
  return tEntity({ kind: 'class', id, field: 'name' });
}

export function tTalent(request: TalentTranslationRequest): string {
  const lang = getLanguage();
  if (lang === 'en') {
    if (request.kind === 'talentMastery') {
      return request.field === 'name' ? request.spec.mastery.name : request.spec.mastery.description;
    }
    if (request.kind === 'talentSpec') return request.spec[request.field];
    if (request.kind === 'talentChoice') return request.choice[request.field];
    return request.node[request.field];
  }

  if (request.kind === 'talentMastery') {
    return request.field === 'name'
      ? translateTitle(request.spec.mastery.name, lang)
      : effectDescription(request.spec.mastery.effect, 1, lang);
  }
  if (request.kind === 'talentSpec') {
    return request.field === 'name'
      ? translateTitle(request.spec.name, lang)
      : localeText[lang].specDescription(className(request.spec.class), localeText[lang].roleLabels[request.spec.role], abilityName(request.spec.signature));
  }
  if (request.kind === 'talentChoice') {
    return request.field === 'name'
      ? translateTitle(request.choice.name, lang)
      : effectDescription(request.choice.effect, 1, lang);
  }
  if (request.field === 'name') return translateTitle(request.node.name, lang);
  if (request.node.kind === 'choice') return localeText[lang].chooseOne(translateTitle(request.node.name, lang));
  return effectDescription(request.node.effect, request.node.maxRank, lang);
}

export function talentTranslationManifest(): TalentTranslationManifestEntry[] {
  const entries: TalentTranslationManifestEntry[] = [];
  for (const ct of talentClassData()) {
    for (const spec of ct.specs) {
      entries.push({ kind: 'talentSpec', id: spec.id, classId: spec.class, field: 'name', source: spec.name });
      entries.push({ kind: 'talentSpec', id: spec.id, classId: spec.class, field: 'description', source: spec.description });
      entries.push({ kind: 'talentMastery', id: `${spec.id}.mastery`, classId: spec.class, specId: spec.id, field: 'name', source: spec.mastery.name });
      entries.push({ kind: 'talentMastery', id: `${spec.id}.mastery`, classId: spec.class, specId: spec.id, field: 'description', source: spec.mastery.description });
    }
    for (const node of ct.nodes) {
      entries.push({ kind: 'talentNode', id: node.id, classId: ct.class, specId: node.specId, field: 'name', source: node.name });
      entries.push({ kind: 'talentNode', id: node.id, classId: ct.class, specId: node.specId, field: 'description', source: node.description });
      for (const choice of node.choices ?? []) {
        entries.push({ kind: 'talentChoice', id: `${node.id}.${choice.id}`, classId: ct.class, specId: node.specId, field: 'name', source: choice.name });
        entries.push({ kind: 'talentChoice', id: `${node.id}.${choice.id}`, classId: ct.class, specId: node.specId, field: 'description', source: choice.description });
      }
    }
  }
  return entries;
}

export function renderTalentManifestEntry(entry: TalentTranslationManifestEntry): string {
  const ct = TALENTS[entry.classId];
  if (!ct) return entry.source;
  if (entry.kind === 'talentSpec' || entry.kind === 'talentMastery') {
    const spec = ct.specs.find((candidate) => candidate.id === (entry.kind === 'talentSpec' ? entry.id : entry.specId));
    if (!spec) return entry.source;
    return tTalent({ kind: entry.kind, spec, field: entry.field });
  }
  const [nodeId, choiceId] = entry.id.split('.');
  const node = ct.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) return entry.source;
  if (entry.kind === 'talentChoice') {
    const choice = node.choices?.find((candidate) => candidate.id === choiceId);
    if (!choice) return entry.source;
    return tTalent({ kind: 'talentChoice', choice, field: entry.field });
  }
  return tTalent({ kind: 'talentNode', node, field: entry.field });
}
