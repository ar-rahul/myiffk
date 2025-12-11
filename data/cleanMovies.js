import fs from "fs";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\/.*$/, "")          // keep first title before slash
    .replace(/[^\w\s-]/g, "")      // remove punctuation, accents stay
    .trim()
    .replace(/\s+/g, "-");
}

function letterboxdLink(title) {
  const base = slugify(title);
  return base ? `https://letterboxd.com/film/${base}/` : "";
}

// Load merged movies
const raw = JSON.parse(fs.readFileSync("mergedMovies.json", "utf8"));

// Deduplicate by title
const map = new Map();

for (const movie of raw) {
  const key = movie.title.trim();

  if (!map.has(key)) {
    map.set(key, movie);
  } else {
    const existing = map.get(key);

    // Prefer movie with more data fields filled
    const existingScore = Object.values(existing).filter(
      (v) => v !== "" && v !== null
    ).length;

    const newScore = Object.values(movie).filter(
      (v) => v !== "" && v !== null
    ).length;

    if (newScore > existingScore) {
      map.set(key, movie);
    }
  }
}

const deduped = Array.from(map.values());

// Add movieId + externalLink
const finalMovies = deduped.map((m) => ({
  movieId: slugify(m.title),
  externalLink: letterboxdLink(m.title),
  posterUrl: "",
  notes: "",
  ...m,
}));

fs.writeFileSync("cleanMovies.json", JSON.stringify(finalMovies, null, 2));

console.log("🎉 cleanMovies.json created!");
console.log(`Unique movies: ${finalMovies.length}`);

