-- 現在のデータ確認 STEP3: 同姓保護者の確認
SELECT 
  LEFT(name, 2) as family_name,
  COUNT(*) as count,
  STRING_AGG(name || '(' || pin || ')', ', ') as same_family_parents
FROM users 
WHERE role = 'parent'
GROUP BY LEFT(name, 2)
ORDER BY count DESC, family_name
