-- playersカラムを追加してから、保護者＋選手データを挿入

-- 1. 現在のusersテーブル構造の確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'pin', 'name', 'email', 'role', 'players')
ORDER BY ordinal_position;

-- 2. playersカラムが存在しない場合、追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS players JSONB DEFAULT '[]'::jsonb;

-- 3. 他の必要なカラムも追加（存在しない場合）
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_car_capacity INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_equipment_car BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_umpire BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 4. 確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('players', 'default_car_capacity', 'default_equipment_car', 'default_umpire', 'line_id')
ORDER BY ordinal_position;
