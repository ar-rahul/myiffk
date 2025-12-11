"use client";

import { Suspense } from "react";
import MoviesPageContent from "./MoviesPageContent";

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 p-4">Loading…</div>}>
      <MoviesPageContent />
    </Suspense>
  );
}
