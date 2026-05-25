<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'

  function home() {
    goto('/')
  }

  function retry() {
    location.reload()
  }
</script>

<svelte:head>
  <title>{page.status} · noPlans</title>
  <meta name="description" content="Something went wrong in noPlans." />
</svelte:head>

<main class="relative min-h-screen overflow-hidden bg-neutral-50 px-5 py-12 text-neutral-900 dark:bg-neutral-950 dark:text-white">
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl"></div>
    <div class="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl"></div>
  </div>

  <div class="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
    <section class="rounded-3xl border border-white/70 bg-white/90 p-6 text-center shadow-xl shadow-black/5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900">
        <span class="text-3xl">{page.status === 404 ? '🔎' : '⚠️'}</span>
      </div>

      <div class="mb-2 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
        Error {page.status}
      </div>

      <h1 class="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
        {page.status === 404 ? 'Page not found' : 'Something went wrong'}
      </h1>

      <p class="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
        {page.status === 404
          ? 'The page or group you were looking for could not be found.'
          : page.error?.message ?? 'An unexpected error occurred.'}
      </p>

      <div class="mt-6 flex gap-3">
        <button
          type="button"
          onclick={home}
          class="flex-1 rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          Go home
        </button>

        <button
          type="button"
          onclick={retry}
          class="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-violet-700 dark:hover:text-violet-300"
        >
          Try again
        </button>
      </div>

      {#if page.status === 404}
        <p class="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
          If this was a group link, the group may have been deleted or the code may be invalid.
        </p>
      {/if}
    </section>
  </div>
</main>