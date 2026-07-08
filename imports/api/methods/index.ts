// Methods barrel — importing this registers every isomorphic method on both
// client and server (side-effect) and re-exports the callables for the UI.
//
// Add one import per method module:
//   import './thingsMethods';
//   export { thingsCreate, thingsRename } from './thingsMethods';
//
// Method conventions (see SPEC.md):
//  - `createMethod({ name, schema, run })` with a Zod schema.
//  - Gate DB-backed permission/not-found throws behind `if (Meteor.isServer)`
//    so the optimistic client stub never aborts the authoritative server call.
//  - Insert methods must return the new `_id` (offline replay correlation).
export {};
