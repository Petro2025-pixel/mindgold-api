import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Quiz } from "../models/Quiz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Mapping: quiz slug → { category, tags }
 */
const MIGRATION_MAP = {
  "104-105": {
    category: "deutsch-b1",
    tags: ["lexik", "b1"],
  },
  "deutsch-ukrainisch_104-105": {
    category: "deutsch-b1",
    tags: ["lexik", "b1", "ukrainisch"],
  },
  "deutsche konnektoren": {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "konnektoren"],
  },
  "grammatik_passiv mit modalverben": {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "passiv", "modalverben"],
  },
  "passiv perfekt": {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "passiv", "perfekt"],
  },
  "passiv präteritum": {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "passiv", "präteritum"],
  },
  passiv_präsens: {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "passiv", "präsens"],
  },
  plusquamperfekt: {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "plusquamperfekt"],
  },
  rhythmusliste: {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "verben"],
  },
  "werden-passiv_prozesse": {
    category: "deutsch-b1",
    tags: ["grammatik", "b1", "passiv", "werden"],
  },
  "1_allgemeines_orientierungswissen": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "2_stellenwert_sprache_bildung": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "3_arbeit_wirtschaft": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "4_gesundheit": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "5_wohnen_nachbarschaft": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "6_prinzipien_zusammenleben_rechtlich": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "7_vielfalt_zusammenleben_kulturell": {
    category: "austria",
    tags: ["integration", "b1"],
  },
  "österreich: politik und kommune vokabeln": {
    category: "austria",
    tags: ["integration", "vokabeln"],
  },
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.\n");

    let updated = 0;
    let notFound = 0;

    for (const [slug, data] of Object.entries(MIGRATION_MAP)) {
      const result = await Quiz.updateOne(
        { slug },
        { $set: { category: data.category, tags: data.tags } },
      );

      if (result.matchedCount === 0) {
        console.log(`⚠️  Not found: ${slug}`);
        notFound++;
      } else if (result.modifiedCount > 0) {
        console.log(`✅ ${slug} → ${data.category}`);
        updated++;
      } else {
        console.log(`⏭️  ${slug} — already up-to-date`);
      }
    }

    console.log(`\n🎉 Updated: ${updated}, Not found: ${notFound}`);
    console.log(`Total quizzes in DB: ${await Quiz.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrate();
