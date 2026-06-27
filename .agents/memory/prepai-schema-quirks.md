---
name: PrepAI schema and auth quirks
description: Gotchas in PrepAI's DB schema and auth setup that tripped up the build
---

## Sessions table format
The `sessionsTable` in `lib/db/src/schema/auth.ts` uses `(sid TEXT PK, sess JSONB, expire TIMESTAMPTZ)` — the connect-pg-simple compatible format expected by `artifacts/api-server/src/lib/auth.ts`. An earlier version used `(id, userId, expiresAt, isMobile)` which caused a runtime crash.

**Why:** The `auth.ts` template was written for the connect-pg-simple store format. Changing the schema to match the application design required rebuilding it.

**How to apply:** If auth.ts is replaced or the sessions table is recreated, it must keep these three columns or auth.ts must be rewritten.

## drizzle-zod createInsertSchema
`createInsertSchema` from `drizzle-zod` already excludes `generatedAlwaysAsIdentity()` columns. Do NOT call `.omit({ id: true })` on schemas for tables with identity columns — it throws `Unrecognized key: "id"`.

**Why:** drizzle-zod introspects the column mode and strips non-insertable columns automatically.

## replit-auth-web tsconfig
The `lib/replit-auth-web` package needs `vite` as a devDependency and `"types": ["vite/client"]` in its tsconfig to resolve `import.meta.env.BASE_URL`. Without this, the root `typecheck:libs` script fails with `Property 'env' does not exist on type 'ImportMeta'`.

## React Query refetchInterval callback
In React Query v5, `refetchInterval` callbacks receive a `Query` object, not the data directly. Access data via `query.state.data`, not `data` directly.

```ts
// WRONG
refetchInterval: (data) => data?.status === "completed" ? false : 2000

// CORRECT
refetchInterval: (query) => query.state.data?.status === "completed" ? false : 2000
```
