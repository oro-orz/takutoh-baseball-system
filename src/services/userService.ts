import { supabase } from './supabase'
import { User, Player } from '../types'

export interface SupabaseUser {
  id: string
  pin: string
  name: string
  line_id?: string
  role: 'admin' | 'coach' | 'player' | 'parent'
  players: Player[]
  default_car_capacity?: number
  default_equipment_car: boolean
  default_umpire: boolean
  created_at: string
  updated_at: string
}

export const userService = {
  // ユーザー一覧を取得
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('ユーザー一覧の取得に失敗しました:', error)
      throw error
    }

    // Supabaseのデータをアプリケーションの型に変換
    return (data || []).map((u: SupabaseUser) => ({
      id: u.id,
      pin: u.pin,
      name: u.name,
      role: u.role,
      lineId: u.line_id,
      players: u.players || [],
      defaultCarCapacity: u.default_car_capacity || 0,
      defaultEquipmentCar: u.default_equipment_car,
      defaultUmpire: u.default_umpire
    }))
  },

  // PINでユーザーを取得
  async getUserByPin(pin: string): Promise<User | null> {
    console.log('🔍 getUserByPin called with PIN:', pin);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('pin', pin)
      .single()

    console.log('🔍 Supabase response:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない場合
        console.log('🔍 No user found with PIN:', pin);
        return null
      }
      console.error('PINによるユーザー取得に失敗しました:', error)
      throw error
    }

    console.log('🔍 User found:', data);

    // Supabaseのデータをアプリケーションの型に変換
    return {
      id: data.id,
      pin: data.pin,
      name: data.name,
      role: data.role,
      is_admin: data.is_admin,
      lineId: data.line_id,
      players: data.players || [],
      defaultCarCapacity: data.default_car_capacity || 0,
      defaultEquipmentCar: data.default_equipment_car || false,
      defaultUmpire: data.default_umpire || false
    }
  },

  // ユーザーを作成
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const supabaseUser = {
      pin: user.pin,
      name: user.name,
      line_id: user.lineId,
      role: user.role,
      players: user.players,
      default_car_capacity: user.defaultCarCapacity,
      default_equipment_car: user.defaultEquipmentCar,
      default_umpire: user.defaultUmpire
    }

    const { data, error } = await supabase
      .from('users')
      .insert([supabaseUser])
      .select()
      .single()

    if (error) {
      console.error('ユーザー作成に失敗しました:', error)
      throw error
    }

    // Supabaseのデータをアプリケーションの型に変換
    return {
      id: data.id,
      pin: data.pin,
      name: data.name,
      role: data.role,
      lineId: data.line_id,
      players: data.players || [],
      defaultCarCapacity: data.default_car_capacity || 0,
      defaultEquipmentCar: data.default_equipment_car,
      defaultUmpire: data.default_umpire
    }
  },

  // ユーザーを更新
  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const supabaseUser = {
      pin: user.pin,
      name: user.name,
      line_id: user.lineId,
      role: user.role,
      players: user.players,
      default_car_capacity: user.defaultCarCapacity,
      default_equipment_car: user.defaultEquipmentCar,
      default_umpire: user.defaultUmpire
    }

    const { data, error } = await supabase
      .from('users')
      .update(supabaseUser)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('ユーザー更新に失敗しました:', error)
      throw error
    }

    // Supabaseのデータをアプリケーションの型に変換
    return {
      id: data.id,
      pin: data.pin,
      name: data.name,
      role: data.role,
      lineId: data.line_id,
      players: data.players || [],
      defaultCarCapacity: data.default_car_capacity || 0,
      defaultEquipmentCar: data.default_equipment_car,
      defaultUmpire: data.default_umpire
    }
  },

  // ユーザーを削除
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('ユーザー削除に失敗しました:', error)
      throw error
    }
  }
}
