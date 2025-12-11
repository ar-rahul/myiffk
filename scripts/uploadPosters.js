import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import Fuse from "fuse.js";

// ---------- FIREBASE INIT ----------
const serviceAccount = JSON.parse(
  fs.readFileSync("../serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // IMPORTANT: use correct bucket name for your Firebase project
  storageBucket: "gs://iffk-35752.app.firebasestorage"   // ← CHANGE IF NEEDED
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// ---------- LOAD MOVIES + POSTER FILENAMES ----------
const movies = JSON.parse(fs.readFileSync("../data/cleanMovies.json", "utf8"));

const posterFiles = fs
  .readFileSync("../data/filenames.txt", "utf8")
  .split("\n")
  .map((f) => f.trim())
  .filter((f) => f.toLowerCase().endsWith(".jpg"));

// ---------- HELPERS ----------
function normalizeTitle(title) {
  if (!title) return "";

  return title
    .split("/")[0]                 // take only first part
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-zA-Z0-9 ]/g, "") // remove punctuation
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}



function normalize(str) {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toLowerCase();
}

// Create a list of searchable poster names (without extension)
const posterData = posterFiles.map((f) => ({
  file: f,
  base: normalize(f.replace(/\.[^/.]+$/, "")) // remove .jpg
}));

// Initialize Fuse
const fuse = new Fuse(posterData, {
  keys: ["base"],
  includeScore: true,
  threshold: 0.4    // lower = stricter, 0.4 is good for titles
});

function findPosterFile(title) {
  const query = normalize(title.split("/")[0]);

  const result = fuse.search(query);

  if (result.length === 0) return null;

  // return the best match
  return result[0].item.file;
}

// ---------- MAIN ----------
(async () => {
  console.log("🚀 Starting poster upload...");

  let matched = 0;
  let unmatched = [];

  for (const movie of movies) {
    // ---- SAFETY: movie must have ID ----
    // ---- SAFETY: movie must have movieId ----
    if (!movie.movieId || typeof movie.movieId !== "string") {
      console.log("❌ Movie missing movieId, skipping:", movie.title);
      continue;
    }


    const posterFile = findPosterFile(movie.title);

    if (!posterFile) {
      unmatched.push(movie.title);
      continue;
    }

    const localPath = path.join("../data/posters", posterFile);
    const remotePath = `posters/${posterFile}`;

    // Upload to Firebase Storage
    await bucket.upload(localPath, {
      destination: remotePath,
      public: true,
      metadata: { cacheControl: "public,max-age=31536000" }
    });

    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;

    // Update movie
    await db.collection("movies").doc(movie.movieId).update({
    posterUrl: fileUrl
    });


    matched++;
    console.log(`✓ ${movie.title} → ${posterFile}`);
  }

  console.log(`\n🎉 POSTERS LINKED: ${matched}`);
  console.log(`⚠️ MISSING POSTERS: ${unmatched.length}`);
  console.log(unmatched);
})();

