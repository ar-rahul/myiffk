// app/admin/page.jsx
"use client";
import { uploadDay1Movies } from "@/scripts/day1Upload";

export default function AdminPage() {
  return (
    <button
      onClick={uploadDay1Movies}
      className="bg-green-600 px-4 py-2 rounded"
    >
      Upload Day 1 Movies
    </button>
  );
}
