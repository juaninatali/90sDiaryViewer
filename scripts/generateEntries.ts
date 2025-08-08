import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// Config
const INPUT_CSV = path.join(__dirname, "../data/diary.csv");
const OUTPUT_DIR = path.join(__dirname, "../content/entries");
const LOG_FILE = path.join(__dirname, "../logs/generation.log");

// Ensure output and log directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

const logStream = fs.createWriteStream(LOG_FILE, { flags: "w" });
function log(message: string) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}`;
    console.log(line);
    logStream.write(line + "\n");
}

// Load CSV
const csvData = fs.readFileSync(INPUT_CSV, "utf8").replace(/^\uFEFF/, "");
const records = parse(csvData, {
    columns: ["id", "date", "title", "location", "tags", "text", "images"],
    skip_empty_lines: true,
});

let errorCount = 0;

// Process and write JSON files
for (const record of records) {
    const id = record.id?.trim();
    const title = record.title?.trim();
    const date = record.date?.trim();
    const text = record.text?.replace(/\\n/g, "\n");
    const imageFilenames = record.images
        ? record.images
              .split(";")
              .map((img: string) => img.trim())
              .filter((img: string) => img !== "")
        : [];

    // Validation
    if (!id) {
        const msg = "❌ Skipping entry: Missing ID.";
        log(`${msg} ${JSON.stringify(record)}`);
        errorCount++;
        continue;
    }
    if (!title || !date || !text) {
        const msg = `❌ Entry ${id} is missing required fields (title, date, or text).`;
        log(msg);
        errorCount++;
        continue;
    }

    // Check if images exist (in /public/images)
    const missingImages = imageFilenames.filter((filename: string) => {
        const imagePath = path.join(__dirname, "../public/images", filename.replace(/^\/images\//, ""));
        return !fs.existsSync(imagePath);
    });

    if (missingImages.length > 0) {
        log(`⚠️ Entry ${id} references missing image(s): ${missingImages.join(", ")}`);
    }

    const entry = {
        id,
        title,
        date,
        location: record.location?.trim() || "",
        tags: record.tags?.split(";").map((tag: string) => tag.trim()) || [],
        text,
        images: imageFilenames.map((img: string) => "/images/" + img),
    };

    const outputPath = path.join(OUTPUT_DIR, `${id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(entry, null, 2), "utf8");
    log(`✅ Wrote entry: ${outputPath}`);
}

if (errorCount > 0) {
    log(`\n⚠️ Completed with ${errorCount} error(s). Fix and re-run.`);
} else {
    log("\n🎉 All entries generated successfully.");
}

logStream.end();
