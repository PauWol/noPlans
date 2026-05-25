<script lang="ts">
  import { page } from '$app/stores'
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  const { form } = $props()

  let code = $state('')
  let submitting = $state(false)

  onMount(() => {
    code = $page.url.searchParams.get('code') ?? ''
  })

  function normalizeCode(value: string) {
    return value.replace(/\s+/g, '').toUpperCase().slice(0, 6)
  }
</script>

<svelte:head>
  <title>Join Group · noPlans</title>
</svelte:head>

<main class="relative min-h-screen overflow-hidden bg-neutral-50 px-5 py-12 text-neutral-900 dark:bg-neutral-950 dark:text-white">
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl"></div>
    <div class="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl"></div>
  </div>

  <div class="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col justify-center">
    <a
      href="/"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-300"
    >
      <span>←</span>
      <span>Back</span>
    </a>

    <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-black/5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900">
          <span class="text-3xl">🔗</span>
        </div>

        <div class="mb-2 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          Join
        </div>

        <h1 class="text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          Join a group
        </h1>
        <p class="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          Enter the invite code your friend shared.
        </p>
      </div>

      <div class="mb-4 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 text-sm text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
        Invite codes are 6 uppercase characters.
      </div>

      <form
        method="POST"
        action="/?/joinGroup"
        use:enhance={() => {
        submitting = true

        return async ({ result, update }) => {
          submitting = false

          if (result.type === 'redirect') {
            goto(result.location)
            return
          }

          if (result.type === 'success') {
            const data = result.data as {
              group?: {
                id: string
              }
            }

            if (data?.group?.id) {
              goto(`/group/${data.group.id}`)
              return
            }
          }

          await update()
        }
      }}
      >
        <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Invite code
        </label>

        <input
          type="text"
          name="code"
          bind:value={code}
          oninput={(e) => {
            code = normalizeCode((e.currentTarget as HTMLInputElement).value)
          }}
          placeholder="ABC123"
          maxlength="6"
          inputmode="latin"
          autocomplete="one-time-code"
          autocapitalize="characters"
          spellcheck="false"
          required
          class="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-center text-xl font-bold tracking-[0.35em] uppercase text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-950 dark:focus:ring-violet-500/20"
        />

        <div class="mt-3 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
          <span>{code.length}/6</span>
          <span>{code ? code : '------'}</span>
        </div>

        {#if form?.joinError}
          <div class="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {form.joinError}
          </div>
        {/if}

        <button
          type="submit"
          disabled={submitting || code.length !== 6}
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {#if submitting}
            <svg
              class="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>Checking...</span>
          {:else}
            <span>Join group</span>
          {/if}
        </button>
      </form>
    </section>

    <p class="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
      No account needed · Works on any device
    </p>
  </div>
</main>