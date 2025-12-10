"use client";

export default function StarRatingDisplay({ value = 0 }) {
  const fullStars = Math.floor(value);
  const half = value - fullStars >= 0.5;
  const total = 5;

  return (
    <span className="text-yellow-400 text-sm">
      {Array.from({ length: total }).map((_, i) => {
        if (i < fullStars) return "★";
        if (i === fullStars && half) return "☆"; // could customize for half
        return "☆";
      })}
    </span>
  );
}
