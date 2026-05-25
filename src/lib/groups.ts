export type StoredGroup = {
  id: string
  name: string
  invite_code: string
}

const KEY = 'noplan_groups'

export function getStoredGroups(): StoredGroup[] {
  if (typeof localStorage === 'undefined') return []
  return JSON.parse(localStorage.getItem(KEY) || '[]')
}

export function addStoredGroup(group: StoredGroup) {
  const groups = getStoredGroups()

  const filtered = groups.filter(g => g.id !== group.id)

  filtered.unshift(group)

  localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, 10)))
}