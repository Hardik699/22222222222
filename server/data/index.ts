import * as fileStore from "./store";

let selected: any = fileStore;
const HAS_DB = Boolean(
  process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
);

if (HAS_DB) {
  try {
    const pgStore = await import("./postgres");
    selected = pgStore;
  } catch (err) {
    console.error(
      "Failed to load Postgres store, falling back to file store:",
      err,
    );
    selected = fileStore;
  }
}

export const db = selected.db;
