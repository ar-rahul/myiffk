const admin = require("firebase-admin");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json"))
});

const db = admin.firestore();

const shows = require("./mergedShows.json");

async function upload() {
  const batch = db.batch();

  shows.forEach(show => {
    const id = `${show.day}-${show.theatre}-${show.show}`.replace(/[^a-zA-Z0-9-]/g,"");
    const ref = db.collection("shows").doc(id);
    batch.set(ref, show);
  });

  await batch.commit();
  console.log("🎉 All shows uploaded!");
}

upload();

