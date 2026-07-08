// Mongo.Collection declarations live in this directory (isomorphic). Each file
// declares one collection and re-exports it from this barrel, e.g.:
//
//   import { Mongo } from 'meteor/mongo';
//   export const Things = new Mongo.Collection<Thing>('things');
//
// Configure soft-delete (jam:soft-delete) as a side-effect before any
// collection is constructed/used.
import '../softDelete';
