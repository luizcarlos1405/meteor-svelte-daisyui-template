<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    headline: string;
    subhead: string;
    children: Snippet;
  }

  let { headline, subhead, children }: Props = $props();
</script>

<div class="flex min-h-screen flex-col bg-base-100 lg:flex-row">
  <aside
    class="flex flex-col justify-between gap-12 bg-base-200 p-8 sm:p-10 lg:min-h-screen lg:w-[480px] lg:p-12"
  >
    <!-- placeholder brand — replace with your app name/logo -->
    <div class="flex items-center gap-2.5">
      <div class="grid size-9 place-items-center rounded-md bg-primary">
        <span class="text-base font-bold text-primary-content">A</span>
      </div>
      <span class="text-lg font-semibold text-base-content">App</span>
    </div>

    <div class="flex flex-col gap-4">
      <h1
        class="max-w-[420px] text-2xl font-bold leading-tight text-base-content lg:text-[30px] lg:leading-[1.15]"
      >
        {headline}
      </h1>
      <p class="hidden text-[15px] leading-relaxed text-base-content/60 lg:block">
        {subhead}
      </p>
    </div>

    <div></div>
  </aside>

  <main class="flex flex-1 flex-col items-center justify-center gap-8 p-8 sm:p-10 lg:p-12">
    {@render children()}
    <p class="text-xs text-base-content/40">© {new Date().getFullYear()} App</p>
  </main>
</div>
