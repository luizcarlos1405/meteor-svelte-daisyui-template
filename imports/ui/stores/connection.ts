import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { writable } from 'svelte/store';
import { isSyncing } from 'meteor/jam:offline';

export type SyncState = 'synced' | 'syncing' | 'offline';

export const syncState = writable<SyncState>('synced');

// Driven by two reactive sources: Meteor's connection status and jam:offline's
// sync flag. Offline dominates; otherwise syncing while replaying the queue;
// otherwise synced.
if (Meteor.isClient) {
  Tracker.autorun(() => {
    if (!Meteor.status().connected) {
      syncState.set('offline');
    } else if (isSyncing()) {
      syncState.set('syncing');
    } else {
      syncState.set('synced');
    }
  });
}
