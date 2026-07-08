<script lang="ts">
  import { Meteor } from 'meteor/meteor';
  import { push } from 'svelte-spa-router';
  import AppHeader from '../components/AppHeader.svelte';
  import Button from '../components/Button.svelte';
  import { currentUser, displayName } from '../stores/auth';

  const name = $derived(displayName($currentUser));

  function logout() {
    Meteor.logout(() => push('/login'));
  }
</script>

<div class="flex min-h-screen flex-col bg-base-100">
  <AppHeader userName={name} />
  <main class="flex flex-1 flex-col items-center justify-center gap-6 p-8">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold text-base-content">
        {#if name}Welcome, {name}.{:else}Welcome.{/if}
      </h1>
      <p class="max-w-md text-sm text-base-content/60">
        This is the placeholder home page. Replace it with your app — add routes in
        <code class="text-base-content">imports/ui/routes.ts</code> and data stores in
        <code class="text-base-content">imports/ui/stores/</code>.
      </p>
    </div>
    <Button variant="ghost" onclick={logout}>Sign out</Button>
  </main>
</div>
