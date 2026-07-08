// jam:offline configuration. Imported FIRST (before the collections barrel) on
// both client and server so `limit` is captured by the Mongo.Collection
// constructor override (it snapshots Offline.config at construction time).
// Defaults already match our needs:
//   - filter: { deleted: false }  (jam:soft-delete sets deleted:false on insert)
//   - keepAll: true               (all collections are kept offline)
//   - autoSync: true              (replay queued methods on reconnect)
// We bump the per-collection limit and surface replay/keep errors to the user.
import { Meteor } from 'meteor/meteor';
import { Offline } from 'meteor/jam:offline';

if (Meteor.isClient) {
  Offline.configure({
    limit: 200,
    handleSyncErrors: async ({ replayErrors, keepErrors }) => {
      if ((replayErrors && replayErrors.length > 0) || (keepErrors && keepErrors.length > 0)) {
        const { showToast } = await import('/imports/ui/stores/toast');
        showToast('Some items could not be synchronized.');
      }
    },
  });
} else {
  Offline.configure({ limit: 200 });
}
