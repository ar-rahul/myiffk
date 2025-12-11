// generateMovieIds.js
const fs = require("fs");
const slugify = str =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const movies = JSON.parse(fs.readFileSync("mergedMovies.json", "utf8"));

// assign movieId to each movie
movies.forEach(m => {
  m.movieId = slugify(m.title);
});

// save
fs.writeFileSync("moviesWithIds.json", JSON.stringify(movies, null, 2));
console.log("🎉 moviesWithIds.json created with stable movieId fields");

