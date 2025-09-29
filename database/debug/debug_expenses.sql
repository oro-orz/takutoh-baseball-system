SELECT id, user_id, amount, status, paid_at, user:users!expenses_user_id_fkey(name) FROM expenses WHERE status = 'approved' ORDER BY created_at DESC LIMIT 10;
