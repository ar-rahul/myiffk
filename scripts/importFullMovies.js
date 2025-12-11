const admin = require("firebase-admin");
const fs = require("fs");
const slugify = require("slugify");

// Load service account
admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json"))
});

const db = admin.firestore();

// Load your movies JSON
const movies = JSON.parse(fs.readFileSync("../data/mergedMovies.json", "utf8"));

// Function to create document ID from title
const makeId = (title) =>
  slugify(title, {
    lower: true,
    strict: true, // removes special chars
    remove: /[*+~.()'"!:@]/g
  });

async function importMovies() {
  for (const movie of movies) {
    const docId = makeId(movie.title);

    console.log("Uploading:", docId);

    await db.collection("movies").doc(docId).set(movie, { merge: true });
  }

  console.log("🎉 Import completed!");
}

importMovies();

