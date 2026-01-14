"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  console.log("=== NAVBAR RENDER ===");
  console.log("Navbar received userEmail:", userEmail);
  console.log("Navbar isLoggedIn:", !!userEmail);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isLoggedIn = !!userEmail;

  return (
    <nav className="flex items-center justify-between p-2 sm:p-4 md:p-5 border-b border-border">
      <a href="/" className="h-12 sm:h-16 md:h-20 ml-2 sm:ml-4 md:ml-8 shrink-0">
        <Image
          src="/smartcheflogo.png"
          alt="Smart Chef"
          width={360}
          height={96}
          className="h-full w-auto"
          priority
        />
      </a>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* These buttons should always be visible, styled the same way */}
        <Link href={isLoggedIn ? "/generate" : "/login"} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5">
          Generate
        </Link>
        <Link href={isLoggedIn ? "/plan" : "/login"} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5">
          Plan
        </Link>
        <Link href={isLoggedIn ? "/calendar" : "/login"} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 hidden sm:inline-block">
          Calendar
        </Link>
        <Link href={isLoggedIn ? "/shopping" : "/login"} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 hidden md:inline-block">
          Shopping
        </Link>
        <Link href={isLoggedIn ? "/recipes" : "/login"} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 hidden md:inline-block">
          Recipes
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link href="/meal-plans" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 hidden lg:inline-block">
              My Plans
            </Link>
            <Link href="/settings/diet" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 hidden lg:inline-block">
              Settings
            </Link>
            <button onClick={handleLogout} className="btn-primary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5">
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5">
              Log In
            </Link>
            <Link href="/signup" className="btn-primary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
