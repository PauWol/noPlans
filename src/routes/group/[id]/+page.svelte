<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { goto } from '$app/navigation'
  import { supabase } from '$lib/supabase'
  import type { RealtimeChannel } from '@supabase/supabase-js'
  import { pickIdea, randomEmoji, EMOJI_SUGGESTIONS } from '$lib/utils'
  import type { Activity } from '$lib/types.js'
  import GroupPickerModal from '$lib/components/GroupPickerModal.svelte'
  import { getStoredGroups, type StoredGroup } from '$lib/groups'

  const { data } = $props()

  let activities = $state<Activity[]>(data.activities)
  let group = $state(data.group)

  let groups = $state<StoredGroup[]>([])
  let showPicker = $state(false)

  let newTitle = $state('')
  let newEmoji = $state(randomEmoji())
  let addingActivity = $state(false)

  let showEmojiPicker = $state(false)
  let showModal = $state(false)
  let picked = $state<Activity | null>(null)
  let spinning = $state(false)
  let copied = $state(false)
  let channel: RealtimeChannel

  function refreshGroups() {
    groups = getStoredGroups()
  }

  function openGroupSwitcher() {
    refreshGroups()
    if (groups.length > 0) showPicker = true
  }

  function closeEmojiPicker() {
    showEmojiPicker = false
  }

  function chooseEmoji(emoji: string) {
    newEmoji = emoji
    showEmojiPicker = false
  }

  onMount(() => {
    refreshGroups()

    channel = supabase
      .channel(`group:${group.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `group_id=eq.${group.id}` },
        ({ eventType, new: next, old }) => {
          if (eventType === 'INSERT') {
            const exists = activities.some((a) => a.id === next.id)
            if (exists) return
            activities = [next, ...activities]
          } else if (eventType === 'UPDATE') {
            activities = activities.map((a) => (a.id === next.id ? next : a))
          } else if (eventType === 'DELETE') {
            activities = activities.filter((a) => a.id !== old.id)
          }
        }
      )
      .subscribe()
  })

  onDestroy(() => {
    channel?.unsubscribe()
  })

  async function addActivity() {
    const title = newTitle.trim()
    if (!title || addingActivity) return

    addingActivity = true

    const optimistic = {
      id: crypto.randomUUID(),
      group_id: group.id,
      title,
      emoji: newEmoji,
      votes: 0,
      _pending: true
    }

    activities = [optimistic, ...activities]
    newTitle = ''
    newEmoji = randomEmoji()
    closeEmojiPicker()

    const { data: inserted, error } = await supabase
      .from('activities')
      .insert({ group_id: group.id, title, emoji: optimistic.emoji })
      .select()
      .single()

    if (error) {
      activities = activities.filter((a) => a.id !== optimistic.id)
      alert('Could not add activity, try again.')
    } else {
      activities = activities.map((a) => (a.id === optimistic.id ? inserted : a))
    }

    addingActivity = false
  }

  async function vote(activity: Activity) {
    const previousVotes = activity.votes

    activities = activities.map((a) => (a.id === activity.id ? { ...a, votes: a.votes + 1 } : a))

    const { error } = await supabase
      .from('activities')
      .update({ votes: previousVotes + 1 })
      .eq('id', activity.id)

    if (error) {
      activities = activities.map((a) =>
        a.id === activity.id ? { ...a, votes: previousVotes } : a
      )
    }
  }

  async function deleteActivity(id: string) {
    activities = activities.filter((a) => a.id !== id)
    await supabase.from('activities').delete().eq('id', id)
  }

  function surpriseUs() {
    if (!activities.length) return
    spinning = true
    showModal = true

    setTimeout(() => {
      picked = pickIdea(activities)
      spinning = false
    }, 700)
  }

  function tryAgain() {
    spinning = true
    setTimeout(() => {
      picked = pickIdea(activities)
      spinning = false
    }, 500)
  }

  async function copyInvite() {
    const url = `${window.location.origin}/join?code=${group.invite_code}`
    await navigator.clipboard.writeText(url)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }

  const sorted = $derived([...activities].sort((a, b) => b.votes - a.votes))

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') addActivity()
    if (e.key === 'Escape') closeEmojiPicker()
  }
</script>

<svelte:head>
  <title>{group.name} · noPlans</title>
</svelte:head>

{#if showModal}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center"
    onclick={() => (showModal = false)}
  >
    <div class="absolute inset-0 bg-black/55 backdrop-blur-sm"></div>

    <div
      class="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white p-6 text-center shadow-2xl shadow-black/20 dark:bg-neutral-950 animate-in fade-in zoom-in-95 duration-200"
      onclick={(e) => e.stopPropagation()}
    >
      {#if spinning}
        <div class="py-10">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-5xl dark:bg-violet-500/10">
            🎲
          </div>
          <p class="mt-5 text-lg font-semibold text-neutral-700 dark:text-neutral-200">
            Picking something...
          </p>
        </div>
      {:else if picked}
        <div class="mb-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          Tonight
        </div>

        <div class="mb-3 text-6xl">{picked.emoji}</div>
        <h2 class="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          {picked.title}
        </h2>

        {#if picked.votes > 0}
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            👍 {picked.votes} vote{picked.votes !== 1 ? 's' : ''}
          </p>
        {:else}
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Wild card pick!
          </p>
        {/if}

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            onclick={() => (showModal = false)}
            class="flex-1 rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Let’s go! 🚀
          </button>
          <button
            type="button"
            onclick={tryAgain}
            class="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-violet-700 dark:hover:text-violet-300"
          >
            Again
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<div class="relative min-h-screen overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-white">
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl"></div>
    <div class="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl"></div>
  </div>

  <div class="relative mx-auto flex min-h-screen max-w-lg flex-col pb-36">
    <header class="sticky top-0 z-20 border-b border-white/60 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-1 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            Group
          </div>
          <h1 class="truncate text-lg font-extrabold tracking-tight text-neutral-950 dark:text-white">
            {group.name}
          </h1>
          <p class="text-xs text-neutral-400">
            {activities.length} idea{activities.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div class="flex items-center gap-2">
          {#if groups.length > 0}
            <button
              type="button"
              onclick={openGroupSwitcher}
              class="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-100 hover:text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/15"
            >
              🔁 Switch
            </button>
          {/if}

          <button
            type="button"
            onclick={copyInvite}
            class="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-violet-700 dark:hover:text-violet-300"
          >
            {#if copied}
              ✅ Copied
            {:else}
              🔗 Invite {group.invite_code}
            {/if}
          </button>
        </div>
      </div>
    </header>

    <div class="px-4 pt-5">
      <button
        type="button"
        onclick={surpriseUs}
        disabled={activities.length === 0}
        class="flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-5 text-xl font-extrabold text-white shadow-lg shadow-violet-500/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span class="text-2xl">🎲</span>
        <span>Surprise Us</span>
      </button>

      {#if activities.length === 0}
        <p class="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Add some ideas first 👇
        </p>
      {/if}
    </div>

    <div class="flex-1 px-4 pt-5">
      <div class="space-y-2">
        {#each sorted as activity (activity.id)}
          <article
            class="group flex items-center gap-3 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm shadow-black/5 backdrop-blur-md transition hover:-translate-y-[1px] hover:border-violet-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950/90 dark:hover:border-violet-700"
            class:opacity-60={activity._pending}
          >
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-2xl dark:bg-neutral-800">
              {activity.emoji}
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-neutral-900 dark:text-white">
                {activity.title}
              </p>

              {#if activity.tag}
                <span class="mt-1 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  {activity.tag}
                </span>
              {/if}
            </div>

            <button
              type="button"
              onclick={() => vote(activity)}
              disabled={!!activity._pending}
              class="flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              title="Upvote"
            >
              <span class="text-lg">👍</span>
              <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {activity.votes}
              </span>
            </button>

            <button
              type="button"
              onclick={() => deleteActivity(activity.id)}
              class="rounded-2xl px-2 text-lg text-neutral-300 opacity-0 transition hover:text-red-400 group-hover:opacity-100 dark:text-neutral-600 dark:hover:text-red-300"
              title="Remove"
            >
              ×
            </button>
          </article>
        {:else}
          <div class="rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/70">
            <div class="text-5xl">🤷</div>
            <p class="mt-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              No ideas yet
            </p>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Be the first to add one!
            </p>
          </div>
        {/each}
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 z-20 border-t border-white/60 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/85">
      <div class="mx-auto flex max-w-lg items-center gap-2">
        <div class="relative">
          <button
            type="button"
            onclick={() => (showEmojiPicker = !showEmojiPicker)}
            class="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100 text-2xl transition active:scale-95 dark:border-neutral-800 dark:bg-neutral-900"
            aria-label="Choose emoji"
          >
            {newEmoji}
          </button>

          {#if showEmojiPicker}
            <div
              class="absolute bottom-14 left-0 z-30 w-[17rem] rounded-3xl border border-white/70 bg-white p-3 shadow-2xl shadow-black/10 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950"
              onclick={(e) => e.stopPropagation()}
              onkeydown={handleKeydown}
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                  Pick an emoji
                </p>
                <button
                  type="button"
                  onclick={closeEmojiPicker}
                  class="rounded-full px-2 py-1 text-xs font-semibold text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  Close
                </button>
              </div>

              <div class="max-h-72 overflow-y-auto pr-1">
                <div class="grid grid-cols-8 gap-1">
                  {#each EMOJI_SUGGESTIONS as emoji}
                    <button
                      type="button"
                      onclick={() => chooseEmoji(emoji)}
                      class="flex h-8 w-8 items-center justify-center rounded-lg text-xl transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      aria-label={`Choose ${emoji}`}
                    >
                      {emoji}
                    </button>
                  {/each}
                </div>
              </div>
            </div>

            <div class="fixed inset-0 z-20" onclick={closeEmojiPicker}></div>
          {/if}
        </div>

        <input
          type="text"
          bind:value={newTitle}
          onkeydown={handleKeydown}
          placeholder="Add an idea..."
          maxlength="60"
          class="h-12 flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-950 dark:focus:ring-violet-500/20"
        />

        <button
          type="button"
          onclick={addActivity}
          disabled={!newTitle.trim() || addingActivity}
          class="inline-flex h-12 items-center justify-center rounded-2xl bg-neutral-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</div>

<GroupPickerModal
  bind:open={showPicker}
  {groups}
  on:select={(e) => {
    const selected = e.detail
    goto(`/group/${selected.id}`)
  }}
/>