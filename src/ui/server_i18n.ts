// AUTO-ASSEMBLED localization for server-sent system/chat/error messages.
// The authoritative server emits friends/guild/world-join-leave/who/moderation
// messages as plain English text inside log/error events. The client cannot
// localize those at the source, so here we match the server's exact English
// (exact strings + regex for the dynamic ones) and re-render it through a
// per-locale dictionary. hud.ts calls localizeServerText() as a fallback inside
// localizeSystemText/localizeErrorText; main.ts uses tServer() for the
// moderation/throttle disconnect reasons. Player names, guild names and realm
// names are spliced through verbatim (not translatable); ranks, leave reasons,
// /who class + zone + status are themselves localized.
import { ZONES, DUNGEONS, CLASSES } from '../sim/data';
import type { PlayerClass } from '../sim/types';
import { getLanguage, type InterpolationValues, type SupportedLanguage } from './i18n';
import { tEntity } from './entity_i18n';

export const DICT: Record<string, Record<string, string>> = {"en":{"friends.specifyName":"Specify a character name.","friends.noCharExists":"No character named '{name}' exists.","friends.cannotBefriendSelf":"You cannot befriend yourself.","friends.ignoringRemoveFirst":"You are ignoring {name}. Remove them from your ignore list first.","friends.alreadyFriend":"{name} is already your friend.","friends.listFull":"Your friends list is full.","friends.notOnFriends":"No character named '{name}' on your friends list.","friends.notYourFriend":"{name} is not on your friends list.","friends.cannotIgnoreSelf":"You cannot ignore yourself.","friends.alreadyIgnored":"{name} is already ignored.","friends.ignoreListFull":"Your ignore list is full.","friends.notOnIgnore":"No character named '{name}' on your ignore list.","friends.notIgnored":"{name} is not on your ignore list.","friends.added":"{name} added to friends.","friends.removed":"{name} removed from friends.","friends.nowIgnored":"{name} is now ignored.","friends.noLongerIgnored":"{name} is no longer ignored.","guild.nameRules":"Guild names are 3-24 letters (spaces allowed).","guild.exists":"A guild named '{name}' already exists.","guild.alreadyInOne":"You are already in a guild.","guild.notInOne":"You are not in a guild.","guild.onlyOfficersInvite":"Only officers and the Guild Master may invite.","guild.alreadyInThis":"You are already in the guild.","guild.mustBeOnline":"{name} must be online to be invited.","guild.targetAlreadyInGuild":"{name} is already in a guild.","guild.pendingInvite":"{name} already has a pending guild invitation.","guild.full":"Your guild is full.","guild.inviteExpired":"The guild invitation has expired.","guild.gone":"That guild no longer exists.","guild.thatFull":"That guild is full.","guild.gmPromoteFirst":"As Guild Master you must promote a new leader or disband the guild before leaving.","guild.onlyGmPromote":"Only the Guild Master may promote a new leader.","guild.noMember":"No such guild member '{name}'.","guild.notInYours":"{name} is not in your guild.","guild.onlyGmDisband":"Only the Guild Master may disband the guild.","guild.onlyOfficersRemove":"Only officers and the Guild Master may remove members.","guild.noCharNamed":"No character named '{name}'.","guild.useLeave":"Use Leave Guild to remove yourself.","guild.cannotRemoveGm":"You cannot remove the Guild Master.","guild.onlyGmRemoveOfficer":"Only the Guild Master may remove an officer.","guild.onlyGmChangeRanks":"Only the Guild Master may change ranks.","guild.useTransfer":"Use a guild transfer to hand over leadership.","guild.alreadyRank":"{name} is already {rank}.","guild.onlyOfficersChat":"Only officers and the Guild Master can use officer chat.","guild.onlyOfficersMotd":"Only officers and the Guild Master may set the message of the day.","guild.motdSet":"{name} sets the guild message of the day: {motd}","guild.motdCleared":"{name} clears the guild message of the day.","guild.founded":"You found the guild <{name}>! You are its Guild Master.","guild.invited":"You have invited {name} to the guild.","guild.leftDisbanded":"You have left <{name}>. The guild has disbanded.","guild.left":"You have left <{name}>.","guild.disbanded":"<{name}> has been disbanded.","guild.removedFrom":"You have been removed from <{name}>.","guild.joined":"{name} has joined the guild.","guild.memberLeft":"{name} has left the guild.","guild.newMaster":"{name} is now the Guild Master of <{guild}>.","guild.removedBy":"{name} has been removed from the guild by {actor}.","guild.nowRank":"{name} is now {rank}.","guild.rankLeader":"the Guild Master","guild.rankOfficer":"an Officer","guild.rankMember":"a Member","world.entered":"{name} has entered Wardenfall.","world.left":"{name} has left the world. ({reason})","world.leaveLogout":"logged out","world.leaveDisconnect":"disconnected","world.leaveTimeout":"timed out","world.leaveError":"connection error","world.leaveModeration":"moderation action","who.header":"Who: {count} players online on {realm}.","who.headerOne":"Who: 1 player online on {realm}.","who.row":"{name} - level {level} {className} - {zone}{status}","who.more":"...and {count} more.","who.statusAfk":"AFK","who.statusOnline":"online","moderation.suspended":"This account is suspended.","moderation.forceRename":"A moderator requires one of your characters to be renamed.","moderation.tooManyFailed":"Too many failed attempts. Wait a few minutes and try again.","friends.ignoreLoading":"Your ignore list is still loading. Try /who again in a moment.","who.statusCombat":"combat","who.statusDead":"dead","who.statusDungeon":"dungeon","who.zoneUnknown":"Unknown"},"es":{"friends.specifyName":"Especifica el nombre de un personaje.","friends.noCharExists":"No existe ningún personaje llamado '{name}'.","friends.cannotBefriendSelf":"No puedes agregarte a ti mismo como amigo.","friends.ignoringRemoveFirst":"Estás ignorando a {name}. Quítalo primero de tu lista de ignorados.","friends.alreadyFriend":"{name} ya es tu amigo.","friends.listFull":"Tu lista de amigos está llena.","friends.notOnFriends":"No hay ningún personaje llamado '{name}' en tu lista de amigos.","friends.notYourFriend":"{name} no está en tu lista de amigos.","friends.cannotIgnoreSelf":"No puedes ignorarte a ti mismo.","friends.alreadyIgnored":"{name} ya está ignorado.","friends.ignoreListFull":"Tu lista de ignorados está llena.","friends.notOnIgnore":"No hay ningún personaje llamado '{name}' en tu lista de ignorados.","friends.notIgnored":"{name} no está en tu lista de ignorados.","friends.added":"{name} añadido a amigos.","friends.removed":"{name} eliminado de amigos.","friends.nowIgnored":"{name} ahora está ignorado.","friends.noLongerIgnored":"{name} ya no está ignorado.","guild.nameRules":"Los nombres de hermandad tienen entre 3 y 24 letras (se permiten espacios).","guild.exists":"Ya existe una hermandad llamada '{name}'.","guild.alreadyInOne":"Ya perteneces a una hermandad.","guild.notInOne":"No perteneces a ninguna hermandad.","guild.onlyOfficersInvite":"Solo los oficiales y el Maestro de hermandad pueden invitar.","guild.alreadyInThis":"Ya perteneces a la hermandad.","guild.mustBeOnline":"{name} debe estar conectado para ser invitado.","guild.targetAlreadyInGuild":"{name} ya pertenece a una hermandad.","guild.pendingInvite":"{name} ya tiene una invitación de hermandad pendiente.","guild.full":"Tu hermandad está llena.","guild.inviteExpired":"La invitación de hermandad ha expirado.","guild.gone":"Esa hermandad ya no existe.","guild.thatFull":"Esa hermandad está llena.","guild.gmPromoteFirst":"Como Maestro de hermandad, debes promover a un nuevo líder o disolver la hermandad antes de abandonarla.","guild.onlyGmPromote":"Solo el Maestro de hermandad puede promover a un nuevo líder.","guild.noMember":"No existe ningún miembro de hermandad llamado '{name}'.","guild.notInYours":"{name} no está en tu hermandad.","guild.onlyGmDisband":"Solo el Maestro de hermandad puede disolver la hermandad.","guild.onlyOfficersRemove":"Solo los oficiales y el Maestro de hermandad pueden expulsar miembros.","guild.noCharNamed":"No existe ningún personaje llamado '{name}'.","guild.useLeave":"Usa Abandonar hermandad para retirarte.","guild.cannotRemoveGm":"No puedes expulsar al Maestro de hermandad.","guild.onlyGmRemoveOfficer":"Solo el Maestro de hermandad puede expulsar a un oficial.","guild.onlyGmChangeRanks":"Solo el Maestro de hermandad puede cambiar los rangos.","guild.useTransfer":"Usa una transferencia de hermandad para ceder el liderazgo.","guild.alreadyRank":"{name} ya es {rank}.","guild.onlyOfficersChat":"Solo los oficiales y el Maestro de hermandad pueden usar el chat de oficiales.","guild.onlyOfficersMotd":"Solo los oficiales y el Maestro de hermandad pueden establecer el mensaje del día.","guild.motdSet":"{name} establece el mensaje del día de la hermandad: {motd}","guild.motdCleared":"{name} borra el mensaje del día de la hermandad.","guild.founded":"¡Has fundado la hermandad <{name}>! Eres su Maestro de hermandad.","guild.invited":"Has invitado a {name} a la hermandad.","guild.leftDisbanded":"Has abandonado <{name}>. La hermandad se ha disuelto.","guild.left":"Has abandonado <{name}>.","guild.disbanded":"<{name}> ha sido disuelta.","guild.removedFrom":"Has sido expulsado de <{name}>.","guild.joined":"{name} se ha unido a la hermandad.","guild.memberLeft":"{name} ha abandonado la hermandad.","guild.newMaster":"{name} ahora es el Maestro de hermandad de <{guild}>.","guild.removedBy":"{name} ha sido expulsado de la hermandad por {actor}.","guild.nowRank":"{name} ahora es {rank}.","guild.rankLeader":"el Maestro de hermandad","guild.rankOfficer":"un Oficial","guild.rankMember":"un Miembro","world.entered":"{name} ha entrado en Wardenfall.","world.left":"{name} ha abandonado el mundo. ({reason})","world.leaveLogout":"cerró sesión","world.leaveDisconnect":"se desconectó","world.leaveTimeout":"se agotó el tiempo de espera","world.leaveError":"error de conexión","world.leaveModeration":"acción de moderación","who.header":"Quién: {count} jugadores conectados en {realm}.","who.headerOne":"Quién: 1 jugador conectado en {realm}.","who.row":"{name} - nivel {level} {className} - {zone}{status}","who.more":"...y {count} más.","who.statusAfk":"AFK","who.statusOnline":"conectado","moderation.suspended":"Esta cuenta está suspendida.","moderation.forceRename":"Un moderador requiere que se renombre a uno de tus personajes.","moderation.tooManyFailed":"Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.","friends.ignoreLoading":"Tu lista de ignorados aún se está cargando. Vuelve a usar /who en un momento.","who.statusCombat":"en combate","who.statusDead":"muerto","who.statusDungeon":"en mazmorra","who.zoneUnknown":"Desconocida"}};

