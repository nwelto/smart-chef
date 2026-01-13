-- Meal Plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    plan_type TEXT NOT NULL,
    people INT DEFAULT 2,
    days INT DEFAULT 5,
    meals_per_day INT DEFAULT 1,
    total_prep_time_hours NUMERIC,
    plan_data JSONB NOT NULL, -- Contains days, grocery_list, prep_instructions, storage_tips
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own meal plans" ON meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
    FOR DELETE USING (auth.uid() = user_id);
