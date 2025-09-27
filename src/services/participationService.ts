import { supabase } from '../lib/supabase'

export interface Participation {
  id: string
  event_id: string
  player_id: string
  status: 'attending' | 'not_attending' | 'undecided'
  parent_participation: 'attending' | 'not_attending' | 'undecided' | string
  car_capacity?: number
  equipment_car: boolean
  umpire: boolean
  transport?: 'can_transport' | 'cannot_transport'
  comment?: string
  created_at: string
  updated_at: string
}

export const participationService = {
  // 全参加状況を取得
  async getParticipations(): Promise<Participation[]> {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('参加状況一覧の取得に失敗しました:', error)
      throw error
    }

    return data || []
  },

  // イベントの参加状況を取得
  async getParticipationsByEvent(eventId: string): Promise<Participation[]> {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('event_id', eventId)

    if (error) {
      console.error('参加状況一覧の取得に失敗しました:', error)
      throw error
    }

    return data || []
  },

  // イベントと選手の参加状況を取得
  async getParticipationsByEventAndPlayer(eventId: string, playerId: string): Promise<Participation[]> {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('event_id', eventId)
      .eq('player_id', playerId)

    if (error) {
      console.error('参加状況一覧の取得に失敗しました:', error)
      throw error
    }

    return data || []
  },

  // 参加状況を作成
  async createParticipation(participation: Omit<Participation, 'id' | 'created_at' | 'updated_at'>): Promise<Participation> {
    const { data, error } = await supabase
      .from('participations')
      .insert([participation])
      .select()
      .single()

    if (error) {
      console.error('参加状況作成に失敗しました:', error)
      throw error
    }

    return data
  },

  // 参加状況を更新
  async updateParticipation(id: string, participation: Partial<Participation>): Promise<Participation> {
    const { data, error } = await supabase
      .from('participations')
      .update(participation)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('参加状況更新に失敗しました:', error)
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
      console.error('参加状況削除に失敗しました:', error)
      throw error
    }
  }
}
