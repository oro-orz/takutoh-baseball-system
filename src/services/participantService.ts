import { supabase } from '../lib/supabase'

export interface Participant {
  id: string
  name: string
  role: 'player' | 'coach' | 'parent'
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  created_at: string
  updated_at: string
}

export const participantService = {
  // 参加者一覧を取得
  async getParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching participants:', error)
      throw error
    }

    return data || []
  },

  // 参加者を作成
  async createParticipant(participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .insert([participant])
      .select()
      .single()

    if (error) {
      console.error('Error creating participant:', error)
      throw error
    }

    return data
  },

  // 参加者を更新
  async updateParticipant(id: string, participant: Partial<Participant>): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .update(participant)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating participant:', error)
      throw error
    }

    return data
  },

  // 参加者を削除
  async deleteParticipant(id: string): Promise<void> {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting participant:', error)
      throw error
    }
  }
}
