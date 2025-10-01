// 祝日API連携サービス
export interface Holiday {
  date: string; // YYYY-MM-DD形式
  name: string;
}

export interface HolidayResponse {
  [date: string]: string; // "2024-01-01": "元日"
}

class HolidayService {
  private holidaysCache: Map<string, Holiday[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

  /**
   * 指定された年の祝日一覧を取得
   */
  async getHolidays(year: number): Promise<Holiday[]> {
    const cacheKey = year.toString();
    const now = Date.now();
    
    // キャッシュチェック
    if (this.holidaysCache.has(cacheKey) && 
        this.cacheExpiry.has(cacheKey) && 
        this.cacheExpiry.get(cacheKey)! > now) {
      return this.holidaysCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`https://holidays-jp.github.io/api/v1/${year}/date.json`);
      if (!response.ok) {
        throw new Error(`祝日API取得失敗: ${response.status}`);
      }
      
      const data: HolidayResponse = await response.json();
      const holidays: Holiday[] = Object.entries(data).map(([date, name]) => ({
        date,
        name
      }));

      // キャッシュに保存
      this.holidaysCache.set(cacheKey, holidays);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

      return holidays;
    } catch (error) {
      console.error('祝日取得エラー:', error);
      // エラー時は空配列を返す
      return [];
    }
  }

  /**
   * 指定された日付が祝日かどうかチェック
   */
  async isHoliday(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const holidays = await this.getHolidays(year);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    return holidays.some(holiday => holiday.date === dateStr);
  }

  /**
   * 指定された月の祝日一覧を取得
   */
  async getHolidaysInMonth(year: number, month: number): Promise<Holiday[]> {
    const holidays = await this.getHolidays(year);
    const monthStr = month.toString().padStart(2, '0');
    
    return holidays.filter(holiday => holiday.date.startsWith(`${year}-${monthStr}`));
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.holidaysCache.clear();
    this.cacheExpiry.clear();
  }
}

export const holidayService = new HolidayService();
