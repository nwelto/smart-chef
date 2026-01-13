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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-border">
      <Link href="/" className="h-12 sm:h-16 md:h-24 ml-2 sm:ml-8 md:ml-16 shrink-0">
        <Image
          src="/smartcheflogo.png"
          alt="Smart Chef"
          width={360}
          height={96}
          className="h-full w-auto"
          priority
        />
      </Link>
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <Link href="/generate" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
          Generate
        </Link>
        <Link href="/plan" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
          Plan
        </Link>
        <Link href="/recipes" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
          Recipes
        </Link>
        <Link href="/meal-plans" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
          My Plans
        </Link>
        <Link href="/shopping" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
          Shopping
        </Link>
        <Link href="/calendar" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
          Calendar
        </Link>
        {userEmail && (
          <>
            <Link href="/settings/diet" className="text-xs sm:text-sm font-medium hover:text-accent transition-colors">
              Settings
            </Link>
            <span className="text-sm text-muted hidden lg:inline">{userEmail}</span>
            <button onClick={handleLogout} className="btn-secondary text-xs px-2 sm:px-4 py-1.5 sm:py-2">
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
