<script lang="ts">
  import Router, { push, router } from 'svelte-spa-router';
  import { routes } from './routes';
  import { currentUser, loggingIn } from './stores/auth';
  import Toast from './components/Toast.svelte';

  const AUTH_ROUTES = ['/login', '/signup'];

  $effect(() => {
    if ($loggingIn) return;
    const onAuthRoute = AUTH_ROUTES.includes(router.location);
    if (!$currentUser && !onAuthRoute) push('/login');
    else if ($currentUser && onAuthRoute) push('/');
  });
</script>

{#if $loggingIn}
  <div class="grid min-h-screen place-items-center bg-base-100 text-sm text-base-content/40">
    Loading…
  </div>
{:else}
  <Router {routes} />
{/if}

<Toast />
