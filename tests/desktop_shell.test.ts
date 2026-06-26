import { describe, expect, it } from 'vitest';
import { apiUrl, defaultRealmOrigin, isDesktopShell, resolveApiOrigin, resolveWebSocketUrl } from '../src/desktop/shell';

describe('desktop shell', () => {
  it('is off in the Vitest/browserless host', () => {
    expect(isDesktopShell()).toBe(false);
  });

  it('defaults realm origin to local dev server', () => {
    expect(defaultRealmOrigin()).toBe('http://127.0.0.1:8787');
  });

  it('uses explicit realm base when set', () => {
    expect(resolveApiOrigin('https://realm.example.com')).toBe('https://realm.example.com');
    expect(apiUrl('/api/login', 'https://realm.example.com/')).toBe('https://realm.example.com/api/login');
    expect(resolveWebSocketUrl('https://realm.example.com')).toBe('wss://realm.example.com/ws');
  });

  it('builds relative API paths on the web client', () => {
    expect(resolveApiOrigin('')).toBe('');
    expect(apiUrl('/api/realms', '')).toBe('/api/realms');
  });
});
