-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL,
    instructions TEXT[] NOT NULL,
    ingredients_input TEXT[] NOT NULL,
    spices_used TEXT[],
    prep_time_minutes INT,
    cook_time_minutes INT,
    servings INT DEFAULT 4,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spices (seed data for checkboxes)
CREATE TABLE spices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    is_common BOOLEAN DEFAULT true
);

-- Seed common spices
INSERT INTO spices (name, category) VALUES
    ('Salt', 'Basic'),
    ('Black Pepper', 'Basic'),
    ('Garlic Powder', 'Basic'),
    ('Onion Powder', 'Basic'),
    ('Paprika', 'Warm'),
    ('Cumin', 'Warm'),
    ('Chili Powder', 'Warm'),
    ('Cayenne', 'Warm'),
    ('Oregano', 'Herbs'),
    ('Basil', 'Herbs'),
    ('Thyme', 'Herbs'),
    ('Rosemary', 'Herbs'),
    ('Cinnamon', 'Sweet'),
    ('Nutmeg', 'Sweet'),
    ('Ginger', 'Asian'),
    ('Turmeric', 'Asian'),
    ('Curry Powder', 'Asian'),
    ('Italian Seasoning', 'Blends'),
    ('Taco Seasoning', 'Blends'),
    ('Everything Bagel', 'Blends');

-- Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for recipes
CREATE POLICY "Users view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for profiles
CREATE POLICY "Users manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Public read for spices
ALTER TABLE spices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read spices" ON spices
    FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
