<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'

  let { open = $bindable(false), groups = [] } = $props()

  const dispatch = createEventDispatcher()
  let query = $state('')

  let filtered = $derived(
    groups.filter((g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.invite_code.toLowerCase().includes(query.toLowerCase())
    )
  )

  function select(group: any) {
    dispatch('select', group)
    open = false
  }

  function close() {
    open = false
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6"
    role="dialog"
    aria-modal="true"
    aria-labelledby="group-picker-title"
  >
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onclick={close}
      aria-hidden="true"
    ></div>

    <div
      class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-neutral-950"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between gap-4 border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-800">
        <div>
          <div class="mb-1 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            Your groups
          </div>
          <h2 id="group-picker-title" class="text-lg font-bold text-neutral-900 dark:text-white">
            Pick a group
          </h2>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Search by name or invite code.
          </p>
        </div>

        <button
          class="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          onclick={close}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="p-5">
        <div class="relative mb-4">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            🔎
          </span>
          <input
            bind:value={query}
            placeholder="Search groups..."
            class="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-950 dark:focus:ring-violet-500/20"
          />
        </div>

        <div class="max-h-[22rem] space-y-2 overflow-y-auto pr-1 pt-1 pb-1 overscroll-contain">
          {#each filtered as group (group.id)}
            <button
              class="group w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:border-violet-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-violet-700"
              onclick={() => select(group)}
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="font-semibold text-neutral-900 transition group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
                    {group.name}
                  </div>
                  <div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Invite code
                  </div>
                </div>

                <div class="rounded-full bg-neutral-100 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  {group.invite_code}
                </div>
              </div>
            </button>
          {/each}

          {#if filtered.length === 0}
            <div class="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
              <div class="text-2xl">😕</div>
              <p class="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                No groups found
              </p>
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Try another name or code.
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}