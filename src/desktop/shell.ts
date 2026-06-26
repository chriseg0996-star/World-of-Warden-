/** Desktop shell (Tauri) helpers — keeps API/WebSocket URLs working outside a browser tab. */

declare const __DESKTOP_SHELL__: boolean | undefined;
declare const __DESKTOP_REALM_ORIGIN__: string | undefined;

const DEFAULT_REALM_ORIGIN = 'http://127.0.0.1:8787';

export function isDesktopShell(): boolean {
  return typeof __DESKTOP_SHELL__ !== 'undefined' && __DESKTOP_SHELL__ === true;
}

/** Default game-server origin when the bundled client has no page host (Tauri). */
export function defaultRealmOrigin(): string {
  const configured = typeof __DESKTOP_REALM_ORIGIN__ === 'string' ? __DESKTOP_REALM_ORIGIN__.trim() : '';
  if (configured) return configured.replace(/\/$/, '');
  return DEFAULT_REALM_ORIGIN;
}

/** REST/API origin: explicit realm base, else desktop default, else same-origin web. */
export function resolveApiOrigin(explicitBase = ''): string {
  const base = explicitBase.trim().replace(/\/$/, '');
  if (base) return base;
  if (isDesktopShell()) return defaultRealmOrigin();
  return '';
}

/** WebSocket URL for the game server. */
export function resolveWebSocketUrl(explicitBase = ''): string {
  const origin = resolveApiOrigin(explicitBase);
  if (origin) {
    const wsOrigin = origin.replace(/^http/i, 'ws');
    return `${wsOrigin}/ws`;
  }
  if (typeof location === 'undefined') return `ws://127.0.0.1:8787/ws`;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.host}/ws`;
}

export function apiUrl(path: string, explicitBase = ''): string {
  const origin = resolveApiOrigin(explicitBase);
  return origin ? `${origin}${path}` : path;
}
