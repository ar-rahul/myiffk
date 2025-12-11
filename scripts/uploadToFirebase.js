const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ---- INITIALIZE FIREBASE ----
admin.initializeApp({
  credential: admin.credential.cert(
    require(path.join(__dirname, "../service-account.json"))
  ),
});
const db = admin.firestore();

// ---- LOAD JSON FILES ----
const movies = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/cleanMovies.json")));
const shows = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/showsWithIds.json")));

(async () => {
  console.log("🚀 Uploading movies...");

  for (const movie of movies) {
    if (!movie.movieId) {
      console.log("⚠️ Movie missing movieId:", movie.title);
      continue;
    }

    await db.collection("movies").doc(movie.movieId).set(movie);
  }

  console.log(`✅ Uploaded ${movies.length} movies.`);

  console.log("🚀 Uploading shows...");

  for (const show of shows) {
    if (!show.movieId) {
      console.log("⚠️ Show missing movieId:", show.title);
      continue;
    }

    const showId = `${show.day}-${show.theatre}-${show.show}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.collection("shows").doc(showId).set(show);
  }

  console.log(`✅ Uploaded ${shows.length} shows.`);
  console.log("🎉 ALL DONE!");
  process.exit(0);
})();

