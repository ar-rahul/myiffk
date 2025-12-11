"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";


import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";



import Link from "next/link";
import StarRatingDisplay from "./components/StarRatingDisplay";
import Navbar from "./components/Navbar";



const venues = [
  "Kairali", "Sree", "Nila", "Kalabhavan", "Tagore",
  "Nishagandhi", "Ariesplex-1", "Ariesplex-4", "Ariesplex-6",
  "New-1", "New-2", "New-3", "Ajantha",
  "Sree Padmanabha", "Kripa-1",
];

function getFestivalDay() {
  const today = new Date();
  const start = new Date("2025-12-12");
  const end = new Date("2025-12-19");

  if (today < start) return 1;
  if (today > end) return 8;

  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff + 1; // Day 1 = Dec 12
}




export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

const [day, setDay] = useState(getFestivalDay());
const [selectedVenue, setSelectedVenue] = useState("");
const [selectedShow, setSelectedShow] = useState("");
const [movies, setMovies] = useState([]);
const [loadingMovies, setLoadingMovies] = useState(false);
const [searchText, setSearchText] = useState("");
const [allMovies, setAllMovies] = useState([]);



const filteredMovies = searchText.trim()
  ? movies.filter((m) =>
      m.title.toLowerCase().includes(searchText.toLowerCase())
    )
  : movies;


  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  const fetchMovies = async () => {
  setLoadingMovies(true);

  const conditions = [where("day", "==", day)];

  if (selectedVenue !== "") {
    conditions.push(where("theatre", "==", selectedVenue));
  }

  if (selectedShow !== "") {
    conditions.push(where("show", "==", Number(selectedShow)));
  }

  const showsQ = query(collection(db, "shows"), ...conditions);
  const showsSnap = await getDocs(showsQ);
  const showEntries = showsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const movieDocs = await Promise.all(
  showEntries
    .filter(show => show.movieId) // ignore empty slots
    .map(async (show) => {
      const movieSnap = await getDoc(doc(db, "movies", show.movieId));
      return {
        id: show.movieId,
        ...movieSnap.data(),
        theatre: show.theatre,
        time: show.time,
      };
    })
);

  setMovies(movieDocs);
  setLoadingMovies(false);
};



  if (!user) return null; // wait until auth known

  return (
    
    <div className="space-y-6">
      <Navbar />

      {/* Date + Show filter */}
      <div className="flex flex-wrap gap-2 mt-2 sticky top-0 bg-gray-950 z-20 pb-2">

  {/* Day */}
  <select
    className="bg-gray-800 rounded-lg px-3 py-2 text-sm"
    value={day}
    onChange={(e) => setDay(Number(e.target.value))}
  >
    {[1,2,3,4,5,6,7,8].map((d) =>
      <option key={d} value={d}>Day {d}</option>
    )}
  </select>

  {/* Venue */}
  <select
    className="bg-gray-800 rounded-lg px-3 py-2 text-sm"
    value={selectedVenue}
    onChange={(e) => setSelectedVenue(e.target.value || null)}
  >
    <option value="">All Venues</option>
    {venues.map((v) =>
      <option key={v} value={v}>{v}</option>
    )}
  </select>

  {/* Show Slot */}
  <select
    className="bg-gray-800 rounded-lg px-3 py-2 text-sm"
    value={selectedShow}
    onChange={(e)=>setSelectedShow(e.target.value)}
  >
    <option value="">All Shows</option>
    {[1,2,3,4,5].map((s) =>
      <option key={s} value={s}>Show {s}</option>
    )}
  </select>

  <button
    onClick={fetchMovies}
    className="bg-indigo-600 rounded-lg px-4 py-2 text-sm font-semibold"
  >
    Load
  </button>
</div>



      {/* Cards */}
      {loadingMovies && <p>Loading…</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredMovies.map((m) => (
          <Link
            href={`/movies/${m.id}`}
            key={m.id}
            className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg shadow-black/30 hover:scale-[1.02] transition-transform"
          >
            {m.posterUrl ? (
              <div className="relative">
                <img src={m.posterUrl} className="w-full h-72 object-cover rounded-xl shadow-lg"/>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
                <p className="absolute bottom-1 left-1 text-[10px] bg-indigo-600 rounded px-1">
                  {m.theatre}
                </p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-xs">
                No Poster
              </div>
            )}

            <div className="p-3 space-y-1">
              <h2 className="text-base font-semibold">{m.title}</h2>
              <p className="text-[12px] text-gray-400 h-[36px] line-clamp-2">
                {m.synopsis || "No synopsis available"}
              </p>

              {/* Ratings */}
              {m.externalRating || m.userAverageRating ? (
                <>
                  {m.externalRating && (
                    <p className="text-[11px] text-gray-300">
                      ⭐ {m.externalRating.toFixed(1)} — Critics
                    </p>
                  )}
                  {m.userAverageRating > 0 && (
                    <p className="text-[11px] text-gray-300">
                      ⭐ {m.userAverageRating.toFixed(1)} — Users
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-gray-500">No reviews yet</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
