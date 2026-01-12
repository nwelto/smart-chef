# Smart Chef 

AI-powered recipe generation app that creates personalized recipes based on the ingredients you have at home.

## Features

- **AI Recipe Generation** - Enter your ingredients, select your spices, and let AI create a delicious recipe tailored to your kitchen
- **Two Recipe Modes**
  - *Use Every Ingredient* - AI uses ALL ingredients you list (great for using up everything)
  - *Best Meal Possible* - AI picks the best combination for a delicious meal
- **Recipe Storage** - Save generated recipes to your personal collection
- **Favorites System** - Mark recipes as favorites or family favorites for easy organization
- **User Authentication** - Secure login with email/password or Google OAuth
- **Responsive Design** - Beautiful UI on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

Run the SQL migration in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  ingredients jsonb NOT NULL,
  instructions text[] NOT NULL,
  prep_time_minutes int,
  cook_time_minutes int,
  servings int,
  difficulty text,
  ingredients_input text[],
  spices_used text[],
  is_favorite boolean DEFAULT false,
  is_family_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create spices table
CREATE TABLE spices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view spices" ON spices FOR SELECT TO authenticated USING (true);

-- Create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── recipes/
│   │   │   ├── [id]/route.ts    # GET, PATCH, DELETE single recipe
│   │   │   ├── generate/route.ts # POST generate new recipe
│   │   │   └── route.ts          # GET all, POST save recipe
│   │   └── spices/route.ts       # GET spices list
│   ├── auth/callback/route.ts    # OAuth callback
│   ├── generate/page.tsx         # Recipe generation page
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Signup page
│   ├── recipes/
│   │   ├── [id]/page.tsx         # Single recipe view
│   │   └── page.tsx              # Saved recipes list
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   └── page.tsx                  # Homepage
├── components/
│   ├── IngredientInput.tsx       # Ingredient tag input
│   ├── Navbar.tsx                # Navigation bar
│   ├── RecipeCard.tsx            # Recipe list item
│   ├── RecipeDisplay.tsx         # Generated recipe display
│   └── SpiceSelector.tsx         # Spice checkbox grid
└── lib/
    ├── openai.ts                 # OpenAI integration
    ├── supabase/                 # Supabase clients
    └── types.ts                  # TypeScript types
```

## License

MIT
