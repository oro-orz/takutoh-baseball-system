-- 定期イベントパターンテーブル
CREATE TABLE IF NOT EXISTS recurring_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'practice',
  
  -- 定期パターン設定
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=日曜, 1=月曜, ..., 6=土曜
  week_of_month INTEGER CHECK (week_of_month >= 1 AND week_of_month <= 4), -- 第1週=1, 第2週=2, 第3週=3, 第4週=4
  skip_holidays BOOLEAN DEFAULT true, -- 祝日をスキップするか
  
  -- 有効期間
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- メタデータ
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_recurring_patterns_active ON recurring_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_patterns_dates ON recurring_patterns(start_date, end_date);

-- コメント
COMMENT ON TABLE recurring_patterns IS '定期イベントパターン管理テーブル';
COMMENT ON COLUMN recurring_patterns.pattern_type IS '定期パターンタイプ: weekly=毎週, monthly=月次';
COMMENT ON COLUMN recurring_patterns.day_of_week IS '曜日: 0=日曜, 1=月曜, ..., 6=土曜';
COMMENT ON COLUMN recurring_patterns.week_of_month IS '月の第何週: 1=第1週, 2=第2週, 3=第3週, 4=第4週';
COMMENT ON COLUMN recurring_patterns.skip_holidays IS '祝日をスキップするかどうか';
