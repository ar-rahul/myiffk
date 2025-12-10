"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      // Movie metadata
      const movieSnap = await getDoc(doc(db, "movies", id));
      if (movieSnap.exists()) setMovie(movieSnap.data());

      // Screening schedule
      const q = query(collection(db, "shows"), where("movieId", "==", id));
      const showSnap = await getDocs(q);
      const shows = showSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      setShowtimes(shows);
      setLoading(false);
    }
    fetchMovie();
  }, [id]);

  if (loading) return <p className="text-gray-400 p-4">Loading…</p>;
  if (!movie) return <p className="text-red-400 p-4">Movie not found</p>;

  return (
    <div className="min-h-screen pb-10">
      <Navbar />

      {/* Poster */}
      {movie.posterUrl ? (
        <div className="relative w-full h-72 bg-black">
          <img
            src={movie.posterUrl}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/90" />
        </div>
      ) : (
        <div className="h-64 bg-gray-800" />
      )}

      {/* Info Section */}
      <div className="px-4 mt-3 space-y-1">
        <h1 className="text-2xl font-semibold text-white">{movie.title}</h1>

        {movie.category && (
          <span className="text-xs bg-indigo-600 px-2 py-[2px] rounded-full uppercase tracking-wider">
            {movie.category}
          </span>
        )}

        {movie.synopsis && (
          <p className="text-[13px] mt-2 text-gray-300 leading-5">
            {movie.synopsis}
          </p>
        )}

        {movie.externalLink && (
          <a
            href={movie.externalLink}
            target="_blank"
            className="text-xs text-indigo-400 underline mt-2 block"
          >
            View on Letterboxd →
          </a>
        )}
      </div>

      {/* Showtimes */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-gray-100 mb-2">Screenings</h2>
        <div className="space-y-2">
          {showtimes.map((s) => (
            <div
              key={s.id}
              className="bg-gray-900 rounded-lg px-3 py-2 flex justify-between text-sm"
            >
              <span className="text-gray-200">{s.theatre}</span>
              <span className="text-indigo-400">{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
