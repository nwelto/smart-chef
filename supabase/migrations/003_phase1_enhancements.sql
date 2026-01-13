-- Phase 1 Enhancements Migration

-- 1. Diet Profiles table
CREATE TABLE IF NOT EXISTS diet_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    dietary_restrictions TEXT[] DEFAULT '{}',
    cuisine_preferences TEXT[] DEFAULT '{}',
    protein_preferences TEXT[] DEFAULT '{}',
    disliked_ingredients TEXT[] DEFAULT '{}',
    calorie_target INT,
    kitchen_equipment TEXT[] DEFAULT '{}',
    budget_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE diet_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diet profile" ON diet_profiles
    FOR ALL USING (auth.uid() = user_id);

-- 2. Shopping Lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT DEFAULT 'My Shopping List',
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
    FOR ALL USING (auth.uid() = user_id);

-- 3. Scheduled Meals table (for calendar)
CREATE TABLE IF NOT EXISTS scheduled_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
    custom_meal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scheduled meals" ON scheduled_meals
    FOR ALL USING (auth.uid() = user_id);

-- Index for efficient calendar queries
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_user_date ON scheduled_meals(user_id, date);