function interpolate(template: string, params?: InterpolationValues): string {
  if (!params) return template;
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (m, name: string) => {
    const v = params[name];
    return v === undefined ? m : String(v);
  });
}

export function tServer(key: string, params?: InterpolationValues, lang: SupportedLanguage = getLanguage()): string {
  const table = DICT[lang] ?? DICT.en;
  const tmpl = table[key] ?? DICT.en[key] ?? key;
  return interpolate(tmpl, params);
}

// English-content sub-values the server interpolates, mapped back to dictionary keys.
const RANK_KEY: Record<string, string> = { 'Guild Master': 'guild.rankLeader', 'Officer': 'guild.rankOfficer', 'Member': 'guild.rankMember' };
const LEAVE_REASON_KEY: Record<string, string> = {
  'disconnected': 'world.leaveDisconnect', 'connection error': 'world.leaveError',
  'moderation action': 'world.leaveModeration', 'logged out': 'world.leaveLogout', 'timed out': 'world.leaveTimeout',
};
function localizeRank(r: string): string { const k = RANK_KEY[r]; return k ? tServer(k) : r; }
function localizeReason(r: string): string { const k = LEAVE_REASON_KEY[r]; return k ? tServer(k) : r; }

// Reverse maps for the English zone/dungeon name the /who roster carries.
const zoneNameToId = new Map<string, string>();
for (const z of ZONES) zoneNameToId.set(z.name, z.id);
const dungeonNameToId = new Map<string, string>();
for (const [id, d] of Object.entries(DUNGEONS)) dungeonNameToId.set(d.name, id);
export function localizeZone(name: string): string {
  if (name === 'Unknown') return tServer('who.zoneUnknown');
  const zid = zoneNameToId.get(name);
  if (zid) return tEntity({ kind: 'zone', id: zid, field: 'name' });
  const did = dungeonNameToId.get(name);
  if (did) return tEntity({ kind: 'dungeon', id: did, field: 'name' });
  return name;
}
// Only localize real class ids; guard so the catch-all who.row rule cannot feed
// a non-class word into tEntity (which would surface a raw fallback label).
function localizeClass(cls: string): string {
  return cls in CLASSES ? tEntity({ kind: 'class', id: cls as PlayerClass, field: 'name' }) : cls;
}
function localizeStatus(s: string): string {
  const k = s.toLowerCase();
  if (k === 'afk') return tServer('who.statusAfk');
  if (k === 'combat') return tServer('who.statusCombat');
  if (k === 'dead') return tServer('who.statusDead');
  if (k === 'dungeon') return tServer('who.statusDungeon');
  return s;
}

