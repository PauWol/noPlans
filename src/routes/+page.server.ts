import { fail } from '@sveltejs/kit'
import { supabase } from '$lib/supabase'
import type { StoredGroup } from '$lib/groups'
import type { GroupReturn } from '$lib/types/actions'



export const actions = {
  createGroup: async ({ request }): Promise<GroupReturn | any>  => {
    const data = await request.formData()
    const name = data.get('name')?.toString().trim()

    if (!name) {
      return fail(400, { createError: 'Group name is required.' })
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name })
      .select('id, name, invite_code')
      .single()

    if (error || !group) {
      console.error(error)
      return fail(500, { createError: 'Could not create group. Try again.' })
    }

    return {
      success: true,
      group
    } as const
  },

  joinGroup: async ({ request }): Promise<GroupReturn | any>  => {
    const data = await request.formData()
    const code = data.get('code')?.toString().trim().toUpperCase()

    if (!code) {
      return fail(400, { joinError: 'Invite code is required.' })
    }

    const { data: group, error } = await supabase
      .from('groups')
      .select('id, name, invite_code')
      .eq('invite_code', code)
      .single()   

    if (error || !group) {
      return fail(404, {
        joinError: 'Group not found. Check the code and try again.'
      })
    }

    return {
      success: true,
      group
    } as const
  }
}