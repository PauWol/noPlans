export type Activity = {
  id: string
  group_id: string
  title: string
  emoji: string
  votes: number
  tag?: string
  _pending?: boolean
}