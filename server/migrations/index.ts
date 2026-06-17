// Versioned schema migrations.
//
// The runner is intentionally dependency-free and imports nothing from `db.ts`
// (the baseline SQL is passed in by the caller) so there is no import cycle:
// `db.ts` → this module, never the reverse.
//
// How it works: `runMigrations` records every applied migration id in a
// `schema_migrations` table and only runs the ones not yet applied, in array
// order, inside whatever transaction the caller has already opened (db.ts wraps
// it in the boot-time advisory-locked transaction so concurrent per-realm boots
// serialize). Migration `0001_baseline` is the full pre-migrations schema; on an
// already-deployed database its `IF NOT EXISTS` DDL is a harmless no-op and just
// gets recorded.
//
// Adding a migration: create `server/migrations/NNNN_name.ts` exporting a
// `Migration`, import it here, and append it to `POST_BASELINE_MIGRATIONS`.
// Post-baseline migrations run exactly once and are tracked, so — unlike the
// frozen baseline — they need NOT be idempotent. Never edit `0001_baseline`
// (and thus never edit `SCHEMA`) again; express schema changes as new migrations.

export interface Migration {
  /** Stable, ordered id, e.g. '0002_add_guild_perks'. Recorded once applied. */
  id: string;
  /** Raw SQL; may contain multiple `;`-separated statements (simple-query protocol). */
  sql: string;
}

/** Minimal client shape so both a real `pg` PoolClient and test fakes satisfy it. */
export interface MigrationClient {
  query(text: string, params?: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
}

/** Future migrations live here, in apply order. The baseline is prepended by db.ts. */
export const POST_BASELINE_MIGRATIONS: Migration[] = [];

/**
 * Apply every migration in `migrations` that is not yet recorded in
 * `schema_migrations`, in array order, recording each as it succeeds. The caller
 * owns the surrounding transaction + advisory lock. Returns the ids applied this run.
 */
export async function runMigrations(client: MigrationClient, migrations: Migration[]): Promise<string[]> {
  await client.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
  );
  const existing = await client.query('SELECT id FROM schema_migrations');
  const applied = new Set(existing.rows.map((r) => String(r.id)));

  const ran: string[] = [];
  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    await client.query(migration.sql);
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
    ran.push(migration.id);
  }
  return ran;
}
