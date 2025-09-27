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
      console.error('イベント一覧の取得に失敗しました:', error)
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
    // 空の文字列をnullに変換するヘルパー関数
    const nullIfEmpty = (value: any) => {
      if (value === '' || value === undefined) return null;
      return value;
    };

    // 時間フィールド専用の変換関数
    const nullIfEmptyTime = (value: any) => {
      if (value === '' || value === undefined || value === null) return null;
      if (typeof value === 'string' && value.trim() === '') return null;
      return value;
    };

    // camelCase を snake_case に変換
    const dbEvent = {
      title: event.title,
      type: event.type,
      date: event.date,
      start_time: nullIfEmptyTime(event.startTime),
      end_time: nullIfEmptyTime(event.endTime),
      location: nullIfEmpty(event.location),
      opponent: nullIfEmpty(event.opponent),
      description: nullIfEmpty(event.description),
      items: event.items || [],
      parking: nullIfEmpty(event.parking),
      files: event.files || [],
      event_name: nullIfEmpty(event.eventName),
      participants: event.participants || [],
      meeting_time: nullIfEmpty(event.meetingTime),
      schedule: nullIfEmpty(event.schedule),
      clothing: event.clothing || [],
      preparation: nullIfEmpty(event.preparation),
      lunch: nullIfEmpty(event.lunch),
      tea_garbage_duty: nullIfEmpty(event.teaGarbageDuty),
      equipment_bench_support: nullIfEmpty(event.equipmentBenchSupport),
      reference: nullIfEmpty(event.reference),
      cancellation_reason: nullIfEmpty(event.cancellationReason)
    }

    // デバッグ: 送信データをログ出力
    console.log('Sending event data:', JSON.stringify(dbEvent, null, 2));

    const { data, error } = await supabase
      .from('events')
      .insert([dbEvent])
      .select()
      .single()

    if (error) {
      console.error('イベント作成に失敗しました:', error)
      console.error('エラー詳細:', JSON.stringify(error, null, 2))
      throw new Error(`イベント作成エラー: ${error.message || JSON.stringify(error)}`)
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
    // 空の文字列をnullに変換するヘルパー関数
    const nullIfEmpty = (value: any) => {
      if (value === '' || value === undefined) return null;
      return value;
    };

    // camelCase を snake_case に変換
    const dbEvent: any = {};
    if (event.title !== undefined) dbEvent.title = event.title;
    if (event.type !== undefined) dbEvent.type = event.type;
    if (event.date !== undefined) dbEvent.date = event.date;
    if (event.startTime !== undefined) dbEvent.start_time = nullIfEmpty(event.startTime);
    if (event.endTime !== undefined) dbEvent.end_time = nullIfEmpty(event.endTime);
    if (event.location !== undefined) dbEvent.location = nullIfEmpty(event.location);
    if (event.opponent !== undefined) dbEvent.opponent = nullIfEmpty(event.opponent);
    if (event.description !== undefined) dbEvent.description = nullIfEmpty(event.description);
    if (event.items !== undefined) dbEvent.items = event.items;
    if (event.parking !== undefined) dbEvent.parking = nullIfEmpty(event.parking);
    if (event.files !== undefined) dbEvent.files = event.files;
    if (event.eventName !== undefined) dbEvent.event_name = nullIfEmpty(event.eventName);
    if (event.participants !== undefined) dbEvent.participants = event.participants;
    if (event.meetingTime !== undefined) dbEvent.meeting_time = nullIfEmpty(event.meetingTime);
    if (event.schedule !== undefined) dbEvent.schedule = nullIfEmpty(event.schedule);
    if (event.clothing !== undefined) dbEvent.clothing = event.clothing;
    if (event.preparation !== undefined) dbEvent.preparation = nullIfEmpty(event.preparation);
    if (event.lunch !== undefined) dbEvent.lunch = nullIfEmpty(event.lunch);
    if (event.teaGarbageDuty !== undefined) dbEvent.tea_garbage_duty = nullIfEmpty(event.teaGarbageDuty);
    if (event.equipmentBenchSupport !== undefined) dbEvent.equipment_bench_support = nullIfEmpty(event.equipmentBenchSupport);
    if (event.reference !== undefined) dbEvent.reference = nullIfEmpty(event.reference);
    if (event.cancellationReason !== undefined) dbEvent.cancellation_reason = nullIfEmpty(event.cancellationReason);

    const { data, error } = await supabase
      .from('events')
      .update(dbEvent)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('イベント更新に失敗しました:', error)
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
      console.error('イベント削除に失敗しました:', error)
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
      console.error('イベント取得に失敗しました:', error)
      return null
    }

    return data
  }
}
