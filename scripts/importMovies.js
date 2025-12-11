/**
 * Firestore Movie Importer
 * Usage:
 *   node importMovies.js
 *
 * Requirements:
 *   - master_movies.json in same folder
 *   - serviceAccountKey.json (Firebase Admin SDK key)
 */

const fs = require("fs");
const admin = require("firebase-admin");
const path = require("path");

// ---------------------------
// 1. INITIALIZE FIREBASE ADMIN
// ---------------------------
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ---------------------------
// 2. LOAD MOVIES JSON
// ---------------------------
const moviesPath = path.join(__dirname, "master_movies.json");
const movies = JSON.parse(fs.readFileSync(moviesPath, "utf8"));

// ---------------------------
// 3. SLUGIFY TITLE → DOCUMENT ID
// ---------------------------
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
    .trim()
    .replace(/\s+/g, "-");         // spaces → hyphens
}

// ---------------------------
// 4. UPLOAD FUNCTION
// ---------------------------
async function uploadMovies() {
  console.log(`\n📽  TOTAL MOVIES TO IMPORT: ${movies.length}\n`);

  let success = 0;
  let skipped = 0;

  for (const movie of movies) {
    if (!movie.title || movie.title.trim() === "") {
      console.log("⚠️  Skipping entry with no title.");
      skipped++;
      continue;
    }

    const id = slugify(movie.title);
    const ref = db.collection("movies").doc(id);

    try {
      await ref.set(movie, { merge: true });

      console.log(`✔ Imported: ${movie.title}  →  ID: ${id}`);
      success++;
    } catch (err) {
      console.error(`❌ Error importing ${movie.title}:`, err);
      skipped++;
    }
  }

  console.log("\n===============================");
  console.log("🎉 IMPORT COMPLETE");
  console.log("===============================");
  console.log(`✔ Successfully imported: ${success}`);
  console.log(`⚠️ Skipped / Failed: ${skipped}`);
  console.log("===============================\n");

  process.exit(0);
}

uploadMovies();

