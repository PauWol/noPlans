import { error } from '@sveltejs/kit'
import { supabase } from '$lib/supabase'

export async function load({ params }) {
  const groupId = params.id

  const [groupResult, activitiesResult] = await Promise.all([
    supabase
      .from('groups')
      .select('id, name, invite_code')
      .eq('id', groupId)
      .single(),

    supabase
      .from('activities')
      .select('*')
      .eq('group_id', groupId)
      .order('votes', { ascending: false }),
  ])

  if (groupResult.error || !groupResult.data) {
    throw error(404, 'Group not found')
  }

  if (activitiesResult.error) {
    console.error('Activities load error:', activitiesResult.error)
  }

  return {
    group: groupResult.data,
    activities: activitiesResult.data ?? [],
  }
}