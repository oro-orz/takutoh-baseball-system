-- ユーザーテーブル
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
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
  time TIME,
  location TEXT,
  description TEXT,
  parking TEXT,
  opponent TEXT,
  our_score INTEGER,
  opponent_score INTEGER,
  details TEXT,
  parent_bench_support TEXT,
  reference TEXT,
  cancellation_reason TEXT,
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
  parent_email TEXT,
  parent_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 参加状況テーブル
CREATE TABLE participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'maybe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
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

-- インデックス作成
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_participations_event_id ON participations(event_id);
CREATE INDEX idx_participations_participant_id ON participations(participant_id);
CREATE INDEX idx_game_records_event_id ON game_records(event_id);

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
