import { Meteor } from 'meteor/meteor';
import '/imports/api/offline/config';
import '/imports/api/collections';
import '/imports/api/methods';
import '/imports/api/publications';
import '/imports/api/server/accountsEmail';

Meteor.startup(() => {
  // Server is running.
});
