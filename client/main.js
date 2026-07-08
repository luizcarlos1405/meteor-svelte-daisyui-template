import { Meteor } from 'meteor/meteor';
import '/imports/api/offline/config'; // before collections: Offline.config.limit is snapshotted at construction
import '@fontsource-variable/inter';
import '/imports/api/methods'; // constructs collections (auto-registered for offline via keepAll)
import './main.css';
import App from '../imports/ui/App.svelte';
import { mount, unmount } from 'svelte';

let app; // will hold the mounted instance

Meteor.startup(() => {
  const target = document.getElementById('app');

  // (Re)mount
  app = mount(App, { target });

  // Clean up on HMR so we don't double-mount
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
    import.meta.webpackHot.dispose(() => {
      if (app) {
        // pass the instance you got from mount()
        unmount(app, { outro: false }); // set outro:true if you want transitions
        app = null;
      }
      // optional: clear target to be extra safe
      target.innerHTML = '';
    });
  }
});

// PWA: register the service worker so a reload while offline still loads the
// app shell (jam:offline then rehydrates Minimongo from IndexedDB).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
