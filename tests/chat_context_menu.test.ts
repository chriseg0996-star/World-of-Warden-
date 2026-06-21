import { afterEach, describe, expect, it } from 'vitest';
import { chatPlayerContextActions } from '../src/ui/player_context_menu';
import { setLanguage } from '../src/ui/i18n';

describe('chat player context menu', () => {
  afterEach(() => setLanguage('en'));

  it('offers social and report actions from chat names without live-only actions', () => {
    const actions = chatPlayerContextActions({
      playerName: 'Badmage',
      selfName: 'Adventurer',
      online: true,
      isFriend: false,
      ignored: false,
      canGuildInvite: true,
      alreadyGuilded: false,
      canReport: true,
    });

    expect(actions.map((a) => a.id)).toEqual([
      'whisper',
      'invite',
      'friend',
      'ginvite',
      'ignore',
      'report',
      'close',
    ]);
    expect(actions.map((a) => a.id)).not.toContain('trade');
    expect(actions.map((a) => a.id)).not.toContain('duel');
  });

  it('does not allow reporting yourself from chat', () => {
    const actions = chatPlayerContextActions({
      playerName: 'Adventurer',
      selfName: 'Adventurer',
      online: true,
      isFriend: false,
      ignored: false,
      canGuildInvite: false,
      alreadyGuilded: false,
      canReport: true,
    });

    expect(actions.map((a) => a.id)).not.toContain('report');
  });

  it('localizes chat context action labels', () => {
    const opts = {
      playerName: 'Badmage',
      selfName: 'Adventurer',
      online: true,
      isFriend: false,
      ignored: false,
      canGuildInvite: false,
      alreadyGuilded: false,
      canReport: true,
    };

    setLanguage('en');
    const enActions = chatPlayerContextActions(opts);
    const enWhisper = enActions.find((a) => a.id === 'whisper')?.label;
    const enReport = enActions.find((a) => a.id === 'report')?.label;

    setLanguage('es');
    const esActions = chatPlayerContextActions(opts);
    const esWhisper = esActions.find((a) => a.id === 'whisper')?.label;
    const esReport = esActions.find((a) => a.id === 'report')?.label;

    // Labels resolve to real localized strings, and Spanish differs from English.
    expect(esWhisper && esWhisper.trim().length).toBeTruthy();
    expect(esReport && esReport.trim().length).toBeTruthy();
    expect(esWhisper).not.toBe(enWhisper);
    expect(esReport).not.toBe(enReport);
    setLanguage('en');
  });
});
