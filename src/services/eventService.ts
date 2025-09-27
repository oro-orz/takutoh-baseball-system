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

    // snake_case を camelCase に変換
    return (data || []).map(event => ({
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date,
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location,
      opponent: event.opponent,
      description: event.description,
      items: event.items,
      parking: event.parking,
      files: event.files,
      eventName: event.event_name,
      participants: event.participants,
      meetingTime: event.meeting_time,
      schedule: event.schedule,
      clothing: event.clothing,
      preparation: event.preparation,
      lunch: event.lunch,
      teaGarbageDuty: event.tea_garbage_duty,
      equipmentBenchSupport: event.equipment_bench_support,
      reference: event.reference,
      cancellationReason: event.cancellation_reason
    }))
  },

  // イベントを作成
  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    // camelCase を snake_case に変換
    const dbEvent = {
      title: event.title,
      type: event.type,
      date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      opponent: event.opponent,
      description: event.description,
      items: event.items,
      parking: event.parking,
      files: event.files,
      event_name: event.eventName,
      participants: event.participants,
      meeting_time: event.meetingTime,
      schedule: event.schedule,
      clothing: event.clothing,
      preparation: event.preparation,
      lunch: event.lunch,
      tea_garbage_duty: event.teaGarbageDuty,
      equipment_bench_support: event.equipmentBenchSupport,
      reference: event.reference,
      cancellation_reason: event.cancellationReason
    }

    const { data, error } = await supabase
      .from('events')
      .insert([dbEvent])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      throw error
    }

    // snake_case を camelCase に変換して返す
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      opponent: data.opponent,
      description: data.description,
      items: data.items,
      parking: data.parking,
      files: data.files,
      eventName: data.event_name,
      participants: data.participants,
      meetingTime: data.meeting_time,
      schedule: data.schedule,
      clothing: data.clothing,
      preparation: data.preparation,
      lunch: data.lunch,
      teaGarbageDuty: data.tea_garbage_duty,
      equipmentBenchSupport: data.equipment_bench_support,
      reference: data.reference,
      cancellationReason: data.cancellation_reason
    }
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
