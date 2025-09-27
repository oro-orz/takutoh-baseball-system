-- ユーザーテーブル
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  line_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'player', 'parent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベントテーブル
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('practice', 'practice_game', 'official_game', 'other', 'cancelled', 'postponed')),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  description TEXT,
  parking TEXT,
  opponent TEXT,
  items TEXT[], -- 持ち物の配列
  files JSONB, -- ファイル情報のJSON
  event_name TEXT, -- 大会名
  participants TEXT[], -- 参加部員の配列
  meeting_time TIME, -- 集合時間
  schedule TEXT, -- 当日予定
  clothing TEXT[], -- 服装の配列
  preparation TEXT, -- 準備物
  lunch TEXT CHECK (lunch IN ('required', 'not_required')), -- 昼食
  tea_garbage_duty TEXT, -- お茶・ゴミ当番
  equipment_bench_support TEXT, -- 道具車・ベンチサポート
  reference TEXT, -- 参考事項
  cancellation_reason TEXT, -- 中止・延期理由
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 参加者テーブル
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('player', 'coach', 'parent')),
  parent_name TEXT,
  parent_line_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 参加状況テーブル
CREATE TABLE participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'undecided')),
  parent_participation TEXT,
  car_capacity INTEGER DEFAULT 0,
  equipment_car BOOLEAN DEFAULT FALSE,
  umpire BOOLEAN DEFAULT FALSE,
  transport TEXT CHECK (transport IN ('can_transport', 'cannot_transport')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 試合記録テーブル
CREATE TABLE game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  opponent TEXT,
  our_score INTEGER,
  opponent_score INTEGER,
  details TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ファイルテーブル
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  game_record_id UUID REFERENCES game_records(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_participations_event_id ON participations(event_id);
CREATE INDEX idx_participations_player_id ON participations(player_id);
CREATE INDEX idx_game_records_event_id ON game_records(event_id);
CREATE INDEX idx_files_event_id ON files(event_id);
CREATE INDEX idx_files_game_record_id ON files(game_record_id);

-- RLS (Row Level Security) の設定（テスト用に無効化）
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- 基本的なポリシー（全員が読み取り可能、管理者のみ書き込み可能）
-- CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
-- CREATE POLICY "Anyone can read participants" ON participants FOR SELECT USING (true);
-- CREATE POLICY "Anyone can read participations" ON participations FOR SELECT USING (true);
-- CREATE POLICY "Anyone can read game_records" ON game_records FOR SELECT USING (true);

-- CREATE POLICY "Only admins can modify events" ON events FOR ALL USING (
--   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
-- );

-- CREATE POLICY "Only admins can modify participants" ON participants FOR ALL USING (
--   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
-- );

-- CREATE POLICY "Only admins can modify participations" ON participations FOR ALL USING (
--   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
-- );

-- CREATE POLICY "Only admins can modify game_records" ON game_records FOR ALL USING (
--   EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
-- );
