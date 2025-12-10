import fs from "fs";
import path from "path";
import admin from "firebase-admin";

// Load existing Admin initialization
const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccountKey.json", "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function importShows() {
  const showsPath = path.join(process.cwd(), "shows.generated.json");
  const mapPath = path.join(process.cwd(), "movieTitleToId.json");

  const shows = JSON.parse(fs.readFileSync(showsPath, "utf-8"));
  const titleToId = JSON.parse(fs.readFileSync(mapPath, "utf-8"));

  const col = db.collection("shows");

  let missing = 0;
  let count = 0;

  for (const s of shows) {
    const movieId = titleToId[s.movieTitle];

    if (!movieId) {
      console.warn("⚠ Missing movieId for:", s.movieTitle);
      missing++;
      continue;
    }

    await col.add({
      movieId,
      day: s.day,
      show: s.show,
      theatre: s.theatre,
      time: s.time,
      createdAt: new Date(),
    });

    count++;
    console.log(
      `Added: ${s.movieTitle} | Day ${s.day} | ${s.theatre} | ${s.time}`
    );
  }

  console.log(`\n🎯 Shows Imported: ${count}`);
  console.log(`⚠ Missing movie references: ${missing}`);
}

importShows().catch(console.error);

