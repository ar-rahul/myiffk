"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearchInput = (e) => {
  const q = e.target.value;
  setQuery(q);
  router.push(`/movies?search=${encodeURIComponent(q)}`);
};

  const closeMenu = () => setOpen(false);

  return (
    <>
      <nav className="w-full sticky top-0 z-50 bg-black bg-opacity-80 backdrop-blur-lg border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        
        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-white pr-2"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-wide text-white">
          IFFK
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 ml-6 text-sm">
          <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link href="/movies" className="text-gray-300 hover:text-white">Movies</Link>
          <Link href="/watchlist" className="text-gray-300 hover:text-white">Watchlist</Link>
          <Link href="/profile" className="text-gray-300 hover:text-white">Profile</Link>
          <Link href="/my-reviews" className="text-gray-300 hover:text-white">My Reviews</Link>
        </div>

        {/* Search Bar */}
        <input
  value={query}
  onChange={handleSearchInput}
  placeholder="Search movies..."
  className="flex-1 bg-gray-900 text-white rounded-lg px-3 py-1 text-sm outline-none border border-gray-800 focus:border-indigo-500"
/>

      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Drawer */}
          <div className="w-64 bg-gray-900 h-full shadow-xl p-4 z-50">
            <button className="text-gray-300 mb-6" onClick={closeMenu}>
              <X size={24} />
            </button>

            <ul className="space-y-4 text-gray-200">
              <li><Link href="/" onClick={closeMenu}>Home</Link></li>
              <li><Link href="/movies" onClick={closeMenu}>Movies</Link></li>
              <li><Link href="/watchlist" onClick={closeMenu}>Watchlist</Link></li>
              <li><Link href="/profile" onClick={closeMenu}>Profile</Link></li>
              <li><Link href="/my-reviews" onClick={closeMenu}>My Reviews</Link></li>

              {user && (
                <li>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="text-gray-400 hover:text-red-400"
                  >
                    Sign out
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Click outside closes drawer */}
          <div className="flex-1 bg-black/70" onClick={closeMenu} />
        </div>
      )}
    </>
  );
}
