import fs from "fs";
import path from "path";
import admin from "firebase-admin";

// Load service account
const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccountKey.json", "utf-8")
);

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function importMovies() {
  const filePath = path.join(process.cwd(), "movies.generated.json");
  const movies = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const col = db.collection("movies");
  const titleToId = {};

  for (const m of movies) {
    const title = (m.title || "").trim();
    if (!title) continue;

    const docRef = await col.add({
      title,
      externalLink: typeof m.externalLink === "string" ? m.externalLink : "",
      createdAt: new Date()
    });

    titleToId[title] = docRef.id;
    console.log("Added:", title, "=>", docRef.id);
  }

  fs.writeFileSync(
    "movieTitleToId.json",
    JSON.stringify(titleToId, null, 2)
  );

  console.log("\n🎯 movieTitleToId.json saved!");
}

importMovies().catch(console.error);

