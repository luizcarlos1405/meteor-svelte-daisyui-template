<script lang="ts">
  import { Meteor } from 'meteor/meteor';
  import { Accounts } from 'meteor/accounts-base';
  import { push } from 'svelte-spa-router';
  import AuthLayout from './AuthLayout.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';
  import { authErrorMessage } from '../lib/authErrors';

  let name = $state('');
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
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedName || !trimmedEmail) {
      error = 'Please fill in your name and email.';
      return;
    }
    busy = true;
    error = '';
    try {
      // userData.profile.displayName is applied ONLY when the user does not
      // exist yet — returning users keep their existing profile untouched.
      await new Promise<void>((resolve, reject) => {
        Accounts.requestLoginTokenForUser(
          {
            selector: { email: trimmedEmail },
            userData: { email: trimmedEmail, profile: { displayName: trimmedName } },
          },
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

<AuthLayout headline="Get started in minutes." subhead="Create your account with an email code.">
  <form onsubmit={submit} class="flex w-full max-w-[360px] flex-col gap-5">
    <div class="flex flex-col gap-1.5">
      <h2 class="text-[22px] font-semibold text-base-content">Create account</h2>
      {#if phase === 'request'}
        <p class="text-sm text-base-content/60">It takes less than a minute.</p>
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
      <Input label="Name" bind:value={name} placeholder="Your name" />
      <Input label="Email" type="email" bind:value={email} placeholder="you@example.com" />
      <Button type="submit" disabled={busy} class="w-full">
        {busy ? 'Sending…' : 'Request code'}
      </Button>
    {:else}
      <Input label="Code" bind:value={token} placeholder="000000" />
      <Button type="submit" disabled={busy} class="w-full">
        {busy ? 'Creating…' : 'Create account'}
      </Button>
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
      <span class="text-base-content/40">Already have an account?</span>
      <button
        type="button"
        onclick={() => push('/login')}
        class="font-semibold text-primary hover:underline"
      >
        Sign in
      </button>
    </div>
  </form>
</AuthLayout>
