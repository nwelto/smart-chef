"use client";

import Link from "next/link";
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
    <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
      <Link href="/" className="text-xl font-bold text-primary">
        Smart Chef
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/generate" className="text-sm hover:text-primary">
          Generate
        </Link>
        <Link href="/recipes" className="text-sm hover:text-primary">
          My Recipes
        </Link>
        {userEmail && (
          <>
            <span className="text-sm text-muted hidden sm:inline">{userEmail}</span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-3">
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
