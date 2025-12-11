const fs = require("fs");

const raw = fs.readFileSync("splitshows.json", "utf8");

// Extract all JSON objects inside { ... }
const objects = raw.match(/\{[\s\S]*?\}/g);

if (!objects) {
  console.error("❌ No show objects found!");
  process.exit(1);
}

console.log("Found show objects:", objects.length);

const shows = [];

objects.forEach((obj, i) => {
  try {
    const json = JSON.parse(obj);
    shows.push(json);
  } catch (err) {
    console.log(`❌ Could not parse object #${i}:`, err.message);
  }
});

// Save final clean array
fs.writeFileSync("mergedShows.json", JSON.stringify(shows, null, 2));

console.log("🎉 mergedShows.json created!");
console.log("Total valid shows:", shows.length);

