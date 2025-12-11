"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  query, where,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";


export default function MoviesPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search")?.toLowerCase() || "";

  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      const snap = await getDocs(collection(db, "movies"));
      setAllMovies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchMovies();
  }, []);

  const filtered = allMovies
    .filter((m) => m.title.toLowerCase().includes(query))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen pb-10">
      <Navbar />

      <h2 className="text-xl font-semibold mt-4 px-4">
        Search Results
      </h2>

      {loading ? (
        <p className="px-4 mt-4 text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="px-4 mt-4 text-gray-500">
          No movies found for “{query}”
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {filtered.map((m) => (
            <Link
              href={`/movies/${m.id}`}
              key={m.id}
              className="block"
            >
              <div className="relative group bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:scale-[1.03] transition-transform">
                {m.posterUrl ? (
                  <img
                    src={m.posterUrl}
                    className="w-full h-52 object-cover"
                    alt={m.title}
                  />
                ) : (
                  <div className="w-full h-52 bg-gray-800 flex items-center justify-center text-[10px]">
                    No Poster
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 text-gray-200 line-clamp-2">
                {m.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
