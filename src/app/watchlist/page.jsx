"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    async function load() {
      if (!user) return;

      // 1. Get watchlist movie IDs
      const snap = await getDocs(
        collection(db, "users", user.uid, "watchlist")
      );

      const ids = snap.docs.map((d) => d.id);

      // 2. Load movie details
      const moviesData = [];
      for (const id of ids) {
        const mSnap = await getDoc(doc(db, "movies", id));
        if (mSnap.exists()) moviesData.push({ id, ...mSnap.data() });
      }

      setMovies(moviesData);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <h1 className="text-xl font-semibold px-4 mt-4">My Watchlist</h1>

      {movies.length === 0 ? (
        <p className="px-4 mt-4 text-gray-500 text-sm">
          No movies saved yet.
        </p>
      ) : (

<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
  {movies.map((m) => (
    <Link
      key={m.id}
      href={`/movies/${m.id}`}
      className="group relative rounded-xl overflow-hidden shadow-md bg-gray-900"
    >
      {/* Poster */}
      {m.posterUrl ? (
        <img
          src={m.posterUrl}
          alt={m.title}
          className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-60 bg-gray-800 flex items-center justify-center text-xs text-gray-400">
          No Poster Available
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>

      {/* Title + Meta */}
      <div className="absolute bottom-2 left-2 right-2">
        <h3 className="text-[13px] font-semibold text-white leading-tight group-hover:text-indigo-300 transition-colors">
          {m.title}
        </h3>

        <p className="text-[11px] text-gray-300 mt-[1px]">
          {m.year ? m.year : ""}
          {m.countries ? ` · ${m.countries.split(",")[0]}` : ""}
        </p>
      </div>
    </Link>
  ))}
</div>

      )}
    </div>
  );
}
