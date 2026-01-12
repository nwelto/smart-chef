import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-primary">Smart Chef</span>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/generate" className="btn-secondary">
                Generate
              </Link>
              <Link href="/recipes" className="btn-primary">
                My Recipes
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Cook with what you
          <span className="text-primary"> have</span>
        </h1>
        <p className="text-xl text-muted max-w-2xl mb-10">
          Enter the ingredients in your kitchen, select your spices, and let AI
          create a delicious recipe tailored just for you.
        </p>
        <Link
          href={user ? "/generate" : "/signup"}
          className="btn-primary text-lg px-8 py-4"
        >
          {user ? "Generate a Recipe" : "Get Started Free"}
        </Link>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">🥗</div>
            <h3 className="text-lg font-semibold mb-2">Add Ingredients</h3>
            <p className="text-muted">
              List what you have in your fridge and pantry
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🧂</div>
            <h3 className="text-lg font-semibold mb-2">Select Spices</h3>
            <p className="text-muted">
              Check off the spices available in your kitchen
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h3 className="text-lg font-semibold mb-2">Get Your Recipe</h3>
            <p className="text-muted">
              AI generates a custom recipe in seconds
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-muted border-t border-border">
        <p>Smart Chef &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
