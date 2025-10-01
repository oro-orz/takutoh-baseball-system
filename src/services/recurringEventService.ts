import { Event } from '../types';
import { holidayService } from './holidayService';
import { eventService } from './eventService';

export interface RecurringPattern {
  id: string;
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  eventType: 'practice' | 'game' | 'other';
  patternType: 'weekly' | 'monthly';
  dayOfWeek?: number; // 0=日曜, 1=月曜, ..., 6=土曜
  weekOfMonth?: number; // 1=第1週, 2=第2週, 3=第3週, 4=第4週
  skipHolidays: boolean;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

class RecurringEventService {
  /**
   * 指定された月の定期イベントを生成
   */
  async generateEventsForMonth(year: number, month: number): Promise<Event[]> {
    const patterns = await this.getActivePatterns();
    const events: Event[] = [];

    for (const pattern of patterns) {
      const patternEvents = await this.generateEventsForPattern(pattern, year, month);
      events.push(...patternEvents);
    }

    return events;
  }

  /**
   * 指定されたパターンで月のイベントを生成
   */
  private async generateEventsForPattern(
    pattern: RecurringPattern, 
    year: number, 
    month: number
  ): Promise<Event[]> {
    const events: Event[] = [];
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // 月末

    if (pattern.patternType === 'weekly') {
      // 毎週パターン
      const eventsForWeek = await this.generateWeeklyEvents(pattern, startDate, endDate);
      events.push(...eventsForWeek);
    } else if (pattern.patternType === 'monthly') {
      // 月次パターン（第1・第3月曜など）
      const eventsForMonth = await this.generateMonthlyEvents(pattern, startDate, endDate);
      events.push(...eventsForMonth);
    }

    return events;
  }

  /**
   * 毎週パターンのイベント生成
   */
  private async generateWeeklyEvents(
    pattern: RecurringPattern,
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    const events: Event[] = [];
    const dayOfWeek = pattern.dayOfWeek!;

    // 指定された曜日の最初の日を見つける
    const firstDay = new Date(startDate);
    while (firstDay.getDay() !== dayOfWeek) {
      firstDay.setDate(firstDay.getDate() + 1);
    }

    // 毎週同じ曜日でイベントを生成
    for (let date = new Date(firstDay); date <= endDate; date.setDate(date.getDate() + 7)) {
      if (await this.shouldSkipDate(date, pattern)) {
        continue;
      }

      const event = this.createEventFromPattern(pattern, date);
      events.push(event);
    }

    return events;
  }

  /**
   * 月次パターンのイベント生成（第1・第3月曜など）
   */
  private async generateMonthlyEvents(
    pattern: RecurringPattern,
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    const events: Event[] = [];
    const dayOfWeek = pattern.dayOfWeek!;
    const weekOfMonth = pattern.weekOfMonth!;

    // 指定された月の指定された週の指定された曜日を計算
    const targetDate = this.getNthWeekdayOfMonth(startDate.getFullYear(), startDate.getMonth(), dayOfWeek, weekOfMonth);
    
    if (targetDate && targetDate >= startDate && targetDate <= endDate) {
      if (!(await this.shouldSkipDate(targetDate, pattern))) {
        const event = this.createEventFromPattern(pattern, targetDate);
        events.push(event);
      }
    }

    return events;
  }

  /**
   * 月の第N週の指定された曜日を取得
   */
  private getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, weekOfMonth: number): Date | null {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 第1週の指定された曜日を見つける
    let firstWeekday = new Date(firstDay);
    while (firstWeekday.getDay() !== dayOfWeek) {
      firstWeekday.setDate(firstWeekday.getDate() + 1);
    }

    // 第N週の日付を計算
    const targetDate = new Date(firstWeekday);
    targetDate.setDate(firstWeekday.getDate() + (weekOfMonth - 1) * 7);

    // 月の範囲内かチェック
    if (targetDate.getMonth() === month && targetDate <= lastDay) {
      return targetDate;
    }

    return null;
  }

  /**
   * 日付をスキップするかどうか判定
   */
  private async shouldSkipDate(date: Date, pattern: RecurringPattern): Promise<boolean> {
    if (!pattern.skipHolidays) {
      return false;
    }

    return await holidayService.isHoliday(date);
  }

  /**
   * パターンからイベントオブジェクトを作成
   */
  private createEventFromPattern(pattern: RecurringPattern, date: Date): Event {
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      id: `recurring-${pattern.id}-${dateStr}`,
      title: pattern.title,
      description: pattern.description || '',
      date: dateStr,
      startTime: pattern.startTime,
      endTime: pattern.endTime,
      location: pattern.location,
      type: pattern.eventType,
      participants: ['all'], // デフォルトで全部員
      files: [],
      schedule: '',
      clothing: [],
      equipment: [],
      opponent: '',
      isRecurring: true,
      recurringPatternId: pattern.id
    };
  }

  /**
   * アクティブなパターンを取得（Supabaseから）
   */
  async getActivePatterns(): Promise<RecurringPattern[]> {
    // TODO: Supabaseから取得する実装
    // 現在はサンプルデータを返す
    return [
      {
        id: 'pattern-1',
        title: '練習（第1月曜）',
        location: '託麻東小学校グラウンド',
        startTime: '16:30',
        endTime: '19:00',
        eventType: 'practice',
        patternType: 'monthly',
        dayOfWeek: 1, // 月曜
        weekOfMonth: 1, // 第1週
        skipHolidays: true,
        startDate: '2024-01-01',
        isActive: true
      },
      {
        id: 'pattern-2',
        title: '練習（第3月曜）',
        location: '託麻東小学校グラウンド',
        startTime: '16:30',
        endTime: '19:00',
        eventType: 'practice',
        patternType: 'monthly',
        dayOfWeek: 1, // 月曜
        weekOfMonth: 3, // 第3週
        skipHolidays: true,
        startDate: '2024-01-01',
        isActive: true
      },
      {
        id: 'pattern-3',
        title: '練習（毎週火曜）',
        location: '託麻東小学校グラウンド',
        startTime: '16:30',
        endTime: '19:00',
        eventType: 'practice',
        patternType: 'weekly',
        dayOfWeek: 2, // 火曜
        skipHolidays: true,
        startDate: '2024-01-01',
        isActive: true
      },
      {
        id: 'pattern-4',
        title: '練習（毎週木曜）',
        location: '託麻東小学校グラウンド',
        startTime: '16:30',
        endTime: '19:00',
        eventType: 'practice',
        patternType: 'weekly',
        dayOfWeek: 4, // 木曜
        skipHolidays: true,
        startDate: '2024-01-01',
        isActive: true
      }
    ];
  }

  /**
   * 生成されたイベントをデータベースに保存
   */
  async saveGeneratedEvents(events: Event[]): Promise<void> {
    for (const event of events) {
      try {
        await eventService.createEvent(event);
      } catch (error) {
        console.error(`イベント保存エラー (${event.title}):`, error);
      }
    }
  }

  /**
   * 指定された月の定期イベントを生成して保存
   */
  async generateAndSaveEventsForMonth(year: number, month: number): Promise<number> {
    const events = await this.generateEventsForMonth(year, month);
    await this.saveGeneratedEvents(events);
    return events.length;
  }
}

export const recurringEventService = new RecurringEventService();
