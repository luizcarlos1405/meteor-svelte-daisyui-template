# meteor-svelte-template

A reusable starter for **offline-first, installable (PWA)** web apps built on
**Meteor 3 + Svelte 5 + TypeScript**, using a **Functional Core / Imperative
Shell** architecture.

This template bakes in a set of deliberate stack/architecture decisions (see
**SPEC.md**) plus the toolchain wiring needed to make Meteor 3 + Rspack + Svelte
5 + Tailwind v4 + DaisyUI 5 work together. Clone it, rename, and start building
your domain.

---

## What's included

- **Auth** — passwordless email-code login/signup (`accounts-passwordless`),
  rebranded email templates, and auth screens (`/login`, `/signup`).
- **Offline + PWA** — Minimongo persisted to IndexedDB (`jam:offline`), queued
  method replay on reconnect, soft-delete reconciliation (`jam:soft-delete`),
  and a hand-rolled service worker + web manifest.
- **Functional Core** — a pure-TS core layer (`imports/api/core/`) with a
  sample `Validation` helper and unit test demonstrating the pattern.
- **Generic UI kit** — `Button`, `Input`, `Modal`, `Toast`, `IconButton`,
  `Avatar`, `Badge`, `Chip`, `AppHeader` (Svelte 5 runes, Tailwind + DaisyUI).
- **Reactive stores** — `auth`, `connection` (sync/offline status), `toast`.
- **Quality gates** — ESLint, Prettier, svelte-check typecheck, and a fast
  pure-unit test gate wired into a lefthook pre-commit hook.

---

## Tech stack

- **Meteor 3.4** (Node 22) with the **Rspack** bundler.
- **Svelte 5** (runes) for the UI.
- **TypeScript** across the codebase; types derived from Zod via `z.infer`.
- **Zod** for all data schemas and method argument validation.
- **Tailwind CSS v4** + **DaisyUI 5** for styling and UI primitives.
- **lucide-svelte** for icons.
- **accounts-passwordless** — email-code (passwordless) auth.
- **jam:offline** — Minimongo persistence to IndexedDB + offline method queue/replay.
- **jam:soft-delete** — soft-delete mechanism that offline sync reconciles against.
- **jam:method** — isomorphic RPC methods.
- **svelte-spa-router** — client-side routing.
- **meteortesting:mocha** for tests.

---

## Prerequisites

- [Node.js](https://nodejs.org/) **22**.
- **Meteor 3.4** — install the Meteor tool if you don't have it:

  ```bash
  npm install -g meteor
  ```

Meteor bundles its own MongoDB, so no separate database install is required for
local development. To point the app at an external database, set the `MONGO_URL`
environment variable.

---

## Getting started

Install dependencies:

```bash
npm install
```

Start the dev server (HMR enabled):

```bash
npm start        # or: meteor
```

The app runs on **http://localhost:3000** (see `package.json` `start` script for
the configured port).

> **Email auth in dev:** `accounts-passwordless` sends login-code emails via the
> `email` package. By default Meteor logs outbound mail to the server console in
> development (no SMTP needed). Configure `MAIL_URL` for production delivery.

---

## Available scripts

| Script               | Command                | Description                                                                          |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Start dev server     | `npm start`            | Runs `meteor run`.                                                                   |
| Full test suite      | `npm test`             | Runs `meteor test` (meteortesting:mocha) on **port 3100** (keeps dev port free).     |
| Pure unit tests      | `npm run test:unit`    | Runs mocha+tsx against `imports/api/**/*.test.ts` **without** a Meteor boot (~20ms). |
| Full-app watch tests | `npm run test-app`     | Runs the test suite in watch mode against the full app.                              |
| Typecheck            | `npm run typecheck`    | Runs **svelte-check** (not `tsc`).                                                   |
| Lint                 | `npm run lint`         | Runs ESLint over the project.                                                        |
| Lint (auto-fix)      | `npm run lint:fix`     | Runs ESLint with `--fix`.                                                            |
| Format               | `npm run format`       | Writes Prettier formatting across the project.                                       |
| Check formatting     | `npm run format:check` | Checks formatting without writing.                                                   |
| Bundle visualizer    | `npm run visualize`    | Builds a production bundle with `bundle-visualizer`.                                 |

