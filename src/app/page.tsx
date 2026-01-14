"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Use API route instead of client-side Supabase (which has session issues)
    // Add timestamp to bust any caching
    fetch(`/api/auth/me?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log("Auth API response:", data);
        setUserEmail(data.email);
        setChecked(true);
      })
      .catch((err) => {
        console.error("Auth API error:", err);
        setChecked(true);
      });
  }, []);

  // Wait for auth check
  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const isLoggedIn = !!userEmail;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar userEmail={userEmail || undefined} />

      <section className="min-h-screen flex flex-col md:flex-row pt-16">
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 md:px-16 pt-8 sm:pt-12 pb-12 sm:pb-16 md:py-0">
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
                href={isLoggedIn ? "/generate" : "/signup"}
                className="btn-primary text-sm sm:text-base"
              >
                {isLoggedIn ? "Generate Recipe" : "Get Started"}
              </Link>
              <Link
                href={isLoggedIn ? "/plan" : "/login"}
                className="btn-secondary text-sm sm:text-base"
              >
                Plan My Week →
              </Link>
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

      {/* Features Grid - Dashboard (DARK) */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto">
          <p className="label text-xs sm:text-sm mb-3 sm:mb-4 text-background/60">Your Kitchen Tools</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-10 sm:mb-16">
            Everything you need
            <br />
            <span className="text-accent">in one place</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Link href={isLoggedIn ? "/generate" : "/login"} className="group border border-background/20 hover:border-accent p-6 sm:p-8 transition-all hover:bg-background/5">
              <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Quick Recipe</h3>
              <p className="text-background/70 text-sm sm:text-base mb-4">
                Enter ingredients you have and get a recipe instantly.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {isLoggedIn ? "Generate →" : "Sign In →"}
              </span>
            </Link>

            <Link href={isLoggedIn ? "/plan" : "/login"} className="group border border-background/20 hover:border-accent p-6 sm:p-8 transition-all hover:bg-background/5">
              <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Meal Plan Wizard</h3>
              <p className="text-background/70 text-sm sm:text-base mb-4">
                Plan your week with a step-by-step wizard.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {isLoggedIn ? "Start Planning →" : "Sign In →"}
              </span>
            </Link>

            <Link href={isLoggedIn ? "/calendar" : "/login"} className="group border border-background/20 hover:border-accent p-6 sm:p-8 transition-all hover:bg-background/5">
              <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Meal Calendar</h3>
              <p className="text-background/70 text-sm sm:text-base mb-4">
                Schedule meals on your weekly calendar.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {isLoggedIn ? "View Calendar →" : "Sign In →"}
              </span>
            </Link>

            <Link href={isLoggedIn ? "/shopping" : "/login"} className="group border border-background/20 hover:border-accent p-6 sm:p-8 transition-all hover:bg-background/5">
              <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Shopping List</h3>
              <p className="text-background/70 text-sm sm:text-base mb-4">
                Aggregate ingredients from recipes and meal plans.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {isLoggedIn ? "View List →" : "Sign In →"}
              </span>
            </Link>

            <Link href={isLoggedIn ? "/recipes" : "/login"} className="group border border-background/20 hover:border-accent p-6 sm:p-8 transition-all hover:bg-background/5">
              <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">My Recipes</h3>
              <p className="text-background/70 text-sm sm:text-base mb-4">
                Access all your saved recipes.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {isLoggedIn ? "View Recipes →" : "Sign In →"}
              </span>
            </Link>

            <Link href={isLoggedIn ? "/settings/diet" : "/login"} className="group border border-background/20 hover:border-accent p-6 sm:p-8 transition-all hover:bg-background/5">
              <div className="w-12 h-12 border-2 border-accent flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Diet Profile</h3>
              <p className="text-background/70 text-sm sm:text-base mb-4">
                Set your dietary preferences once.
              </p>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {isLoggedIn ? "Set Up →" : "Sign In →"}
              </span>
            </Link>
          </div>
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
            <Link href={isLoggedIn ? "/generate" : "/signup"} className="btn-secondary border-background text-background hover:bg-background hover:text-foreground text-sm sm:text-base">
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

      {/* Meal Prep Section (LIGHT) */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <p className="label text-xs sm:text-sm mb-3 sm:mb-4">Meal Prep Made Easy</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 sm:mb-8">
                Plan your entire
                <br />
                <span className="text-accent">week in minutes</span>
              </h2>
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
              </ul>
              <Link href={isLoggedIn ? "/plan" : "/signup"} className="btn-primary text-sm sm:text-base">
                Start Meal Planning →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border p-4 sm:p-6 group hover:border-accent transition-colors">
                <p className="text-3xl sm:text-4xl font-black text-accent/20 group-hover:text-accent transition-colors leading-none mb-2">01</p>
                <p className="font-bold">Freezer Ready</p>
                <p className="text-xs text-muted">Make-ahead grab & go</p>
              </div>
              <div className="bg-card border border-border p-4 sm:p-6 group hover:border-accent transition-colors">
                <p className="text-3xl sm:text-4xl font-black text-accent/20 group-hover:text-accent transition-colors leading-none mb-2">02</p>
                <p className="font-bold">Dinner Plan</p>
                <p className="text-xs text-muted">Family dinners for the week</p>
              </div>
              <div className="bg-card border border-border p-4 sm:p-6 group hover:border-accent transition-colors">
                <p className="text-3xl sm:text-4xl font-black text-accent/20 group-hover:text-accent transition-colors leading-none mb-2">03</p>
                <p className="font-bold">Lunch Prep</p>
                <p className="text-xs text-muted">Portioned work lunches</p>
              </div>
              <div className="bg-card border border-border p-4 sm:p-6 group hover:border-accent transition-colors">
                <p className="text-3xl sm:text-4xl font-black text-accent/20 group-hover:text-accent transition-colors leading-none mb-2">04</p>
                <p className="font-bold">Breakfast Prep</p>
                <p className="text-xs text-muted">Quick morning meals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery (DARK) */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 bg-foreground">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="relative aspect-[4/3] sm:aspect-[3/4] group overflow-hidden">
            <Image src="/chef3.jpg" alt="Cooking process" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="label text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Feature</p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Save Your Favorites</h3>
            </div>
          </div>
          <div className="relative aspect-[4/3] sm:aspect-[3/4] group overflow-hidden">
            <Image src="/chef4.jpg" alt="Plated dish" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="label text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Feature</p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Detailed Steps</h3>
            </div>
          </div>
          <div className="relative aspect-[4/3] sm:aspect-[3/4] group overflow-hidden sm:col-span-2 md:col-span-1">
            <Image src="/chef5.jpg" alt="Final presentation" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
            <Image src="/smartcheflogo.png" alt="Smart Chef" width={300} height={80} className="h-12 sm:h-16 md:h-20 w-auto opacity-50 hover:opacity-100 transition-opacity" />
          </Link>
          <div className="flex flex-col items-center md:flex-row gap-3 sm:gap-4 md:gap-8">
            <div className="flex gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-muted hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs sm:text-sm text-muted hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
            <p className="text-muted text-xs sm:text-sm text-center">Smart Chef {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
