import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

const SCHEDULE_FILE = path.join(process.cwd(), "data", "iffkschedule.xlsx");

const THEATRES = new Set([
  "Kairali","Sree","Nila","Kalabhavan","Tagore","Nishagandhi",
  "Ariesplex-1","Ariesplex-4","Ariesplex-6",
  "New-1","New-2","New-3",
  "Ajantha","Sree Padmanabha","Kripa-1",
]);

function normTitle(x) {
  return x?.trim().replace(/\s+/g, " ") ?? "";
}

function makeSlug(title) {
  let base = title.split("/")[0];
  base = base.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['’"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base;
}

function buildExternalLink(title) {
  const slug = makeSlug(title);

  if (!slug) return "";

  // Reject slugs that are only numbers or hyphens
  if (/^[-\d]+$/.test(slug)) return "";

  // Reject single-letter or too-short slugs
  if (slug.length < 2) return "";

  return `https://letterboxd.com/film/${slug}/`;
}


function parseCell(cellText) {
  const lines = (cellText || "")
    .toString()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!lines.length) return { title: "", time: "" };

  const title = normTitle(lines[0]);

  // Find a line that looks like a time: "10:00 AM", "12:00 Noon", etc.
  let time = "";
  for (const l of lines) {
    if (/\b\d{1,2}:\d{2}\s*(AM|PM)\b/i.test(l)) {
      time = l.trim();
      break;
    }
    if (/noon/i.test(l)) {
      time = l.trim();
      break;
    }
  }

  // Fallback: if nothing matched, keep last line (just in case)
  if (!time) {
    time = normTitle(lines[lines.length - 1]);
  }

  return { title, time };
}


async function main() {
  if (!fs.existsSync(SCHEDULE_FILE)) {
    console.error("Missing Excel:", SCHEDULE_FILE);
    process.exit(1);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SCHEDULE_FILE);

  const moviesMap = new Map();
  const shows = [];
  const unknownTheatres = new Set();

  for (const sheet of wb.worksheets) {
    const name = sheet.name.trim();
    const match = name.match(/^Day\s*(\d+)$/i);
    if (!match) continue;

    const day = Number(match[1]);
    console.log(`→ Reading sheet: ${name} (day ${day})`);

    const headerRow = sheet.getRow(1);
    const showCols = [];

    headerRow.eachCell((cell, colNumber) => {
      const txt = normTitle(cell.value || "");
      const m = txt.match(/^Show\s*(\d+)/i);
      if (m) showCols.push({ col: colNumber, show: Number(m[1]) });
    });

    if (!showCols.length) {
      console.warn("No show headers in", name);
      continue;
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const theatre = normTitle(row.getCell(1).value);
      if (!theatre) return;

      if (!THEATRES.has(theatre)) unknownTheatres.add(theatre);

      for (const { col, show } of showCols) {
        const cellText = row.getCell(col).value;
        if (!cellText) continue;

        const lower = cellText.toString().toLowerCase();
        if (lower.includes("no screening")) continue;
        if (lower.includes("opening film")) continue;
        if (lower.includes("closing")) continue;

        const { title, time } = parseCell(cellText);
        if (!title || !time) continue;

        if (!moviesMap.has(title)) {
          moviesMap.set(title, {
            title,
            externalLink: buildExternalLink(title),
            year: null,
            runtime: null,
            countries: [],
            languages: [],
            category: "",
            posterUrl: "",
          });
        }

        shows.push({ movieTitle: title, day, show, theatre, time });
      }
    });
  }

  const movies = [...moviesMap.values()];
  console.log(`✔ Movies: ${movies.length}`);
  console.log(`✔ Shows: ${shows.length}`);

  if (unknownTheatres.size) {
    console.warn("⚠ Unknown theatres found:");
    for (const t of unknownTheatres) console.warn(" -", t);
  }

  fs.writeFileSync("movies.generated.json", JSON.stringify(movies, null, 2));
  fs.writeFileSync("shows.generated.json", JSON.stringify(shows, null, 2));

  console.log("📁 Output:");
  console.log("  movies.generated.json");
  console.log("  shows.generated.json");
}

main().catch(console.error);

