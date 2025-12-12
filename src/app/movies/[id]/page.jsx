"use client";

"use client";
export const runtime = "edge";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import Navbar from "../../components/Navbar";

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);

  // ---------------------------
  // WATCHLIST: TOGGLE FUNCTION
  // ---------------------------
  const toggleWatchlist = async () => {
    if (!user) {
      alert("Please sign in to save movies");
      return;
    }

    const ref = doc(db, "users", user.uid, "watchlist", id);

    if (isSaved) {
      await deleteDoc(ref);
      setIsSaved(false);
    } else {
      await setDoc(ref, {
        movieId: id,
        addedAt: Date.now(),
      });
      setIsSaved(true);
    }
  };

  // ---------------------------
  // WATCHLIST: CHECK IF SAVED
  // ---------------------------
  const checkWatchlist = async (userObj) => {
    if (!userObj) return;

    const ref = doc(db, "users", userObj.uid, "watchlist", id);
    const snap = await getDoc(ref);

    if (snap.exists()) setIsSaved(true);
  };

  // ---------------------------
  // MAIN EFFECT
  // ---------------------------
  useEffect(() => {
    if (!id) return;

    // AUTH LISTENER
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);

      if (u) {
        await checkWatchlist(u);
      }
    });

    // Fetch movie + shows
    async function load() {
      try {
        // 1) Fetch movie doc
        const snap = await getDoc(doc(db, "movies", id));
        if (!snap.exists()) {
          setMovie(null);
          setLoading(false);
          return;
        }

        const movieData = { id: snap.id, ...snap.data() };
        setMovie(movieData);

        // 2) Fetch screenings
        const qShows = query(
          collection(db, "shows"),
          where("movieId", "==", id),
          orderBy("day"),
          orderBy("show")
        );

        const showSnap = await getDocs(qShows);
        const shows = showSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setShowtimes(shows);
      } catch (err) {
        console.error("Error loading movie detail:", err);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => unsubscribe();
  }, [id]);

  // ---------------------------
  // LOADING + ERROR STATES
  // ---------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <Navbar />
        <div className="px-4 py-6 text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <Navbar />
        <div className="px-4 py-6">
          <p className="text-red-400">Movie not found.</p>
          <button
            onClick={() => router.back()}
            className="mt-3 text-xs text-indigo-400 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------
  // GROUP SHOWS BY DAY
  // ---------------------------
  const grouped = showtimes.reduce((acc, s) => {
    if (!acc[s.day]) acc[s.day] = [];
    acc[s.day].push(s);
    return acc;
  }, {});

  const dayList = Object.keys(grouped).map((d) => Number(d));

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-10">
      <Navbar />

     {/* HEADER */}
<div className="px-4 pt-4 flex gap-4">

  {/* POSTER */}
  <div className="w-28 h-40 rounded-lg overflow-hidden shadow-md bg-gray-900">
    {movie.posterUrl ? (
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
        No Poster
      </div>
    )}
  </div>

  {/* RIGHT SIDE */}
  <div className="flex-1 flex flex-col justify-between py-1">

    {/* Title Section */}
    <div>
      <h1 className="text-lg font-semibold leading-tight">{movie.title}</h1>

      <p className="text-[11px] text-gray-400 mt-1">
        {movie.countries} · {movie.year}
      </p>

      {/* External link */}
      {movie.externalLink && (
        <a
          href={movie.externalLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-2"
        >
          🔗 Letterboxd
        </a>
      )}
    </div>

    {/* Watchlist Button */}
    <button
      onClick={toggleWatchlist}
      className={`mt-3 w-fit px-4 py-1.5 rounded-full text-[11px] font-medium transition-all
        border backdrop-blur-sm 
        ${
          isSaved
            ? "bg-red-600 border-red-500 text-white hover:bg-red-700"
            : "bg-white/5 border-white/20 text-gray-200 hover:bg-white/10"
        }`}
    >
      {isSaved ? "♥ In Watchlist" : "＋ Add to Watchlist"}
    </button>

  </div>
</div>


      {/* SCREENING DAY BUTTONS */}
      {dayList.length > 0 && (
        <div className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
          {dayList.map((day) => (
            <button
              key={day}
              onClick={() =>
                document.getElementById(`day-${day}`)?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="px-3 py-1 rounded-full bg-gray-800 text-gray-200 text-[12px] whitespace-nowrap hover:bg-gray-700"
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

      {/* SCREENING LIST */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold mb-2">Screenings</h2>

        {showtimes.length === 0 ? (
          <p className="text-[12px] text-gray-500">No screenings scheduled.</p>
        ) : (
          <div className="space-y-6">
            {dayList.map((day) => (
              <div key={day} id={`day-${day}`}>
                <h3 className="text-[13px] font-semibold text-indigo-400 mb-1">
                  Day {day}
                </h3>

                <div className="space-y-2">
                  {grouped[day].map((s) => (
                    <div
                      key={s.id}
                      className="bg-gray-900 rounded-lg px-3 py-2 text-[12px] flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-100">
                          {s.theatre || "Unknown Theatre"}
                        </p>
                        <p className="text-gray-400">{`Show ${s.show}`}</p>
                      </div>
                      <p className="text-indigo-400 font-medium">
                        {s.time || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
