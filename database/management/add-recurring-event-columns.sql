-- eventsテーブルに定期イベント関連のカラムを追加

-- is_recurringカラムを追加
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- recurring_pattern_idカラムを追加
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS recurring_pattern_id UUID;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring);
CREATE INDEX IF NOT EXISTS idx_events_recurring_pattern_id ON events(recurring_pattern_id);

-- カラム追加の確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('is_recurring', 'recurring_pattern_id')
ORDER BY column_name;
