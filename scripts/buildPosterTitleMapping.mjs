import fs from "fs";
import path from "path";

// 1) Load title→id map from earlier import
const mappingPath = path.join(process.cwd(), "movieTitleToId.json");
const titleToId = JSON.parse(fs.readFileSync(mappingPath, "utf8"));

// 2) Poster folder
const postersDir = path.join(process.cwd(), "data/posters");

// --- Helpers ---

function formatTitleFromFilename(base) {
  // base: "The_Sun_Rises_on_Us_All"
  const withSpaces = base.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  // Title Case (keep accents if any exist)
  return withSpaces.replace(/\b(\w)(\w*)/g, (_, first, rest) => {
    return first.toUpperCase() + rest.toLowerCase();
  });
}

function normalizeForCompare(str) {
  return str
    .toLowerCase()
    .normalize("NFKD")                  // split accents
    .replace(/[\u0300-\u036f]/g, "")    // drop diacritics for comparison only
    .replace(/[^a-z0-9]+/g, " ")        // non-alphanum → space
    .replace(/\s+/g, " ")               // collapse spaces
    .trim();
}

async function main() {
  const files = fs.readdirSync(postersDir).filter((f) => f.toLowerCase().endsWith(".jpg"));

  console.log(`🖼 Found ${files.length} poster files`);

  const existingTitles = Object.keys(titleToId);
  const normalizedTitleMap = new Map();

  // Build normalized map of existing Firestore titles
  for (const t of existingTitles) {
    const norm = normalizeForCompare(t);
    if (!normalizedTitleMap.has(norm)) {
      normalizedTitleMap.set(norm, t);
    }
  }

  const result = [];

  for (const file of files) {
    const base = file.replace(/\.jpg$/i, "");
    const posterTitle = formatTitleFromFilename(base);
    const normPoster = normalizeForCompare(posterTitle);

    const matchedExistingTitle = normalizedTitleMap.get(normPoster) || null;
    const movieId = matchedExistingTitle ? titleToId[matchedExistingTitle] : null;

    const status = matchedExistingTitle ? "matched" : "no_match";

    result.push({
      file,
      posterTitle,
      matchedExistingTitle,
      movieId,
      status,
    });

    console.log(
      `${status === "matched" ? "✅" : "⚠️"} ${file} → "${posterTitle}"` +
        (matchedExistingTitle ? `  (matched: "${matchedExistingTitle}")` : "  (no match)")
    );
  }

  const outPath = path.join(process.cwd(), "poster_title_mapping.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\n📄 Written mapping to: ${outPath}`);
}

main().catch(console.error);

