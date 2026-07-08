import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { writable } from 'svelte/store';

export const currentUser = writable<Meteor.User | null>(null);
export const loggingIn = writable(true);

if (Meteor.isClient) {
  Tracker.autorun(() => {
    loggingIn.set(Meteor.loggingIn());
    currentUser.set(Meteor.user());
  });
}

export function displayName(user: Meteor.User | null): string {
  const profile = user?.profile as { displayName?: string } | undefined;
  return profile?.displayName ?? user?.emails?.[0]?.address ?? '';
}