---

## Project structure

```
imports/
  api/
    core/                 # functional core (pure TS) — unit-tested
    schemas/              # zod schemas + z.infer types
    collections/          # Mongo.Collection declarations (isomorphic)
    methods/              # imperative shell — RPC (server-authoritative)
    publications/         # imperative shell — access-checked reads
    server/               # server-only wiring (e.g. email templates)
    offline/              # Offline.configure (jam:offline)
    constants.ts          # project-wide constants (no Meteor imports)
    errors.ts             # shared Meteor.Error catalog
    softDelete.ts         # jam:soft-delete configuration
  types/                  # ambient .d.ts shims (e.g. accounts-passwordless)
  ui/
    pages/                # Home (placeholder), Login, Signup, AuthLayout
    components/           # Svelte UI kit (Button, Input, Modal, …)
    stores/               # subscribe + Minimongo read stores (no business logic)
    lib/                  # auth error mapping, formatters
    App.svelte
    routes.ts
client/
  main.js  main.html  main.css
public/
  manifest.webmanifest  sw.js  icons/
server/
  main.js
tests/                    # Meteor integration tests (need the runtime)
```

### Architecture — Functional Core / Imperative Shell

- **`imports/api/core/`** — pure TypeScript (no `meteor/*`, no DB, no I/O). The
  **only place business rules live** (permission predicates, state transitions,
  reordering, Zod validation helpers). Fully unit-tested.
- **Shell** — Meteor **methods** (`imports/api/methods/`) parse input with Zod,
  load docs, call the core, and persist; **publications**
  (`imports/api/publications/`) are access-checked reads; **client stores**
  (`imports/ui/stores/`) subscribe and read from Minimongo with **no business
  logic**.

Methods are isomorphic: the same pure core functions run server-side
(authoritative) and may be used by client stubs for optimistic UI.

See **SPEC.md** for the full architecture, conventions, and offline/PWA design.

---

## Testing

- **Functional core** — pure-function unit tests under `imports/api/core/*.test.ts`,
  run without a Meteor runtime:
  ```bash
  npm run test:unit
  ```
- **Integration tests** (methods, publications) live in `tests/*.test.ts` and need
  the Meteor runtime:
  ```bash
  npm test
  ```

---

## Quality gates (pre-commit)

A [lefthook](https://lefthook.dev/) pre-commit hook runs sequentially:

**prettier → eslint → typecheck → unit tests**

All must pass to commit (~8s). Install the hooks after cloning:

```bash
npx lefthook install
```

---

## Offline & PWA

- Minimongo collections persist to **IndexedDB**, so already-loaded data remains
  visible offline and survives reloads.
- Method calls made offline are queued and replayed sequentially on reconnect;
  insert methods return the new `_id` for replay correlation.
- A hand-rolled service worker (`public/sw.js`) + web manifest
  (`public/manifest.webmanifest`) make the app installable and keep the app shell
  available offline.

---

## Configuration notes

- Absolute imports use a leading `/` (e.g. `/imports/api/...`), mapped in
  `tsconfig.json`. `meteor/*` resolves via `zodern:types`.
- Tailwind theme tokens and DaisyUI wiring live in `client/main.css` and
  `postcss.config.js`.
- Rspack configuration (`rspack.config.js`) handles SWC TypeScript parsing,
  `lucide-svelte` resolution, and the PostCSS/Tailwind pipeline. **Edits to
  `rspack.config.js` require a full `meteor` restart** (HMR doesn't reload it).

---

## Documentation

- **`SPEC.md`** — architecture, conventions, tech-stack decisions, and the
  offline/PWA design.
- **`AGENTS.md`** — compact contributor guide with toolchain quirks and
  conventions.
