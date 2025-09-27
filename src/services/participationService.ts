import { supabase } from '../lib/supabase'

export interface Participation {
  id: string
  event_id: string
  participant_id: string
  status: 'attending' | 'not_attending' | 'maybe'
  created_at: string
  updated_at: string
}

export const participationService = {
  // イベントの参加状況を取得
  async getParticipationsByEvent(eventId: string): Promise<Participation[]> {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('event_id', eventId)

    if (error) {
      console.error('Error fetching participations:', error)
      throw error
    }

    return data || []
  },

  // 参加者の参加状況を取得
  async getParticipationsByParticipant(participantId: string): Promise<Participation[]> {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('participant_id', participantId)

    if (error) {
      console.error('Error fetching participations:', error)
      throw error
    }

    return data || []
  },

  // 参加状況を作成または更新
  async upsertParticipation(participation: Omit<Participation, 'id' | 'created_at' | 'updated_at'>): Promise<Participation> {
    const { data, error } = await supabase
      .from('participations')
      .upsert([participation], { onConflict: 'event_id,participant_id' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting participation:', error)
      throw error
    }

    return data
  },

  // 参加状況を削除
  async deleteParticipation(id: string): Promise<void> {
    const { error } = await supabase
      .from('participations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting participation:', error)
      throw error
    }
  }
}
