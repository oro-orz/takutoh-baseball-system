import { supabase } from '../lib/supabase'

export interface FileRecord {
  id: string
  name: string
  size: number
  type: string
  url: string
  event_id?: string
  game_record_id?: string
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export const fileService = {
  // ファイル一覧を取得
  async getFiles(): Promise<FileRecord[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('ファイル一覧の取得に失敗しました:', error)
      throw error
    }

    return data || []
  },

  // イベントのファイルを取得
  async getFilesByEvent(eventId: string): Promise<FileRecord[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('イベント別ファイルの取得に失敗しました:', error)
      throw error
    }

    return data || []
  },

  // 試合記録のファイルを取得
  async getFilesByGameRecord(gameRecordId: string): Promise<FileRecord[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('game_record_id', gameRecordId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('試合記録別ファイルの取得に失敗しました:', error)
      throw error
    }

    return data || []
  },

  // ファイルを作成
  async createFile(file: Omit<FileRecord, 'id' | 'created_at' | 'updated_at'>): Promise<FileRecord> {
    const { data, error } = await supabase
      .from('files')
      .insert([file])
      .select()
      .single()

    if (error) {
      console.error('ファイル作成に失敗しました:', error)
      throw error
    }

    return data
  },

  // ファイルを更新
  async updateFile(id: string, file: Partial<FileRecord>): Promise<FileRecord> {
    const { data, error } = await supabase
      .from('files')
      .update(file)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('ファイル更新に失敗しました:', error)
      throw error
    }

    return data
  },

  // ファイルを削除
  async deleteFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('ファイル削除に失敗しました:', error)
      throw error
    }
  }
}
