import { supabase } from '../lib/supabase'

export interface GameRecord {
  id: string
  event_id: string
  opponent?: string
  our_score?: number
  opponent_score?: number
  details?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export const gameRecordService = {
  // 試合記録一覧を取得
  async getGameRecords(): Promise<GameRecord[]> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching game records:', error)
      throw error
    }

    return data || []
  },

  // イベントの試合記録を取得
  async getGameRecordByEvent(eventId: string): Promise<GameRecord | null> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (error) {
      console.error('Error fetching game record:', error)
      return null
    }

    return data
  },

  // 試合記録を作成
  async createGameRecord(gameRecord: Omit<GameRecord, 'id' | 'created_at' | 'updated_at'>): Promise<GameRecord> {
    const { data, error } = await supabase
      .from('game_records')
      .insert([gameRecord])
      .select()
      .single()

    if (error) {
      console.error('Error creating game record:', error)
      throw error
    }

    return data
  },

  // 試合記録を更新
  async updateGameRecord(id: string, gameRecord: Partial<GameRecord>): Promise<GameRecord> {
    const { data, error } = await supabase
      .from('game_records')
      .update(gameRecord)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating game record:', error)
      throw error
    }

    return data
  },

  // 試合記録を削除
  async deleteGameRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('game_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting game record:', error)
      throw error
    }
  }
}
