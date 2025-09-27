-- eventsテーブルにcancellationReasonカラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
