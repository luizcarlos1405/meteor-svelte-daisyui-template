<script lang="ts">
  import { Meteor } from 'meteor/meteor';
  import { Accounts } from 'meteor/accounts-base';
  import { push } from 'svelte-spa-router';
  import AuthLayout from './AuthLayout.svelte';
  import { authErrorMessage } from '../lib/authErrors';

  let email = $state('');
  let token = $state('');
  let error = $state('');
  let busy = $state(false);
  let phase = $state<'request' | 'verify'>('request');
  let secondsLeft = $state(0);

  $effect(() => {
    if (secondsLeft <= 0) return;
    const handle = setTimeout(() => (secondsLeft -= 1), 1000);
    return () => clearTimeout(handle);
  });

  async function requestToken() {
    const trimmed = email.trim();
    if (!trimmed) {
      error = 'Please enter your email.';
      return;
    }
    busy = true;
    error = '';
    try {
      await new Promise<void>((resolve, reject) => {
        Accounts.requestLoginTokenForUser(
          { selector: { email: trimmed }, userData: { email: trimmed } },
          (err) => (err ? reject(err) : resolve()),
        );
      });
      phase = 'verify';
      secondsLeft = 60;
    } catch (err) {
      error = authErrorMessage(err);
    } finally {
      busy = false;
    }
  }

  async function verifyToken() {
    const trimmed = email.trim();
    if (!token.trim()) {
      error = 'Enter the code you received by email.';
      return;
    }
    busy = true;
    error = '';
    try {
      await new Promise<void>((resolve, reject) => {
        Meteor.passwordlessLoginWithToken({ email: trimmed }, token.trim(), (err) =>
          err ? reject(err) : resolve(),
        );
      });
      push('/');
    } catch (err) {
      error = authErrorMessage(err);
    } finally {
      busy = false;
    }
  }

  function submit(event: Event) {
    event.preventDefault();
    if (phase === 'request') requestToken();
    else verifyToken();
  }

  function backToEmail() {
    phase = 'request';
    token = '';
    error = '';
    secondsLeft = 0;
  }
</script>

<AuthLayout headline="Welcome back." subhead="Sign in with an email code. Works offline.">
  <form onsubmit={submit} class="flex w-full max-w-[360px] flex-col gap-5">
    <div class="flex flex-col gap-1.5">
      <h2 class="text-[22px] font-semibold text-base-content">Sign in</h2>
      {#if phase === 'request'}
        <p class="text-sm text-base-content/60">
          Enter your email and we'll send you an access code.
        </p>
      {:else}
        <p class="text-sm text-base-content/60">
          We sent a code to <span class="font-medium text-base-content">{email.trim()}</span>.
        </p>
      {/if}
    </div>

    {#if error}
      <p class="rounded-md border border-error bg-error/10 px-3 py-2 text-sm text-error">
        {error}
      </p>
    {/if}

    {#if phase === 'request'}
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-base-content">Email</span>
        <input class="input w-full" type="email" bind:value={email} placeholder="you@example.com" />
      </label>
      <button type="submit" disabled={busy} class="btn w-full btn-primary">
        {busy ? 'Sending…' : 'Request code'}
      </button>
    {:else}
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-base-content">Code</span>
        <input class="input w-full" bind:value={token} placeholder="000000" />
      </label>
      <button type="submit" disabled={busy} class="btn w-full btn-primary">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <div class="flex items-center justify-center gap-1 text-[13px]">
        {#if secondsLeft > 0}
          <span class="text-base-content/40">Resend in {secondsLeft}s</span>
        {:else}
          <button
            type="button"
            onclick={requestToken}
            disabled={busy}
            class="font-semibold text-primary hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        {/if}
      </div>
      <button
        type="button"
        onclick={backToEmail}
        class="text-[13px] text-base-content/40 underline hover:text-base-content/60"
      >
        change email
      </button>
    {/if}

    <div class="flex items-center justify-center gap-1 text-[13px]">
      <span class="text-base-content/40">Don't have an account?</span>
      <button
        type="button"
        onclick={() => push('/signup')}
        class="font-semibold text-primary hover:underline"
      >
        Sign up
      </button>
    </div>
  </form>
</AuthLayout>
