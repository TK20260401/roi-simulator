-- ROI Simulator マイグレーション
-- ① operator_count カラム追加
-- ② monthly_api_cost カラム追加
-- 既存データとの後方互換性: DEFAULT 0, NULL許容

-- ===========================================
-- 1. テーブルにカラム追加
-- ===========================================

ALTER TABLE simulations
  ADD COLUMN IF NOT EXISTS operator_count NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_api_cost NUMERIC DEFAULT 0;

-- ===========================================
-- 2. insert_simulation RPC関数を更新
--    新パラメータ p_operator_count, p_monthly_api_cost を追加
-- ===========================================

CREATE OR REPLACE FUNCTION insert_simulation(
  p_name TEXT,
  p_company_name TEXT DEFAULT NULL,
  p_created_by_name TEXT DEFAULT NULL,
  p_operator_count NUMERIC DEFAULT 0,
  p_operator_cost NUMERIC DEFAULT 0,
  p_person_month_cost NUMERIC DEFAULT 0,
  p_monthly_calls NUMERIC DEFAULT 0,
  p_avg_call_time NUMERIC DEFAULT 0,
  p_system_cost NUMERIC DEFAULT 0,
  p_training_cost NUMERIC DEFAULT 0,
  p_other_cost NUMERIC DEFAULT 0,
  p_initial_investment NUMERIC DEFAULT 0,
  p_monthly_ai_cost NUMERIC DEFAULT 0,
  p_monthly_api_cost NUMERIC DEFAULT 0,
  p_automation_rate NUMERIC DEFAULT 0,
  p_headcount_reduction NUMERIC DEFAULT 0,
  p_training_reduction_rate NUMERIC DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO simulations (
    name, company_name, created_by_name,
    operator_count, operator_cost, person_month_cost,
    monthly_calls, avg_call_time,
    system_cost, training_cost, other_cost,
    initial_investment, monthly_ai_cost, monthly_api_cost,
    automation_rate, headcount_reduction, training_reduction_rate
  ) VALUES (
    p_name, p_company_name, p_created_by_name,
    p_operator_count, p_operator_cost, p_person_month_cost,
    p_monthly_calls, p_avg_call_time,
    p_system_cost, p_training_cost, p_other_cost,
    p_initial_investment, p_monthly_ai_cost, p_monthly_api_cost,
    p_automation_rate, p_headcount_reduction, p_training_reduction_rate
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- ===========================================
-- 3. get_simulation_by_id / get_simulations は
--    SELECT * を返すため、カラム追加だけで自動的に
--    新フィールドが含まれます。
--    ただし明示的にカラムを列挙している場合は更新が必要です。
-- ===========================================

-- 確認用: 既存データの operator_count を逆算で埋める（任意）
-- UPDATE simulations
--   SET operator_count = CASE
--     WHEN person_month_cost > 0 THEN ROUND(operator_cost / person_month_cost)
--     ELSE 0
--   END
-- WHERE operator_count = 0 OR operator_count IS NULL;
