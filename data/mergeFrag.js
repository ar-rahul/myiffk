const fs = require("fs");

// Load messy file
const raw = fs.readFileSync("moviejsonsCombined.json", "utf8");

// Extract EVERY { ... } JSON object using regex
const objects = raw.match(/\{[\s\S]*?\}/g);

if (!objects) {
  console.error("❌ No JSON objects found in file!");
  process.exit(1);
}

console.log("Found movie objects:", objects.length);

// Parse each object safely
const movies = [];

objects.forEach((obj, i) => {
  try {
    const json = JSON.parse(obj);
    movies.push(json);
  } catch (e) {
    console.log(`❌ Failed to parse object #${i}:`, e.message);
  }
});

// Save final array
fs.writeFileSync("mergedMovies.json", JSON.stringify(movies, null, 2));

console.log("🎉 mergedMovies.json created successfully!");
console.log(`Total movies added: ${movies.length}`);

