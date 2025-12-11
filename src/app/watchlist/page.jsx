"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider"; // adjust path if different
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

/**
 * Client-only Watchlist page.
 * Uses onAuthStateChanged via your AuthProvider (useAuth) so nothing runs at build time.
 */

export default function WatchlistPage() {
  const { user, login } = useAuth(); // user is undefined while loading, then null or user
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // Load watchlist when user is available
  useEffect(() => {
    if (typeof window === "undefined") return; // extra safety
    let mounted = true;

    async function load() {
      setLoading(true);
      setItems([]);

      // if not logged in, nothing to fetch
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "users", user.uid, "watchlist"),
          orderBy("addedAt", "desc")
        );
        const snap = await getDocs(q);
        if (!mounted) return;
        const data = await Promise.all(
          snap.docs.map(async (d) => {
            const item = d.data();
            // fetch movie doc for richer info (non-blocking)
            try {
              const movieDoc = await (await import("firebase/firestore")).getDoc(
                doc(db, "movies", item.movieId)
              );
              return {
                id: d.id,
                docId: d.id,
                movieId: item.movieId,
                addedAt: item.addedAt,
                movie: movieDoc.exists() ? { id: movieDoc.id, ...movieDoc.data() } : null,
              };
            } catch (err) {
              return { id: d.id, movieId: item.movieId, addedAt: item.addedAt, movie: null };
            }
          })
        );
        setItems(data);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  const removeFromWatchlist = async (docId) => {
    if (!user) return alert("Please sign in.");
    try {
      await deleteDoc(doc(db, "users", user.uid, "watchlist", docId));
      setItems((prev) => prev.filter((i) => i.docId !== docId));
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-10">
      <Navbar />

      <div className="px-4 pt-6">
        <h1 className="text-2xl font-semibold">Your Watchlist</h1>
        <p className="text-sm text-gray-400 mt-1">Saved movies you want to see</p>

        {!user ? (
          <div className="mt-6">
            <p className="text-sm text-gray-300">
              You are not signed in.
            </p>
            <button
              onClick={() => login()}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm shadow"
            >
              Sign in to view watchlist
            </button>
          </div>
        ) : loading ? (
          <p className="mt-6 text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-6 text-gray-400">
            <p>No items in your watchlist yet.</p>
            <p className="text-sm mt-2">Browse movies and add to your watchlist.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((it) => (
              <div key={it.docId} className="bg-gray-900 rounded-2xl overflow-hidden shadow">
                <div className="relative">
                  {it.movie?.posterUrl ? (
                    <img src={it.movie.posterUrl} alt={it.movie?.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-xs text-gray-400">No poster</div>
                  )}
                </div>

                <div className="p-3">
                  <Link href={`/movies/${it.movieId}`} className="block">
                    <h3 className="text-sm font-medium text-gray-100 line-clamp-2">
                      {it.movie?.title || it.movieId}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => removeFromWatchlist(it.docId)}
                      className="text-xs px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </button>

                    <Link href={`/movies/${it.movieId}`} className="text-xs text-indigo-400 underline">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
