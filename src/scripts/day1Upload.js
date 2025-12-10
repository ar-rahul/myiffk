import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const moviesDay1 = [
  { title: "Mariana's Room", theatre: "Kairali", show: 1, time: "10:00 AM" },
  { title: "The Sun Rises on Us All", theatre: "Kairali", show: 2, time: "12:30 PM" },

  { title: "Fragments from the East", theatre: "Sree", show: 1, time: "10:15 AM" },
  { title: "Untamable", theatre: "Sree", show: 2, time: "12:30 PM" },

  { title: "Alexandria Again and Forever", theatre: "Nila", show: 1, time: "10:00 AM" },
  { title: "The Blue Trail", theatre: "Nila", show: 2, time: "12:15 PM" },

  { title: "The Virgin of the Quarry Lake", theatre: "Kalabhavan", show: 1, time: "10:00 AM" },
  { title: "Nino", theatre: "Kalabhavan", show: 2, time: "12:00 Noon" },

  { title: "Beef", theatre: "Tagore", show: 1, time: "9:30 AM" },
  { title: "Chopin, a Sonata in Paris", theatre: "Tagore", show: 2, time: "12:00 Noon" },

  { title: "Palestine 36 – Opening Film", theatre: "Nishagandhi", show: 1, time: "6:00 PM" }
];

function toSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function uploadDay1Movies() {
  for (const m of moviesDay1) {
    await addDoc(collection(db, "movies"), {
      title: m.title,
      theatre: m.theatre,
      synopsis: "",
      posterUrl: "",
      
      schedule: {
        day: 1,
        show: m.show
      },

      time: m.time,

      externalLink: `https://letterboxd.com/film/${toSlug(m.title)}/`,

      externalRating: null,
      userAverageRating: 0,
      userRatingCount: 0,
      externalReviews: [],

      createdAt: serverTimestamp()
    });

    console.log("Uploaded:", m.title);
  }
}
