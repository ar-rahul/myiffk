import fs from "fs";
import path from "path";
import "dotenv/config";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Posters directory
const postersDir = path.join(process.cwd(), "data/posters");

// Helper → Convert filename to clean title
function formatTitle(raw) {
  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(\w)(\w*)/g, (_, first, rest) =>
      first.toUpperCase() + rest.toLowerCase()
    );
}

// Helper → URL slug
function slugify(raw) {
  return raw
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")   // remove invalid URL chars
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadPosters() {
  const files = fs.readdirSync(postersDir).filter(f => f.endsWith(".jpg"));

  console.log(`🖼 Found ${files.length} poster files\n`);
  const reviewList = [];

  for (const file of files) {
    const base = file.replace(".jpg", "");
    const title = formatTitle(base);
    const slug = slugify(base);
    const extUrl = `https://letterboxd.com/film/${slug}/`;

    console.log(`➡ Processing: ${file}`);
    console.log(`   → Title: ${title}`);

    // Find movie by title
    const q = query(collection(db, "movies"), where("title", "==", title));
    const snap = await getDocs(q);

    if (snap.empty) {
      console.warn(`⚠ Movie not found in Firestore: ${title}`);
      reviewList.push({ file, title, reason: "No match in Firestore" });
      continue;
    }

    const movieDoc = snap.docs[0];
    const movieRef = doc(db, "movies", movieDoc.id);

    // Upload poster to Firebase Storage
    const filePath = path.join(postersDir, file);
    const buffer = fs.readFileSync(filePath);
    const refPath = ref(storage, `posters/${file}`);

    await uploadBytes(refPath, buffer);
    const downloadUrl = await getDownloadURL(refPath);

    // Update Firestore movie
    await updateDoc(movieRef, {
      posterUrl: downloadUrl,
      externalLink: extUrl
    });

    console.log(`   ✔ Poster uploaded + Firestore updated\n`);
  }

  fs.writeFileSync(
    "titles_needing_manual_review.json",
    JSON.stringify(reviewList, null, 2)
  );

  console.log("✨ Upload complete!");
  console.log(
    `📌 Titles needing review: ${reviewList.length} saved to titles_needing_manual_review.json`
  );
}

uploadPosters().catch(console.error);

