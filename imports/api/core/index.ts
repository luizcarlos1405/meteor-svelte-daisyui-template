// Functional core barrel. Pure TS modules (no `meteor/*`, no DB, no I/O) — the
// only place business rules live. Re-export each module as a namespace.
export * as Validation from './Validation';
