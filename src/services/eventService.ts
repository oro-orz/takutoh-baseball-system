import { supabase } from '../lib/supabase'
import { Event } from '../types'

export const eventService = {
  // イベント一覧を取得
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }

    return data || []
  },

  // イベントを作成
  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      throw error
    }

    return data
  },

  // イベントを更新
  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      throw error
    }

    return data
  },

  // イベントを削除
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // イベントをIDで取得
  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return null
    }

    return data
  }
}
