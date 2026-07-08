# meteor-svelte-template — Specification

This document specifies the **architecture, conventions, and tech-stack
decisions** baked into this template. It is intentionally domain-agnostic: the
data model, methods, and permissions of the app you build on top of it are
defined per-project. UI/visual design is out of scope.

---

## 1. Purpose

A reusable, opinionated starter for **offline-first, installable (PWA)** web
apps built on Meteor 3 + Svelte 5 + TypeScript. The template provides:

- The toolchain wiring (Rspack, Tailwind v4, DaisyUI 5, svelte-check) already
  fighting its way through Meteor 3's quirks.
- An **email-code passwordless auth** flow (screens, email templates, stores).
- The **offline + PWA** stack (`jam:offline`, `jam:soft-delete`, service worker,
  manifest) configured end-to-end.
- The **Functional Core / Imperative Shell** architecture and a sample pure
  function with a unit test demonstrating the pattern.
- A generic UI kit and reactive stores.

What the template deliberately does **not** provide: your domain collections,
schemas, methods, publications, and business rules. Those follow the patterns
below.

---

## 2. Tech Stack

- **Meteor 3.4** (Node 22) with the **Rspack** bundler.
- **Svelte 5** (runes) for the UI.
- **TypeScript** across the codebase.
- **Zod** for all data schemas; TS types are derived via `z.infer` wherever a
  schema exists. Plain TS types are only used when no Zod schema applies.
- **Tailwind CSS v4** + **DaisyUI** for styling and UI primitives.
- **lucide-svelte** (Lucide icons) for iconography.
- **accounts-passwordless** — passwordless email-code auth (request a code by
  email, verify it to sign in / create an account).
- **jam:offline** — Minimongo persistence to IndexedDB + offline method queue/replay.
- **jam:soft-delete** — provides the soft-delete mechanism that `jam:offline`
  reconciles removals against (see §6.3).
- **jam:method** — isomorphic RPC methods.
- **svelte-spa-router** — client-side routing.
- **meteortesting:mocha** for tests.

---

## 3. Architecture — Functional Core / Imperative Shell

The codebase is split into two strict layers.

### 3.1 Functional Core (`imports/api/core/**`)

- Pure TypeScript modules. **No imports from `meteor/*`, no DB access, no I/O, no
  `Date.now()`/`Math.random()` unless injected as arguments.**
- Contains: permission predicates, state-transition/reordering functions, and Zod
  validation helpers that return `Result`-style values (see the bundled
  `Validation.parseWith`).
- Inputs are plain data (plain objects / arrays / `z.infer` types). Outputs are
  new plain data — never mutation of inputs.
- This is the **only layer that contains business rules**, and it is fully
  unit-tested.

### 3.2 Imperative Shell

Everything that touches the world:

- **Server shell**: Meteor **methods** (`imports/api/methods/`) parse input with
  Zod → load docs → call the core → persist; **publications**
  (`imports/api/publications/`) are access-checked reads; server startup and
  server-only wiring (e.g. `accountsEmail.ts`).
- **Client shell**: Svelte stores (`imports/ui/stores/`) that **subscribe** to
  publications, **read from Minimongo**, and **call methods** (with optimistic
  UI). The client shell contains **no business logic** — it renders data and
  dispatches intents via methods.

### 3.3 Why the split works with Meteor

Methods are **isomorphic** (defined once, importable by client and server). The
same pure functions in the core are invoked by the server method (authoritative)
and may be used by the client-side method stub for latency compensation
(optimistic UI). The server result is always the source of truth and overrides
the optimistic local state.

---

## 4. Data Modeling Conventions

- Define each entity's Zod schema in `imports/api/schemas/` and derive its type
  with `export type X = z.infer<typeof XSchema>`. Do not hand-write duplicate
  interfaces for schema-covered data.
