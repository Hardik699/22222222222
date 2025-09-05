import * as fileStore from "./store";
import { createRequire } from "module";

const requireCjs = createRequire(import.meta.url);

let selected: any = fileStore;
if (process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pgStore = requireCjs("./postgres");
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
