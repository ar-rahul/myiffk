const fs = require("fs");

const movies = JSON.parse(fs.readFileSync("cleanMovies.json", "utf8"));
const shows = JSON.parse(fs.readFileSync("mergedShows.json", "utf8"));

// Normalize titles for matching
function normalize(title) {
  if (!title || typeof title !== "string") return "";
  
  return title
    .split("/")[0]          // take first part before slash
    .replace(/\s+/g, " ")   // collapse spaces
    .trim()
    .toLowerCase();
}

// Build lookup: normalizedTitle → movieId
const movieMap = {};
movies.forEach((m) => {
  const key = normalize(m.title);
  if (key) movieMap[key] = m.movieId;
});

// Attach movieId to each show
const unmatched = [];

shows.forEach((s) => {
  const key = normalize(s.title || s.movieTitle);

  if (!key) {
    unmatched.push(s);
    s.movieId = null;
    return;
  }

  const movieId = movieMap[key];

  if (!movieId) {
    unmatched.push(s);
    s.movieId = null;
  } else {
    s.movieId = movieId;
  }
});

// Save result
fs.writeFileSync("showsWithIds.json", JSON.stringify(shows, null, 2));
console.log("🎉 showsWithIds.json created!");

// Report issues
console.log("\n⚠️ UNMATCHED SHOW ENTRIES:", unmatched.length);
unmatched.slice(0, 20).forEach(u => console.log(" -", u.title || u.movieTitle));
if (unmatched.length > 20) console.log(`... +${unmatched.length-20} more`);