- Declare the `Mongo.Collection` in `imports/api/collections/` (typed by the
  schema's inferred type) and re-export it from the barrel.
- Documents carry a soft-delete flag (`deleted: boolean`) added transparently by
  `jam:soft-delete`; omit it from your schemas for clarity.
- `imports/api/schemas/user.ts` ships a minimal `UserProfileSchema` projection
  as an example.

---

## 5. Methods (RPC API — the server shell)

Naming convention: `<entity>.<action>`. Every method:

1. Validates arguments with Zod (core `parseWith`).
2. Loads the relevant docs from Mongo.
3. Runs the applicable permission predicate and business rule from the core.
4. Persists changes (using `insertAsync` / `updateAsync`), updates `updatedAt`,
   and returns the value `jam:offline` needs for replay correlation (insert
   methods **must return the new `_id`**).
5. Throws `Meteor.Error(code, reason)` on failure, where `code` is an English
   identifier from the shared catalog (`imports/api/errors.ts`) and `reason` is a
   user-facing message.

Permission checks are **always re-evaluated on the server** inside each method,
never trusted from the client.

---

## 6. Offline & PWA

### 6.1 Data persistence (`jam:offline`)

- Minimongo collections are persisted to **IndexedDB**, so data the user has
  already loaded remains visible while offline and survives a page reload.
- A shared config file (`imports/api/offline/config.ts`) imported on both client
  and server calls `Offline.configure({ ... })`. It **must be imported before
  the collections barrel** — `Offline.config` is snapshotted at
  `Mongo.Collection` construction time.

### 6.2 Method queueing & replay

- While offline, method calls are replayed sequentially on reconnect. Insert
  methods return the new `_id` so subsequent offline edits target the right
  document.
- Per-collection `.keep()` filters (run after construction) can scope offline
  retention to the user's own data; see the `jam:offline` docs and AGENTS.md for
  the `.keep()` typing workaround.

### 6.3 Soft-delete (derived requirement)

`jam:offline` reconciles removals against either an archive or a soft-delete
mechanism. We adopt **`jam:soft-delete`**: collections carry a `deleted` flag;
"remove" methods soft-delete, and **all publications and `.keep` filters exclude
`deleted: true`**. `softDelete.ts` configures it globally (`autoFilter: true`,
`overrideRemove: true`).

### 6.4 Service worker & installability

- A hand-rolled service worker (`public/sw.js`) caches the app shell so a refresh
  while offline still loads the UI (network-first for navigations, stale-while-
  revalidate for assets). Bump the `CACHE` version key when you ship breaking
  shell changes.
- A web manifest (`public/manifest.webmanifest`) makes the app installable.

### 6.5 Sync status & errors

- `isSyncing()` (reactive) is surfaced in the UI via `imports/ui/stores/connection.ts`
  (exposes a `synced` | `syncing` | `offline` state) and `Meteor.status().connected`
  drives offline/online cues.
- `handleSyncErrors` in the offline config receives replay/keep errors and shows
  them to the user via the toast store.

---

## 7. Client Responsibilities

- Hold **no business logic**. The client:
  1. Subscribes to publications.
  2. Reads documents from Minimongo via Svelte stores.
  3. Dispatches user intents by calling methods.
- Methods are called with **optimistic UI**: the client-side stub performs the
  same Zod validation and runs the same core functions against the local
  Minimongo so the UI updates instantly; the server's authoritative response
  reconciles afterward.
- Connection/sync status is exposed reactively and rendered in the UI.

---

## 8. Testing Strategy

- **Functional core: unit-tested, mandatory.** Pure-function tests under
  `imports/api/core/**/*.test.ts`, executed without a DB or Meteor runtime via
  the `meteortesting:mocha` runner (fast gate: `mocha --import=tsx`). The bundled
  `Validation.test.ts` is the reference example.
- **Shell:** method/publication integration tests (small fixtures, in-memory
  Mongo) live in `tests/*.test.ts` and need the Meteor runtime (`npm test`).
- Tests must not depend on wall-clock time or randomness; core functions receive
  `now`/ids as arguments.

---

## 9. Conventions

- **Async DB only** — always the `*Async` variants (`insertAsync`,
  `findOneAsync`, `updateAsync`, `removeAsync`, `countAsync`, `fetchAsync`). On
  the server in Meteor 3, `findOne()` is disabled in publish handlers.
- **Types:** whenever a Zod schema exists, the TS type is `z.infer<typeof
Schema>`.
- **Method naming:** `<entity>.<action>` (e.g., `things.create`).
- **Soft-delete:** "remove" always means soft-delete (`deleted = true`);
  publications and `.keep` filters always exclude deleted docs.
- **No client-side business rules:** permission/validity decisions live in the
  core and are enforced server-side inside methods.

---

## 10. Project Structure

```
imports/
  api/
    core/                 # functional core (pure) — unit-tested
    schemas/              # zod schemas + z.infer types
    collections/          # Mongo.Collection declarations (isomorphic)
    methods/              # imperative shell — RPC (server-authoritative)
    publications/         # imperative shell — access-checked reads
    server/               # server-only wiring (email templates, hooks)
    offline/              # Offline.configure
    constants.ts
    errors.ts             # shared Meteor.Error catalog
    softDelete.ts
  types/                  # ambient .d.ts shims
  ui/
    pages/                # Home, Login, Signup, AuthLayout
    components/           # Svelte UI kit
    stores/               # subscribe + Minimongo read stores (no business logic)
    lib/                  # formatters, auth error mapping
client/
  main.js  main.html  main.css
public/
  manifest.webmanifest  sw.js  icons/
server/
  main.js
tests/
```

---

## 11. Decisions Confirmed

1. **Auth:** passwordless email-code (`accounts-passwordless`) — no passwords.
   A display name is collected at signup and stored on the user profile.
2. **Offline:** method queueing + cached Minimongo visible offline and after
   reload; soft-delete drives reconciliation.
3. **Architecture:** Functional Core / Imperative Shell; the core is pure TS and
   the only home of business rules; the shell (methods/publications/stores)
   contains no business logic.
4. **Styling:** Tailwind v4 + DaisyUI with a custom dark theme token set in
   `client/main.css`.
