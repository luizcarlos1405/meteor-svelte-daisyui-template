import { SoftDelete } from 'meteor/jam:soft-delete';

// Soft-delete exists so jam:offline can reconcile removals on reconnect (it
// needs an archive/soft-delete mechanism to diff against). Not a user-facing
// "archive" feature.
// Defaults: queries auto-exclude `deleted: true`; removeAsync() becomes a soft
// delete. `overrideRemove: true` applies to every collection, including
// Meteor.users — pass `{ forever: true }` to hard-remove in test fixtures.
SoftDelete.configure({
  deleted: 'deleted',
  deletedAt: 'deletedAt',
  autoFilter: true,
  overrideRemove: true,
});
