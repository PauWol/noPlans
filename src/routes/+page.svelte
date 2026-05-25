<script lang="ts">
    import { enhance } from '$app/forms'
    import { goto } from '$app/navigation'
    import GroupPickerModal from '$lib/components/GroupPickerModal.svelte'
    import { addStoredGroup, getStoredGroups, type StoredGroup } from '$lib/groups'
    import { onMount } from 'svelte'

    const { form } = $props()

    let groupName = $state('')
    let creating = $state(false)
    let groups = $state<StoredGroup[]>([])
    let showPicker = $state(false)
    let checking = $state(false)
    let joinCode = $state('')

    onMount(() => {
        groups = getStoredGroups()
    })

    function openPicker() {
        if (groups.length > 0) showPicker = true
    }
</script>

<svelte:head>
  <title>noPlans — Stop deciding, start doing</title>
  <meta name="description" content="Stop spending 45 minutes deciding what to do." />
</svelte:head>

<main class="relative min-h-screen overflow-hidden bg-neutral-50 px-5 py-12 text-neutral-900 dark:bg-neutral-950 dark:text-white">
  <!-- soft background glow -->
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl"></div>
    <div class="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl"></div>
  </div>

  <div class="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
    <!-- Header -->
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900">
        <span class="text-3xl">🎯</span>
      </div>

      <h1 class="text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
        no<span class="text-violet-600 dark:text-violet-400">Plans</span>
      </h1>

      <p class="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
        Stop spending 45 minutes deciding what to do.
      </p>
    </div>

    {#if groups.length > 0}
      <button
        onclick={openPicker}
        class="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:-translate-y-[1px] hover:bg-violet-100 hover:shadow-md dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/15"
      >
        <span>📁</span>
        Open your groups ({groups.length})
      </button>
    {/if}

    <!-- Create Group Card -->
    <section class="mb-4 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-black/5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div class="mb-4">
        <div class="mb-1 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          Create
        </div>
        <h2 class="text-lg font-bold text-neutral-900 dark:text-white">Create a group</h2>
      </div>

      <form
        method="POST"
        action="?/createGroup"
        use:enhance={() => {
          creating = true

          return async ({ result, update }) => {
            creating = false

            if (result.type === 'success') {
              const data = result.data as { group: StoredGroup }
              const group = data.group

              addStoredGroup(group)
              goto(`/group/${group.id}`)
            } else {
              await update()
            }
          }
        }}
      >
        <div class="flex gap-2">
          <input
            type="text"
            name="name"
            bind:value={groupName}
            placeholder="Weekend Crew 🍕"
            required
            maxlength="40"
            class="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-950 dark:focus:ring-violet-500/20"
          />
          <button
            type="submit"
            disabled={creating || !groupName.trim()}
            class="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            {creating ? '...' : 'Create'}
          </button>
        </div>
      </form>

      {#if form?.createError}
        <p class="mt-3 text-sm text-red-500">{form.createError}</p>
      {/if}
    </section>

    <!-- Divider -->
    <div class="flex items-center gap-3 px-1 py-2">
      <div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
      <span class="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">or</span>
      <div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
    </div>

    <!-- Join Group -->
    <section class="mt-2 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-black/5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div class="mb-4">
        <div class="mb-1 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          Join
        </div>
        <h2 class="text-lg font-bold text-neutral-900 dark:text-white">Join a group</h2>
      </div>

      <form
  method="POST"
  action="?/joinGroup"
  use:enhance={() => {
    checking = true

    return async ({ result, update }) => {
      checking = false

      if (result.type === 'success') {
        const data = result.data as { group: StoredGroup }
        const group = data.group

        addStoredGroup(group)
        goto(`/group/${group.id}`)
      } else {
        await update()
      }
    }
  }}
>
  <div class="flex gap-2">
    <input
      type="text"
      name="code"
      bind:value={joinCode}
      placeholder="Enter invite code"
      required
      maxlength="6"
      autocomplete="off"
      class="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-950 dark:focus:ring-violet-500/20"
    />

    <button
      type="submit"
      disabled={checking || !joinCode.trim()}
      class="inline-flex min-w-[96px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-400"
    >
      {#if checking}
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

        <span>Checking</span>
      {:else}
        <span>Join</span>
      {/if}
    </button>
  </div>
</form>

      {#if form?.joinError}
        <p class="mt-3 text-sm text-red-500">{form.joinError}</p>
      {/if}
    </section>

    <p class="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
      Share the link · No account needed · Works on any device
    </p>
  </div>
</main>

<GroupPickerModal
  bind:open={showPicker}
  {groups}
  on:select={(e) => {
    const group = e.detail
    goto(`/group/${group.id}`)
  }}
/>