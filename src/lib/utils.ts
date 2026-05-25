/**
 * Picks an activity using weighted randomness.
 * Higher voted ideas are more likely, but any idea can win.
 * @param {Array<{id: string, votes: number}>} activities
 */
export function pickIdea(activities: any[]) {
  if (!activities.length) return null

  // Each activity gets (votes + 1) entries — so 0-vote ideas still have a shot
  const pool = activities.flatMap(activity =>
    Array(activity.votes + 1).fill(activity)
  )

  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Generates a random emoji for new activities if none provided
 */
export const EMOJI_SUGGESTIONS = [
  '🎳', '🍣', '🎮', '🎬', '🍕', '🎸', '🏀', '🧃',
  '🎲', '🍔', '🎤', '🛹', '🎨', '🏕️', '🍜', '🎯',
]

export function randomEmoji() {
  return EMOJI_SUGGESTIONS[Math.floor(Math.random() * EMOJI_SUGGESTIONS.length)]
}