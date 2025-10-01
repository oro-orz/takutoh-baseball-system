-- 託麻東少年野球クラブの定期練習パターンを挿入
INSERT INTO recurring_patterns (
  title, 
  description, 
  location, 
  start_time, 
  end_time, 
  event_type, 
  pattern_type, 
  day_of_week, 
  week_of_month, 
  skip_holidays, 
  start_date, 
  is_active,
  created_by
) VALUES 
-- 第1月曜練習
(
  '練習（第1月曜）',
  '月1回の練習日',
  '託麻東小学校グラウンド',
  '16:30',
  '19:00',
  'practice',
  'monthly',
  1, -- 月曜
  1, -- 第1週
  true, -- 祝日スキップ
  '2024-01-01',
  true,
  (SELECT id FROM users WHERE pin = '9999' LIMIT 1) -- 管理者のID
),
-- 第3月曜練習
(
  '練習（第3月曜）',
  '月1回の練習日',
  '託麻東小学校グラウンド',
  '16:30',
  '19:00',
  'practice',
  'monthly',
  1, -- 月曜
  3, -- 第3週
  true, -- 祝日スキップ
  '2024-01-01',
  true,
  (SELECT id FROM users WHERE pin = '9999' LIMIT 1) -- 管理者のID
),
-- 毎週火曜練習
(
  '練習（毎週火曜）',
  '週1回の練習日',
  '託麻東小学校グラウンド',
  '16:30',
  '19:00',
  'practice',
  'weekly',
  2, -- 火曜
  NULL, -- 毎週なのでNULL
  true, -- 祝日スキップ
  '2024-01-01',
  true,
  (SELECT id FROM users WHERE pin = '9999' LIMIT 1) -- 管理者のID
),
-- 毎週木曜練習
(
  '練習（毎週木曜）',
  '週1回の練習日',
  '託麻東小学校グラウンド',
  '16:30',
  '19:00',
  'practice',
  'weekly',
  4, -- 木曜
  NULL, -- 毎週なのでNULL
  true, -- 祝日スキップ
  '2024-01-01',
  true,
  (SELECT id FROM users WHERE pin = '9999' LIMIT 1) -- 管理者のID
);