// Exact (no-placeholder) messages: server English -> dictionary key. who.* values
// are either placeholdered or sub-fragments spliced into who.row, never standalone.
const FRAGMENT = /^(guild\.rank|world\.leave|who\.)/;
const EXACT: Record<string, string> = {};
for (const key of Object.keys(DICT.en)) {
  const v = DICT.en[key];
  if (FRAGMENT.test(key)) continue;
  if (v.includes('{') || v.includes('<')) continue;
  if (EXACT[v] !== undefined) throw new Error(`server_i18n: duplicate exact English message "${v}" (keys ${EXACT[v]} and ${key})`);
  EXACT[v] = key;
}

type Rule = { re: RegExp; build: (m: RegExpExecArray) => string };
const RULES: Rule[] = [
  { re: /^You found the guild <([^>]+)>! You are its Guild Master\.$/, build: (m) => tServer('guild.founded', { name: m[1] }) },
  { re: /^You have left <([^>]+)>\. The guild has disbanded\.$/, build: (m) => tServer('guild.leftDisbanded', { name: m[1] }) },
  { re: /^You have left <([^>]+)>\.$/, build: (m) => tServer('guild.left', { name: m[1] }) },
  { re: /^<([^>]+)> has been disbanded\.$/, build: (m) => tServer('guild.disbanded', { name: m[1] }) },
  { re: /^You have been removed from <([^>]+)>\.$/, build: (m) => tServer('guild.removedFrom', { name: m[1] }) },
  { re: /^(.+) is now the Guild Master of <([^>]+)>\.$/, build: (m) => tServer('guild.newMaster', { name: m[1], guild: m[2] }) },
  { re: /^(.+) has been removed from the guild by (.+)\.$/, build: (m) => tServer('guild.removedBy', { name: m[1], actor: m[2] }) },
  { re: /^You have invited (.+) to the guild\.$/, build: (m) => tServer('guild.invited', { name: m[1] }) },
  { re: /^(.+) sets the guild message of the day: ([\s\S]+)$/, build: (m) => tServer('guild.motdSet', { name: m[1], motd: m[2] }) },
  { re: /^(.+) clears the guild message of the day\.$/, build: (m) => tServer('guild.motdCleared', { name: m[1] }) },
  { re: /^(.+) has joined the guild\.$/, build: (m) => tServer('guild.joined', { name: m[1] }) },
  { re: /^(.+) has left the guild\.$/, build: (m) => tServer('guild.memberLeft', { name: m[1] }) },
  { re: /^A guild named '(.+)' already exists\.$/, build: (m) => tServer('guild.exists', { name: m[1] }) },
  { re: /^No such guild member '(.+)'\.$/, build: (m) => tServer('guild.noMember', { name: m[1] }) },
  { re: /^(.+) must be online to be invited\.$/, build: (m) => tServer('guild.mustBeOnline', { name: m[1] }) },
  { re: /^(.+) is already in a guild\.$/, build: (m) => tServer('guild.targetAlreadyInGuild', { name: m[1] }) },
  { re: /^(.+) already has a pending guild invitation\.$/, build: (m) => tServer('guild.pendingInvite', { name: m[1] }) },
  { re: /^(.+) is not in your guild\.$/, build: (m) => tServer('guild.notInYours', { name: m[1] }) },
  { re: /^(.+) is already (Guild Master|Officer|Member)\.$/, build: (m) => tServer('guild.alreadyRank', { name: m[1], rank: localizeRank(m[2]) }) },
  { re: /^(.+) is now (Guild Master|Officer|Member)\.$/, build: (m) => tServer('guild.nowRank', { name: m[1], rank: localizeRank(m[2]) }) },
  { re: /^No character named '(.+)' exists\.$/, build: (m) => tServer('friends.noCharExists', { name: m[1] }) },
  { re: /^No character named '(.+)' on your friends list\.$/, build: (m) => tServer('friends.notOnFriends', { name: m[1] }) },
  { re: /^No character named '(.+)' on your ignore list\.$/, build: (m) => tServer('friends.notOnIgnore', { name: m[1] }) },
  { re: /^No character named '(.+)'\.$/, build: (m) => tServer('guild.noCharNamed', { name: m[1] }) },
  { re: /^You are ignoring (.+)\. Remove them from your ignore list first\.$/, build: (m) => tServer('friends.ignoringRemoveFirst', { name: m[1] }) },
  { re: /^(.+) is already your friend\.$/, build: (m) => tServer('friends.alreadyFriend', { name: m[1] }) },
  { re: /^(.+) is not on your friends list\.$/, build: (m) => tServer('friends.notYourFriend', { name: m[1] }) },
  { re: /^(.+) is already ignored\.$/, build: (m) => tServer('friends.alreadyIgnored', { name: m[1] }) },
  { re: /^(.+) is not on your ignore list\.$/, build: (m) => tServer('friends.notIgnored', { name: m[1] }) },
  { re: /^(.+) added to friends\.$/, build: (m) => tServer('friends.added', { name: m[1] }) },
  { re: /^(.+) removed from friends\.$/, build: (m) => tServer('friends.removed', { name: m[1] }) },
  { re: /^(.+) is now ignored\.$/, build: (m) => tServer('friends.nowIgnored', { name: m[1] }) },
  { re: /^(.+) is no longer ignored\.$/, build: (m) => tServer('friends.noLongerIgnored', { name: m[1] }) },
  { re: /^(.+) has entered Wardenfall\.$/, build: (m) => tServer('world.entered', { name: m[1] }) },
  { re: /^(.+) has left the world\. \((.+)\)$/, build: (m) => tServer('world.left', { name: m[1], reason: localizeReason(m[2]) }) },
  { re: /^Who: (\d+) (?:player|players) online on (.+)\.$/, build: (m) => tServer(m[1] === '1' ? 'who.headerOne' : 'who.header', { count: m[1], realm: m[2] }) },
  { re: /^\.\.\.and (\d+) more\.$/, build: (m) => tServer('who.more', { count: m[1] }) },
  { re: /^(.+) - level (\d+) (\w+) - (.+?)(?: \(([^)]+)\))?$/, build: (m) => tServer('who.row', { name: m[1], level: m[2], className: localizeClass(m[3]), zone: localizeZone(m[4]), status: m[5] ? ` (${localizeStatus(m[5])})` : '' }) },
];

// Returns the localized form of a server message, or null if it is not one of ours.
export function localizeServerText(text: string): string | null {
  const exactKey = EXACT[text];
  if (exactKey) return tServer(exactKey);
  for (const rule of RULES) {
    const m = rule.re.exec(text);
    if (m) return rule.build(m);
  }
  return null;
}
