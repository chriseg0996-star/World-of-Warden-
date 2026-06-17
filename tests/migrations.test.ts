import { describe, it, expect, vi } from 'vitest';

// db.ts throws at import without DATABASE_URL and constructs a pg Pool; set a
// dummy URL and mock pg so importing MIGRATIONS works without a real database
// (same pattern as db_search.test.ts).
vi.hoisted(() => {
  process.env.DATABASE_URL ??= 'postgres://test/test';
});
vi.mock('pg', () => ({
  Pool: vi.fn(function Pool() {
    return { query: vi.fn() };
  }),
}));

import { runMigrations, type Migration, type MigrationClient } from '../server/migrations';
import { MIGRATIONS } from '../server/db';

// In-memory fake of the Postgres client: tracks the schema_migrations table and
// records every executed migration SQL so we can assert order + idempotency
// without a real database.
function fakeClient() {
  const appliedTable = new Set<string>();
  const executed: string[] = []; // ids of migration SQL bodies actually run
  const client: MigrationClient = {
    async query(text: string, params?: unknown[]) {
      if (text.startsWith('CREATE TABLE IF NOT EXISTS schema_migrations')) return { rows: [] };
      if (text.startsWith('SELECT id FROM schema_migrations')) {
        return { rows: [...appliedTable].map((id) => ({ id })) };
      }
      if (text.startsWith('INSERT INTO schema_migrations')) {
        appliedTable.add(String(params?.[0]));
        return { rows: [] };
      }
      // Otherwise it's a migration body; record it by its marker comment.
      executed.push(text);
      return { rows: [] };
    },
  };
  return { client, appliedTable, executed };
}

const sample: Migration[] = [
  { id: '0001_baseline', sql: '/* m1 */ CREATE TABLE a ();' },
  { id: '0002_two', sql: '/* m2 */ CREATE TABLE b ();' },
  { id: '0003_three', sql: '/* m3 */ CREATE TABLE c ();' },
];

describe('runMigrations', () => {
  it('applies every migration in order on a fresh database', async () => {
    const { client, appliedTable, executed } = fakeClient();
    const ran = await runMigrations(client, sample);
    expect(ran).toEqual(['0001_baseline', '0002_two', '0003_three']);
    expect([...appliedTable]).toEqual(['0001_baseline', '0002_two', '0003_three']);
    expect(executed).toEqual([sample[0].sql, sample[1].sql, sample[2].sql]);
  });

  it('skips already-applied migrations and runs only pending ones, in order', async () => {
    const { client, appliedTable, executed } = fakeClient();
    appliedTable.add('0001_baseline');
    appliedTable.add('0002_two');
    const ran = await runMigrations(client, sample);
    expect(ran).toEqual(['0003_three']);
    expect(executed).toEqual([sample[2].sql]); // only the pending body ran
  });

  it('is a no-op when everything is already applied (idempotent re-run)', async () => {
    const { client, appliedTable, executed } = fakeClient();
    for (const m of sample) appliedTable.add(m.id);
    const ran = await runMigrations(client, sample);
    expect(ran).toEqual([]);
    expect(executed).toEqual([]);
  });

  it('ships a baseline migration that contains the real schema DDL', () => {
    expect(MIGRATIONS[0].id).toBe('0001_baseline');
    // Baseline carries the core tables so a fresh database is fully provisioned.
    expect(MIGRATIONS[0].sql).toContain('CREATE TABLE IF NOT EXISTS accounts');
    expect(MIGRATIONS[0].sql).toContain('CREATE TABLE IF NOT EXISTS characters');
    // Migration ids are unique and ordered.
    const ids = MIGRATIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids]).toEqual([...ids].sort());
  });
});
