import { supabase } from '../lib/supabase'

export interface User {
  id: string
  pin: string
  name: string
  line_id?: string
  role: 'admin' | 'coach' | 'player' | 'parent'
  players: any[] // 選手情報の配列
  created_at: string
  updated_at: string
}

export const userService = {
  // ユーザー一覧を取得
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return data || []
  },

  // PINでユーザーを取得
  async getUserByPin(pin: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('pin', pin)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない場合
        return null
      }
      console.error('Error fetching user by pin:', error)
      throw error
    }

    return data
  },

  // ユーザーを作成
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('app_users')
      .insert([user])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return data
  },

  // ユーザーを更新
  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('app_users')
      .update(user)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return data
  },

  // ユーザーを削除
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}
