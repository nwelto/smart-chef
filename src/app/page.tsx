import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 sm:p-4 md:p-5 bg-background/80 backdrop-blur-sm">
        <Link href="/" className="h-20 sm:h-28 md:h-36 ml-2 sm:ml-8 md:ml-16 shrink-0">
          <Image
            src="/smartcheflogo.png"
            alt="Smart Chef"
            width={360}
            height={96}
            className="h-full w-auto"
            priority
          />
        </Link>
        <div className="flex gap-2 sm:gap-4">
          {user ? (
            <>
              <Link href="/generate" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2">
                Generate
              </Link>
              <Link href="/plan" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2">
                Plan
              </Link>
              <Link href="/calendar" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2 hidden sm:inline-block">
                Calendar
              </Link>
              <Link href="/recipes" className="btn-primary text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 md:px-16 pt-24 sm:pt-32 pb-12 sm:pb-16 md:py-0">
          <div className="md:ml-12 lg:ml-20">
            <p className="label text-xs sm:text-sm mb-3 sm:mb-4">Smart Recipe Generation</p>
            <h1 className="font-extrabold uppercase leading-[0.9] tracking-tight text-[clamp(2.5rem,12vw,5rem)] md:text-[clamp(2rem,5vw,4.5rem)] lg:text-[clamp(2.5rem,6vw,7rem)] mb-6 sm:mb-8">
              Cook<br />
              <span className="whitespace-nowrap">with what</span><br />
              <span className="whitespace-nowrap">you <span className="text-accent">have</span></span>
            </h1>
            <p className="text-muted max-w-md text-base sm:text-lg mb-8 sm:mb-10">
              Enter the ingredients in your kitchen. Select your spices. 
              Get a delicious recipe tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href={user ? "/generate" : "/signup"}
                className="btn-primary text-sm sm:text-base"
              >
                {user ? "Generate Recipe" : "Get Started"}
              </Link>
              {user && (
                <Link
                  href="/plan"
                  className="btn-secondary text-sm sm:text-base"
                >
                  Plan My Week →
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative min-h-[40vh] sm:min-h-[50vh] md:min-h-screen">
          <Image
            src="/chefhero.jpg"
            alt="Chef preparing food"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="label text-xs sm:text-sm mb-3 sm:mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-10 sm:mb-16">
            Three steps to
            <br />
            your perfect meal
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-8">
            <div className="group">
              <span className="text-6xl sm:text-7xl md:text-8xl font-black text-border group-hover:text-accent transition-colors">01</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-3">Add Ingredients</h3>
              <p className="text-muted text-sm sm:text-base">
                List what you have in your fridge and pantry. No need to go shopping.
              </p>
            </div>
            <div className="group">
              <span className="text-6xl sm:text-7xl md:text-8xl font-black text-border group-hover:text-accent transition-colors">02</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-3">Select Spices</h3>
              <p className="text-muted text-sm sm:text-base">
                Check off the spices available in your kitchen for flavor matching.
              </p>
            </div>
            <div className="group sm:col-span-2 md:col-span-1">
              <span className="text-6xl sm:text-7xl md:text-8xl font-black text-border group-hover:text-accent transition-colors">03</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-3">Get Recipe</h3>
              <p className="text-muted text-sm sm:text-base">
                Get a custom recipe with exact measurements in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <p className="label text-xs sm:text-sm mb-3 sm:mb-4 text-background/60">Why Smart Chef</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 sm:mb-8">
              Stop wasting
              <br />
              food & time
            </h2>
            <p className="text-background/70 text-base sm:text-lg mb-6 sm:mb-8">
              The average household throws away hundreds of dollars worth of food each year. 
              Smart Chef helps you use what you already have, reducing waste and saving money.
            </p>
            <Link href={user ? "/generate" : "/signup"} className="btn-secondary border-background text-background hover:bg-background hover:text-foreground text-sm sm:text-base">
              Start Cooking
            </Link>
          </div>
          <div className="relative aspect-square order-1 md:order-2">
            <Image
              src="/chef2.jpg"
              alt="Fresh ingredients"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Grid - Main Tools */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <p className="label text-xs sm:text-sm mb-3 sm:mb-4">Your Kitchen Tools</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-10 sm:mb-16">
            Everything you need
            <br />
            <span className="text-accent">in one place</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Recipe */}
            <Link href={user ? "/generate" : "/signup"} className="group border border-border hover:border-accent p-6 sm:p-8 transition-all hover:bg-card">
              <span className="text-4xl sm:text-5xl mb-4 block">🍳</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Quick Recipe</h3>
              <p className="text-muted text-sm sm:text-base mb-4">
                Enter ingredients you have and get a recipe instantly. Perfect for using up what&apos;s in your fridge.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">Generate →</span>
            </Link>

            {/* Meal Plan Wizard */}
            <Link href={user ? "/plan" : "/signup"} className="group border border-border hover:border-accent p-6 sm:p-8 transition-all hover:bg-card">
              <span className="text-4xl sm:text-5xl mb-4 block">📅</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Meal Plan Wizard</h3>
              <p className="text-muted text-sm sm:text-base mb-4">
                Plan your week with a step-by-step wizard. Get full recipes, grocery lists, and prep instructions.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">Start Planning →</span>
            </Link>

            {/* Meal Calendar */}
            <Link href={user ? "/calendar" : "/signup"} className="group border border-border hover:border-accent p-6 sm:p-8 transition-all hover:bg-card">
              <span className="text-4xl sm:text-5xl mb-4 block">🗓️</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Meal Calendar</h3>
              <p className="text-muted text-sm sm:text-base mb-4">
                Schedule meals on your weekly calendar. Drag recipes onto days and see your whole week at a glance.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">View Calendar →</span>
            </Link>

            {/* Shopping List */}
            <Link href={user ? "/shopping" : "/signup"} className="group border border-border hover:border-accent p-6 sm:p-8 transition-all hover:bg-card">
              <span className="text-4xl sm:text-5xl mb-4 block">🛒</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Shopping List</h3>
              <p className="text-muted text-sm sm:text-base mb-4">
                Aggregate ingredients from recipes and meal plans. Check items off as you shop.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">View List →</span>
            </Link>

            {/* Saved Recipes */}
            <Link href={user ? "/recipes" : "/signup"} className="group border border-border hover:border-accent p-6 sm:p-8 transition-all hover:bg-card">
              <span className="text-4xl sm:text-5xl mb-4 block">📖</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">My Recipes</h3>
              <p className="text-muted text-sm sm:text-base mb-4">
                Access all your saved recipes. Mark favorites and family favorites for quick access.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">View Recipes →</span>
            </Link>

            {/* Diet Profile */}
            <Link href={user ? "/settings/diet" : "/signup"} className="group border border-border hover:border-accent p-6 sm:p-8 transition-all hover:bg-card">
              <span className="text-4xl sm:text-5xl mb-4 block">⚙️</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Diet Profile</h3>
              <p className="text-muted text-sm sm:text-base mb-4">
                Set your dietary preferences once. They&apos;ll auto-apply to every recipe you generate.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">Set Up →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Meal Prep Highlight */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 bg-accent/10 border-y border-accent/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <p className="label text-xs sm:text-sm mb-3 sm:mb-4 text-accent">Meal Prep Made Easy</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 sm:mb-8">
                Plan your entire
                <br />
                <span className="text-accent">week in minutes</span>
              </h2>
              <p className="text-muted text-base sm:text-lg mb-6 sm:mb-8">
                Our Meal Plan Wizard helps you create complete meal prep plans with:
              </p>
              <ul className="space-y-3 text-sm sm:text-base mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-accent">✓</span>
                  <span>Freezer burritos, dinner plans, lunch prep & more</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">✓</span>
                  <span>Full recipes with ingredients and instructions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">✓</span>
                  <span>Complete grocery list organized by category</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">✓</span>
                  <span>Step-by-step prep instructions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">✓</span>
                  <span>Macros for every meal</span>
                </li>
              </ul>
              <Link href={user ? "/plan" : "/signup"} className="btn-primary text-sm sm:text-base">
                Start Meal Planning →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border p-4 sm:p-6">
                <span className="text-3xl mb-2 block">🌯</span>
                <p className="font-bold">Freezer Burritos</p>
                <p className="text-xs text-muted">Make-ahead grab & go</p>
              </div>
              <div className="bg-card border border-border p-4 sm:p-6">
                <span className="text-3xl mb-2 block">🍽️</span>
                <p className="font-bold">Dinner Plan</p>
                <p className="text-xs text-muted">Family dinners for the week</p>
              </div>
              <div className="bg-card border border-border p-4 sm:p-6">
                <span className="text-3xl mb-2 block">🥗</span>
                <p className="font-bold">Lunch Prep</p>
                <p className="text-xs text-muted">Portioned work lunches</p>
              </div>
              <div className="bg-card border border-border p-4 sm:p-6">
                <span className="text-3xl mb-2 block">🍳</span>
                <p className="font-bold">Breakfast Prep</p>
                <p className="text-xs text-muted">Quick morning meals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="relative aspect-[4/3] sm:aspect-[3/4] group overflow-hidden">
            <Image
              src="/chef3.jpg"
              alt="Cooking process"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="label text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Feature</p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Save Your Favorites</h3>
            </div>
          </div>
          <div className="relative aspect-[4/3] sm:aspect-[3/4] group overflow-hidden">
            <Image
              src="/chef4.jpg"
              alt="Plated dish"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="label text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Feature</p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Detailed Steps</h3>
            </div>
          </div>
          <div className="relative aspect-[4/3] sm:aspect-[3/4] group overflow-hidden sm:col-span-2 md:col-span-1">
            <Image
              src="/chef5.jpg"
              alt="Final presentation"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="label text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Feature</p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Family Favorites</h3>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-16 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <Link href="/">
            <Image
              src="/smartcheflogo.png"
              alt="Smart Chef"
              width={300}
              height={80}
              className="h-12 sm:h-16 md:h-20 w-auto opacity-50 hover:opacity-100 transition-opacity"
            />
          </Link>
          <div className="flex flex-col items-center md:flex-row gap-3 sm:gap-4 md:gap-8">
            <div className="flex gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-muted hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm text-muted hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-muted text-xs sm:text-sm text-center">
              Smart Chef {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
