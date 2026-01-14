-- Meal Plans table
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    family_size INT NOT NULL,
    allergies TEXT[],
    exclusions TEXT[],
    preferred_proteins TEXT[],
    days INT NOT NULL,
    meals TEXT[] NOT NULL,
    plan JSONB NOT NULL,
    grocery_list JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own meal_plans" ON meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own meal_plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own meal_plans" ON meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own meal_plans" ON meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_created_at ON meal_plans(created_at DESC);
